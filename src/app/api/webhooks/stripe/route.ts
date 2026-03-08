import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { env } from "@/lib/env";
import { db } from "@/lib/db";
import { subscriptions, organizations } from "@/lib/db/schema/organizations";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

const GRACE_PERIOD_DAYS = 7;

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orgId = session.metadata?.organizationId;
  const planId = session.metadata?.planId;
  const stripeSubscriptionId = session.subscription as string;

  if (!orgId || !planId || !stripeSubscriptionId) return;

  const stripe = getStripe();
  const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);

  // In Stripe clover API, period dates are on subscription items
  const firstItem = stripeSub.items.data[0];
  const periodStart = firstItem?.current_period_start;
  const periodEnd = firstItem?.current_period_end;

  const subData = {
    organizationId: orgId,
    planId,
    status: stripeSub.status === "active" ? "active" : "trialing",
    stripeCustomerId: session.customer as string,
    stripeSubscriptionId,
    stripePriceId: firstItem?.price?.id ?? null,
    currentPeriodStart: periodStart ? new Date(periodStart * 1000) : null,
    currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
    trialEnd: stripeSub.trial_end ? new Date(stripeSub.trial_end * 1000) : null,
    updatedAt: new Date(),
  };

  // Upsert subscription — unique constraint on organization_id prevents duplicates (CR-1/CR-2 fix)
  await db
    .insert(subscriptions)
    .values(subData)
    .onConflictDoUpdate({
      target: subscriptions.organizationId,
      set: subData,
    });

  // Update organization planId and persist Stripe customer ID
  await db
    .update(organizations)
    .set({
      planId,
      status: "active",
      stripeCustomerId: session.customer as string,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, orgId));
}

async function handleSubscriptionUpdated(stripeSub: Stripe.Subscription) {
  const [sub] = await db
    .select({ id: subscriptions.id, organizationId: subscriptions.organizationId })
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSub.id))
    .limit(1);

  if (!sub) return;

  let status: string;
  switch (stripeSub.status) {
    case "active":
      status = "active";
      break;
    case "trialing":
      status = "trialing";
      break;
    case "past_due":
      status = "past_due";
      break;
    case "canceled":
    case "unpaid":
      status = "cancelled";
      break;
    default:
      status = stripeSub.status;
  }

  const item = stripeSub.items.data[0];
  const pStart = item?.current_period_start;
  const pEnd = item?.current_period_end;

  await db
    .update(subscriptions)
    .set({
      status,
      currentPeriodStart: pStart ? new Date(pStart * 1000) : null,
      currentPeriodEnd: pEnd ? new Date(pEnd * 1000) : null,
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
      trialEnd: stripeSub.trial_end ? new Date(stripeSub.trial_end * 1000) : null,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, sub.id));

  // Suspend org if cancelled
  if (status === "cancelled") {
    await db
      .update(organizations)
      .set({ status: "suspended", updatedAt: new Date() })
      .where(eq(organizations.id, sub.organizationId));
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subDetails = (invoice as any).subscription_details;
  const stripeSubId: string | null = typeof subDetails?.subscription === "string"
    ? subDetails.subscription
    : subDetails?.subscription?.id ?? null;
  if (!stripeSubId) return;

  const [sub] = await db
    .select({ id: subscriptions.id, organizationId: subscriptions.organizationId })
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubId))
    .limit(1);

  if (!sub) return;

  // Set grace period
  const gracePeriodEnd = new Date();
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + GRACE_PERIOD_DAYS);

  await db
    .update(subscriptions)
    .set({ status: "past_due", gracePeriodEnd, updatedAt: new Date() })
    .where(eq(subscriptions.id, sub.id));
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subDetails = (invoice as any).subscription_details;
  const stripeSubId: string | null = typeof subDetails?.subscription === "string"
    ? subDetails.subscription
    : subDetails?.subscription?.id ?? null;
  if (!stripeSubId) return;

  const [sub] = await db
    .select({ id: subscriptions.id, organizationId: subscriptions.organizationId })
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubId))
    .limit(1);

  if (!sub) return;

  // Clear grace period, reactivate
  await db
    .update(subscriptions)
    .set({ status: "active", gracePeriodEnd: null, updatedAt: new Date() })
    .where(eq(subscriptions.id, sub.id));

  await db
    .update(organizations)
    .set({ status: "active", updatedAt: new Date() })
    .where(eq(organizations.id, sub.organizationId));
}

async function handleSubscriptionDeleted(stripeSub: Stripe.Subscription) {
  const [sub] = await db
    .select({ id: subscriptions.id, organizationId: subscriptions.organizationId })
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSub.id))
    .limit(1);

  if (!sub) return;

  await db
    .update(subscriptions)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(subscriptions.id, sub.id));

  await db
    .update(organizations)
    .set({ status: "suspended", updatedAt: new Date() })
    .where(eq(organizations.id, sub.organizationId));
}

export async function POST(request: NextRequest) {
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
    }
  } catch (err) {
    console.error(`Webhook handler error for ${event.type}:`, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
