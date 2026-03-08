import { db } from "@/lib/db";
import { organizations, subscriptions, platformAuditLog } from "@/lib/db/schema/organizations";
import { notifications } from "@/lib/db/schema/messaging";
import { and, eq, lt, ne, isNull, isNotNull } from "drizzle-orm";
import { getOrgAdmins, type CronJobResult } from "../runner";

const GRACE_PERIOD_DAYS = 7;

/**
 * Enforces subscription status:
 * - Suspends orgs past grace period
 * - Enters grace period for expired trials with no active subscription
 *
 * NOTE: This job queries subscriptions directly (not via getActiveOrganizations)
 * because it needs to find orgs in specific subscription states, not just active ones.
 */
export default async function subscriptionCheck(): Promise<CronJobResult> {
  let processed = 0;
  let errors = 0;
  const now = new Date();

  try {
    // --- Phase 1: Suspend orgs past grace period ---
    const pastGrace = await db
      .select({
        subId: subscriptions.id,
        orgId: subscriptions.organizationId,
      })
      .from(subscriptions)
      .innerJoin(organizations, eq(subscriptions.organizationId, organizations.id))
      .where(
        and(
          eq(organizations.status, "active"),
          isNull(organizations.deletedAt),
          ne(subscriptions.status, "suspended"),
          isNotNull(subscriptions.gracePeriodEnd),
          lt(subscriptions.gracePeriodEnd, now)
        )
      );

    for (const row of pastGrace) {
      try {
        // Suspend the organization
        await db
          .update(organizations)
          .set({ status: "suspended", updatedAt: now })
          .where(eq(organizations.id, row.orgId));

        // Update subscription status
        await db
          .update(subscriptions)
          .set({ status: "suspended", updatedAt: now })
          .where(eq(subscriptions.id, row.subId));

        // Notify admins
        const admins = await getOrgAdmins(row.orgId);

        if (admins.length > 0) {
          await db.insert(notifications).values(
            admins.map((admin) => ({
              organizationId: row.orgId,
              userId: admin.id,
              type: "system" as const,
              title: "Account Suspended",
              message:
                "Your subscription has been suspended due to non-payment. Please update your billing information to restore access.",
              linkUrl: "/settings/billing",
            }))
          );
        }

        // Audit log
        await db.insert(platformAuditLog).values({
          action: "suspend_org",
          targetOrgId: row.orgId,
          details: JSON.stringify({ reason: "grace_period_expired" }),
        });

        processed++;
      } catch (err) {
        console.error(`[cron:subscription-check] Error suspending org ${row.orgId}:`, err);
        errors++;
      }
    }

    // --- Phase 2: Enter grace period for expired trials ---
    const expiredTrials = await db
      .select({
        subId: subscriptions.id,
        orgId: subscriptions.organizationId,
      })
      .from(subscriptions)
      .innerJoin(organizations, eq(subscriptions.organizationId, organizations.id))
      .where(
        and(
          eq(organizations.status, "active"),
          isNull(organizations.deletedAt),
          eq(subscriptions.status, "trialing"),
          isNotNull(subscriptions.trialEnd),
          lt(subscriptions.trialEnd, now),
          isNull(subscriptions.gracePeriodEnd)
        )
      );

    for (const row of expiredTrials) {
      try {
        const gracePeriodEnd = new Date(now);
        gracePeriodEnd.setDate(gracePeriodEnd.getDate() + GRACE_PERIOD_DAYS);

        // Update subscription to past_due with grace period
        await db
          .update(subscriptions)
          .set({
            status: "past_due",
            gracePeriodEnd,
            updatedAt: now,
          })
          .where(eq(subscriptions.id, row.subId));

        // Notify admins
        const admins = await getOrgAdmins(row.orgId);

        if (admins.length > 0) {
          await db.insert(notifications).values(
            admins.map((admin) => ({
              organizationId: row.orgId,
              userId: admin.id,
              type: "system" as const,
              title: "Trial Ended",
              message: `Your free trial has ended. You have ${GRACE_PERIOD_DAYS} days to subscribe before your account is suspended.`,
              linkUrl: "/settings/billing",
            }))
          );
        }

        processed++;
      } catch (err) {
        console.error(`[cron:subscription-check] Error processing trial for org ${row.orgId}:`, err);
        errors++;
      }
    }
  } catch (err) {
    console.error("[cron:subscription-check] Fatal error:", err);
    errors++;
  }

  return {
    job: "subscription-check",
    success: errors === 0,
    processed,
    errors,
  };
}
