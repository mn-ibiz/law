import { db } from "@/lib/db";
import { organizations, platformAuditLog } from "@/lib/db/schema/organizations";
import { firmSettings } from "@/lib/db/schema/settings";
import { and, eq, lt, isNotNull } from "drizzle-orm";
import type { CronJobResult } from "../runner";
import { r2DeleteByPrefix } from "@/lib/storage/r2";

const DEFAULT_RETENTION_DAYS = 90;

/**
 * Permanently deletes data for cancelled organizations that are past their
 * retention period. Uses cascading DELETE on the organizations table to
 * purge all dependent data.
 */
export default async function dataPurge(): Promise<CronJobResult> {
  let processed = 0;
  let errors = 0;
  const now = new Date();

  try {
    // Find cancelled orgs with deletedAt set
    const cancelledOrgs = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        deletedAt: organizations.deletedAt,
      })
      .from(organizations)
      .where(
        and(
          eq(organizations.status, "cancelled"),
          isNotNull(organizations.deletedAt)
        )
      );

    for (const org of cancelledOrgs) {
      try {
        // Get org-specific retention setting
        const [retentionSetting] = await db
          .select({ value: firmSettings.value })
          .from(firmSettings)
          .where(
            and(
              eq(firmSettings.organizationId, org.id),
              eq(firmSettings.key, "data.retentionDays")
            )
          )
          .limit(1);

        const retentionDays = retentionSetting?.value
          ? parseInt(retentionSetting.value, 10) || DEFAULT_RETENTION_DAYS
          : DEFAULT_RETENTION_DAYS;

        const deletedAt = new Date(org.deletedAt!);
        const purgeAfter = new Date(deletedAt.getTime() + retentionDays * 24 * 60 * 60 * 1000);

        if (now < purgeAfter) continue; // Not yet past retention period

        // Audit log BEFORE deletion (the org record will be gone after)
        await db.insert(platformAuditLog).values({
          action: "data_purge",
          targetOrgId: org.id,
          details: JSON.stringify({
            organizationName: org.name,
            deletedAt: org.deletedAt,
            retentionDays,
            purgedAt: now.toISOString(),
          }),
        });

        // Delete R2 storage files for this org BEFORE cascading DB delete
        try {
          const filesDeleted = await r2DeleteByPrefix(`${org.id}/`);
          if (filesDeleted > 0) {
            console.log(`[cron:data-purge] Deleted ${filesDeleted} R2 files for org ${org.id}`);
          }
        } catch (storageErr) {
          // Log but don't block DB purge — orphaned files are less critical than data retention compliance
          console.error(`[cron:data-purge] Failed to delete R2 files for org ${org.id}:`, storageErr);
        }

        // Cascading delete — removes all dependent records
        await db
          .delete(organizations)
          .where(eq(organizations.id, org.id));

        processed++;
        console.log(`[cron:data-purge] Purged org ${org.id} (${org.name})`);
      } catch (err) {
        console.error(`[cron:data-purge] Error purging org ${org.id}:`, err);
        errors++;
      }
    }
  } catch (err) {
    console.error("[cron:data-purge] Fatal error:", err);
    errors++;
  }

  return {
    job: "data-purge",
    success: errors === 0,
    processed,
    errors,
  };
}
