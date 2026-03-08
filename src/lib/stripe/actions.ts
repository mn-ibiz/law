"use server";

import { db } from "@/lib/db";
import { organizations, subscriptions, plans } from "@/lib/db/schema/organizations";
import { getTenantContext } from "@/lib/auth/get-session";
import { eq, and } from "drizzle-orm";
import { safeAction } from "@/lib/utils/safe-action";
import { getStripe, isStripeConfigured } from "./client";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

async function getOrCreateStripeCustomer(orgId: string): Promise<string> {
  const stripe = getStripe();

  // Check if org already has a Stripe customer (stored on organizations table, not subscriptions)
  const [org] = await db
    .select({
      name: organizations.name,
      email: organizations.email,
      stripeCustomerId: organizations.stripeCustomerId,
    })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  if (!org) throw new Error("Organization not found");
  if (org.stripeCustomerId) return org.stripeCustomerId;

  const customer = await stripe.customers.create({
    name: org.name,
    email: org.email ?? undefined,
    metadata: { organizationId: orgId },
  });

  // Persist Stripe customer ID on the organization (always exists, no race with subscriptions)
  await db
    .update(organizations)
    .set({ stripeCustomerId: customer.id, updatedAt: new Date() })
    .where(eq(organizations.id, orgId));

  return customer.id;
}

export async function createCheckoutSession(planSlug: string) {
  return safeAction(async () => {
    if (!isStripeConfigured()) {
      return { error: "Billing is not configured." };
    }

    const { organizationId } = await getTenantContext();
    const stripe = getStripe();

    // Get the target plan
    const [plan] = await db
      .select()
      .from(plans)
      .where(and(eq(plans.slug, planSlug), eq(plans.isActive, true)))
      .limit(1);

    if (!plan) return { error: "Plan not found." };

    const customerId = await getOrCreateStripeCustomer(organizationId);

    const headersList = await headers();
    const origin = headersList.get("origin") ?? "";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: plan.currency.toLowerCase(),
            product_data: {
              name: `${plan.name} Plan`,
              description: plan.description ?? undefined,
            },
            unit_amount: Math.round(Number(plan.monthlyPrice ?? 0) * 100),
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      metadata: {
        organizationId,
        planId: plan.id,
      },
      success_url: `${origin}/settings/subscription?success=true`,
      cancel_url: `${origin}/settings/subscription?cancelled=true`,
    });

    return { data: { url: session.url } };
  });
}

export async function createBillingPortalSession() {
  return safeAction(async () => {
    if (!isStripeConfigured()) {
      return { error: "Billing is not configured." };
    }

    const { organizationId } = await getTenantContext();
    const stripe = getStripe();

    const customerId = await getOrCreateStripeCustomer(organizationId);

    const headersList = await headers();
    const origin = headersList.get("origin") ?? "";

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/settings/subscription`,
    });

    return { data: { url: session.url } };
  });
}

export async function getSubscriptionStatus() {
  return safeAction(async () => {
    const { organizationId } = await getTenantContext();

    const [sub] = await db
      .select({
        id: subscriptions.id,
        status: subscriptions.status,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
        trialEnd: subscriptions.trialEnd,
        planName: plans.name,
        planSlug: plans.slug,
      })
      .from(subscriptions)
      .innerJoin(plans, eq(subscriptions.planId, plans.id))
      .where(eq(subscriptions.organizationId, organizationId))
      .limit(1);

    if (!sub) {
      return { data: null };
    }

    return { data: sub };
  });
}
