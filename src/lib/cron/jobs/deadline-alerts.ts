import { db } from "@/lib/db";
import { deadlines } from "@/lib/db/schema/calendar";
import { notifications } from "@/lib/db/schema/messaging";
import { and, eq, gt, lt, isNull, isNotNull, inArray } from "drizzle-orm";
import { getActiveOrganizations, type CronJobResult } from "../runner";

const ALERT_LEAD_HOURS = 48;

/**
 * Creates notifications for approaching deadlines (within 48 hours)
 * that haven't been completed and haven't been alerted recently.
 * Uses linkUrl for dedup to avoid fragile LIKE-based message matching.
 */
export default async function deadlineAlerts(): Promise<CronJobResult> {
  const orgs = await getActiveOrganizations();
  let processed = 0;
  let errors = 0;
  const now = new Date();
  const alertHorizon = new Date(now.getTime() + ALERT_LEAD_HOURS * 60 * 60 * 1000);
  const recentNotifCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  for (const org of orgs) {
    try {
      // Find incomplete deadlines due within the alert window
      const approachingDeadlines = await db
        .select({
          id: deadlines.id,
          title: deadlines.title,
          dueDate: deadlines.dueDate,
          assignedTo: deadlines.assignedTo,
        })
        .from(deadlines)
        .where(
          and(
            eq(deadlines.organizationId, org.id),
            isNull(deadlines.completedAt),
            gt(deadlines.dueDate, now),
            lt(deadlines.dueDate, alertHorizon),
            isNotNull(deadlines.assignedTo)
          )
        );

      if (approachingDeadlines.length === 0) continue;

      // Check for existing recent notifications using linkUrl for reliable dedup
      const linkUrls = approachingDeadlines.map((d) => `/deadlines/${d.id}`);
      const recentNotifs = await db
        .select({ linkUrl: notifications.linkUrl })
        .from(notifications)
        .where(
          and(
            eq(notifications.organizationId, org.id),
            eq(notifications.type, "deadline"),
            gt(notifications.createdAt, recentNotifCutoff),
            isNotNull(notifications.linkUrl),
            inArray(notifications.linkUrl, linkUrls)
          )
        );

      const alreadyNotified = new Set(recentNotifs.map((n) => n.linkUrl));

      const notificationValues = [];
      for (const dl of approachingDeadlines) {
        if (!dl.assignedTo) continue;
        const linkUrl = `/deadlines/${dl.id}`;
        if (alreadyNotified.has(linkUrl)) continue;

        const hoursLeft = Math.round(
          (new Date(dl.dueDate).getTime() - now.getTime()) / (60 * 60 * 1000)
        );

        notificationValues.push({
          organizationId: org.id,
          userId: dl.assignedTo,
          type: "deadline" as const,
          title: "Deadline Approaching",
          message: `Deadline "${dl.title}" is due in ${hoursLeft} hours.`,
          linkUrl,
        });
      }

      if (notificationValues.length > 0) {
        await db.insert(notifications).values(notificationValues);
        processed += notificationValues.length;
      }
    } catch (err) {
      console.error(`[cron:deadline-alerts] Error for org ${org.id}:`, err);
      errors++;
    }
  }

  return {
    job: "deadline-alerts",
    success: errors === 0,
    processed,
    errors,
  };
}
