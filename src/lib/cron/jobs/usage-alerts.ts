import { db } from "@/lib/db";
import { organizations, plans, subscriptions } from "@/lib/db/schema/organizations";
import { users } from "@/lib/db/schema/auth";
import { cases } from "@/lib/db/schema/cases";
import { notifications } from "@/lib/db/schema/messaging";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { getActiveOrganizations, getOrgAdmins, type CronJobResult } from "../runner";

const THRESHOLDS = [
  { pct: 95, type: "system" as const, label: "critical" },
  { pct: 80, type: "warning" as const, label: "approaching" },
];
const NOTIF_COOLDOWN_DAYS = 7;

/**
 * Checks usage (users, cases, storage) against plan limits and creates
 * notifications at 80% and 95% thresholds.
 *
 * Note: This uses per-org sequential queries (plan limits, counts, admin lookup,
 * notification dedup). For a daily background cron job this is acceptable; if
 * org count grows significantly, consider batching the plan/count queries.
 */
export default async function usageAlerts(): Promise<CronJobResult> {
  const orgs = await getActiveOrganizations();
  let processed = 0;
  let errors = 0;
  const now = new Date();
  const cooldownCutoff = new Date(now.getTime() - NOTIF_COOLDOWN_DAYS * 24 * 60 * 60 * 1000);

  for (const org of orgs) {
    try {
      // Get plan limits for this org
      const [orgPlan] = await db
        .select({
          maxUsers: plans.maxUsers,
          maxCases: plans.maxCases,
          maxStorageMb: plans.maxStorageMb,
          storageUsedBytes: organizations.storageUsedBytes,
        })
        .from(organizations)
        .leftJoin(plans, eq(organizations.planId, plans.id))
        .where(eq(organizations.id, org.id))
        .limit(1);

      if (!orgPlan) continue;

      // Get current counts
      const [[userResult], [caseResult]] = await Promise.all([
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(users)
          .where(and(eq(users.organizationId, org.id), isNull(users.deletedAt))),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(cases)
          .where(eq(cases.organizationId, org.id)),
      ]);

      const metrics: Array<{
        metric: string;
        current: number;
        max: number | null;
        unit: string;
      }> = [
        { metric: "users", current: userResult.count, max: orgPlan.maxUsers, unit: "users" },
        { metric: "cases", current: caseResult.count, max: orgPlan.maxCases, unit: "cases" },
        {
          metric: "storage",
          current: Math.round((orgPlan.storageUsedBytes ?? 0) / (1024 * 1024)),
          max: orgPlan.maxStorageMb,
          unit: "MB",
        },
      ];

      const admins = await getOrgAdmins(org.id);
      if (admins.length === 0) continue;

      for (const { metric, current, max, unit } of metrics) {
        if (max == null || max === 0) continue; // Unlimited
        const pct = (current / max) * 100;

        for (const threshold of THRESHOLDS) {
          if (pct < threshold.pct) continue;

          const linkUrl = `/settings/subscription#usage-${metric}`;

          // Check for recent notification at this threshold level
          const [existing] = await db
            .select({ id: notifications.id })
            .from(notifications)
            .where(
              and(
                eq(notifications.organizationId, org.id),
                eq(notifications.type, threshold.type),
                eq(notifications.linkUrl, linkUrl),
                gt(notifications.createdAt, cooldownCutoff)
              )
            )
            .limit(1);

          if (existing) break; // Already notified at this or higher threshold recently

          const title = threshold.pct >= 95 ? "Usage Limit Critical" : "Usage Limit Approaching";
          const message = `Your ${metric} usage is at ${Math.round(pct)}% (${current}/${max} ${unit}). ${
            threshold.pct >= 95
              ? "Please upgrade your plan to avoid disruption."
              : "Consider upgrading your plan."
          }`;

          await db.insert(notifications).values(
            admins.map((admin) => ({
              organizationId: org.id,
              userId: admin.id,
              type: threshold.type,
              title,
              message,
              linkUrl,
            }))
          );

          processed++;
          break; // Only the highest threshold notification per metric
        }
      }
    } catch (err) {
      console.error(`[cron:usage-alerts] Error for org ${org.id}:`, err);
      errors++;
    }
  }

  return {
    job: "usage-alerts",
    success: errors === 0,
    processed,
    errors,
  };
}
