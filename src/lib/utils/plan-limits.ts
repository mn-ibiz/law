import { db } from "@/lib/db";
import { organizations, plans, subscriptions } from "@/lib/db/schema/organizations";
import { users } from "@/lib/db/schema/auth";
import { cases } from "@/lib/db/schema/cases";
import { eq, and, sql, isNull } from "drizzle-orm";

export interface PlanFeatures {
  trust_accounting: boolean;
  workflow_automation: boolean;
  custom_branding: boolean;
  client_portal: boolean;
  api_access: boolean;
  reports: "basic" | "full" | "custom";
  priority_support: boolean;
}

const DEFAULT_FEATURES: PlanFeatures = {
  trust_accounting: false,
  workflow_automation: false,
  custom_branding: false,
  client_portal: true,
  api_access: false,
  reports: "basic",
  priority_support: false,
};

function parseFeatures(featuresJson: string | null): PlanFeatures {
  if (!featuresJson) return DEFAULT_FEATURES;
  try {
    return { ...DEFAULT_FEATURES, ...JSON.parse(featuresJson) };
  } catch {
    return DEFAULT_FEATURES;
  }
}

async function getOrgPlan(organizationId: string) {
  const [result] = await db
    .select({
      maxUsers: plans.maxUsers,
      maxCases: plans.maxCases,
      maxStorageMb: plans.maxStorageMb,
      features: plans.features,
      subscriptionStatus: subscriptions.status,
      trialEnd: subscriptions.trialEnd,
      gracePeriodEnd: subscriptions.gracePeriodEnd,
      storageUsedBytes: organizations.storageUsedBytes,
    })
    .from(organizations)
    .leftJoin(plans, eq(organizations.planId, plans.id))
    .leftJoin(subscriptions, eq(subscriptions.organizationId, organizations.id))
    .where(eq(organizations.id, organizationId))
    .limit(1);

  return result;
}

export interface PlanLimitResult {
  allowed: boolean;
  error?: string;
  current?: number;
  max?: number | null;
}

/**
 * Check if an organization can perform an action that counts against a plan limit.
 * Returns { allowed: true } or { allowed: false, error: "..." }.
 * Note: This is a best-effort check. Concurrent requests may briefly exceed limits
 * because Neon HTTP driver does not support transactions with row-level locks.
 * The overshoot is bounded to the number of concurrent in-flight requests.
 */
export async function checkPlanLimit(
  organizationId: string,
  metric: "users" | "cases" | "storage"
): Promise<PlanLimitResult> {
  const orgPlan = await getOrgPlan(organizationId);

  if (!orgPlan) {
    return { allowed: false, error: "Organization not found." };
  }

  // Check subscription status — allow trialing and active
  const status = orgPlan.subscriptionStatus;
  if (status && !["active", "trialing", "past_due"].includes(status)) {
    return { allowed: false, error: "Your subscription is not active. Please update your billing." };
  }

  // Enforce grace period expiration — if past_due and grace period has elapsed, block
  if (status === "past_due" && orgPlan.gracePeriodEnd && new Date(orgPlan.gracePeriodEnd) < new Date()) {
    return { allowed: false, error: "Your payment grace period has expired. Please update your billing to continue." };
  }

  switch (metric) {
    case "users": {
      if (orgPlan.maxUsers == null) return { allowed: true }; // Unlimited
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(and(eq(users.organizationId, organizationId), isNull(users.deletedAt)));
      if (count >= orgPlan.maxUsers) {
        return {
          allowed: false,
          error: `User limit reached (${count}/${orgPlan.maxUsers}). Please upgrade your plan.`,
          current: count,
          max: orgPlan.maxUsers,
        };
      }
      return { allowed: true, current: count, max: orgPlan.maxUsers };
    }

    case "cases": {
      if (orgPlan.maxCases == null) return { allowed: true };
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(cases)
        .where(eq(cases.organizationId, organizationId));
      if (count >= orgPlan.maxCases) {
        return {
          allowed: false,
          error: `Case limit reached (${count}/${orgPlan.maxCases}). Please upgrade your plan.`,
          current: count,
          max: orgPlan.maxCases,
        };
      }
      return { allowed: true, current: count, max: orgPlan.maxCases };
    }

    case "storage": {
      // Storage is checked at upload time in the upload route (S04)
      // This is for pre-check/display purposes
      if (orgPlan.maxStorageMb == null) return { allowed: true };
      const usedMb = Math.round((orgPlan.storageUsedBytes ?? 0) / (1024 * 1024));
      if (usedMb >= orgPlan.maxStorageMb) {
        return {
          allowed: false,
          error: `Storage limit reached (${usedMb}MB/${orgPlan.maxStorageMb}MB). Please upgrade your plan.`,
          current: usedMb,
          max: orgPlan.maxStorageMb,
        };
      }
      return { allowed: true, current: usedMb, max: orgPlan.maxStorageMb };
    }
  }
}

/**
 * Check if an organization has access to a specific feature based on their plan.
 */
export async function checkFeatureAccess(
  organizationId: string,
  feature: keyof PlanFeatures
): Promise<{ allowed: boolean; error?: string }> {
  const orgPlan = await getOrgPlan(organizationId);

  if (!orgPlan) {
    return { allowed: false, error: "Organization not found." };
  }

  const features = parseFeatures(orgPlan.features);
  const value = features[feature];

  if (value === false) {
    return {
      allowed: false,
      error: `${feature.replace(/_/g, " ")} is not available on your current plan. Please upgrade.`,
    };
  }

  return { allowed: true };
}

/**
 * Get organization usage stats for display in subscription UI.
 */
export async function getOrgUsage(organizationId: string) {
  const [[userResult], [caseResult], [orgResult]] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(and(eq(users.organizationId, organizationId), isNull(users.deletedAt))),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(cases)
      .where(eq(cases.organizationId, organizationId)),
    db
      .select({ storageUsedBytes: organizations.storageUsedBytes })
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1),
  ]);

  return {
    userCount: userResult.count,
    caseCount: caseResult.count,
    storageUsedBytes: orgResult?.storageUsedBytes ?? 0,
  };
}
