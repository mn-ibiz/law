import { requireRole, getTenantContext } from "@/lib/auth/get-session";
import { db } from "@/lib/db";
import { organizations, subscriptions, plans } from "@/lib/db/schema/organizations";
import { eq } from "drizzle-orm";
import { CreditCard, Users, Briefcase, HardDrive, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { getOrgUsage } from "@/lib/utils/plan-limits";
import { isStripeConfigured } from "@/lib/stripe/client";
import { SubscriptionActions } from "./subscription-actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscription",
  description: "Manage your subscription and billing",
};

export default async function SubscriptionPage() {
  await requireRole("admin");
  const { organizationId } = await getTenantContext();

  // Get subscription, plan, and usage data
  const [sub] = await db
    .select({
      id: subscriptions.id,
      status: subscriptions.status,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
      trialEnd: subscriptions.trialEnd,
      stripeCustomerId: subscriptions.stripeCustomerId,
      planName: plans.name,
      planSlug: plans.slug,
      maxUsers: plans.maxUsers,
      maxCases: plans.maxCases,
      maxStorageMb: plans.maxStorageMb,
      monthlyPrice: plans.monthlyPrice,
      currency: plans.currency,
    })
    .from(subscriptions)
    .innerJoin(plans, eq(subscriptions.planId, plans.id))
    .where(eq(subscriptions.organizationId, organizationId))
    .limit(1);

  const usage = await getOrgUsage(organizationId);
  const stripeReady = isStripeConfigured();

  // Get available plans for upgrade
  const availablePlans = await db
    .select({
      id: plans.id,
      name: plans.name,
      slug: plans.slug,
      maxUsers: plans.maxUsers,
      maxCases: plans.maxCases,
      maxStorageMb: plans.maxStorageMb,
      monthlyPrice: plans.monthlyPrice,
      currency: plans.currency,
      description: plans.description,
    })
    .from(plans)
    .where(eq(plans.isActive, true))
    .orderBy(plans.monthlyPrice);

  const statusIcon = {
    active: <CheckCircle className="h-4 w-4 text-green-500" />,
    trialing: <Clock className="h-4 w-4 text-blue-500" />,
    past_due: <AlertCircle className="h-4 w-4 text-yellow-500" />,
    cancelled: <AlertCircle className="h-4 w-4 text-red-500" />,
    suspended: <AlertCircle className="h-4 w-4 text-red-500" />,
  };

  const statusLabel = {
    active: "Active",
    trialing: "Trial",
    past_due: "Past Due",
    cancelled: "Cancelled",
    suspended: "Suspended",
  };

  const storageMbUsed = Math.round(usage.storageUsedBytes / (1024 * 1024));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <CreditCard className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subscription</h1>
          <p className="text-sm text-muted-foreground">
            Manage your plan and billing
          </p>
        </div>
      </div>

      {/* Current Plan */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="font-semibold">Current Plan</h3>
        {sub ? (
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {statusIcon[sub.status as keyof typeof statusIcon] ?? statusIcon.active}
                <span className="font-medium">{sub.planName}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                  {statusLabel[sub.status as keyof typeof statusLabel] ?? sub.status}
                </span>
              </div>
              <span className="text-lg font-semibold">
                {sub.currency} {Number(sub.monthlyPrice ?? 0).toLocaleString()}/mo
              </span>
            </div>
            {sub.currentPeriodEnd && (
              <p className="text-sm text-muted-foreground">
                {sub.cancelAtPeriodEnd ? "Cancels" : "Renews"} on{" "}
                {new Date(sub.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
            {sub.trialEnd && sub.status === "trialing" && (
              <p className="text-sm text-blue-600">
                Trial ends {new Date(sub.trialEnd).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No subscription found.</p>
        )}
      </div>

      {/* Usage */}
      <div className="grid gap-4 md:grid-cols-3">
        <UsageCard
          icon={<Users className="h-4 w-4" />}
          label="Users"
          current={usage.userCount}
          max={sub?.maxUsers}
        />
        <UsageCard
          icon={<Briefcase className="h-4 w-4" />}
          label="Cases"
          current={usage.caseCount}
          max={sub?.maxCases}
        />
        <UsageCard
          icon={<HardDrive className="h-4 w-4" />}
          label="Storage"
          current={storageMbUsed}
          max={sub?.maxStorageMb}
          unit="MB"
        />
      </div>

      {/* Actions */}
      {stripeReady ? (
        <SubscriptionActions
          hasSubscription={!!sub}
          currentPlanSlug={sub?.planSlug ?? null}
          availablePlans={availablePlans}
        />
      ) : (
        <div className="rounded-xl border border-dashed bg-muted/50 p-6 text-center">
          <CreditCard className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 font-medium text-muted-foreground">Payment processing not configured</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Contact your platform administrator to enable billing.
          </p>
        </div>
      )}
    </div>
  );
}

function UsageCard({
  icon,
  label,
  current,
  max,
  unit = "",
}: {
  icon: React.ReactNode;
  label: string;
  current: number;
  max?: number | null;
  unit?: string;
}) {
  const pct = max ? Math.min((current / max) * 100, 100) : 0;
  const isNearLimit = max ? pct >= 80 : false;
  const isAtLimit = max ? pct >= 100 : false;

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold">
        {current.toLocaleString()}
        {unit && <span className="text-sm font-normal text-muted-foreground"> {unit}</span>}
        {max != null && (
          <span className="text-sm font-normal text-muted-foreground">
            {" "}/ {max.toLocaleString()}{unit && ` ${unit}`}
          </span>
        )}
        {max == null && (
          <span className="text-sm font-normal text-muted-foreground"> / Unlimited</span>
        )}
      </div>
      {max != null && (
        <div className="mt-2 h-1.5 rounded-full bg-muted">
          <div
            className={`h-1.5 rounded-full transition-all ${
              isAtLimit ? "bg-red-500" : isNearLimit ? "bg-yellow-500" : "bg-primary"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
