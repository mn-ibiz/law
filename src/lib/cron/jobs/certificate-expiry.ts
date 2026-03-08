import { db } from "@/lib/db";
import { practisingCertificates, attorneys } from "@/lib/db/schema/attorneys";
import { users } from "@/lib/db/schema/auth";
import { notifications } from "@/lib/db/schema/messaging";
import { and, eq, gt, lt, isNotNull, inArray } from "drizzle-orm";
import { getActiveOrganizations, getOrgAdmins, type CronJobResult } from "../runner";

const EXPIRY_LEAD_DAYS = 60;
const NOTIF_COOLDOWN_DAYS = 7;

/**
 * Alerts org admins when practising certificates expire within 60 days.
 * Uses linkUrl for dedup with a 7-day cooldown to avoid notification spam.
 */
export default async function certificateExpiry(): Promise<CronJobResult> {
  const orgs = await getActiveOrganizations();
  let processed = 0;
  let errors = 0;
  const now = new Date();
  const expiryHorizon = new Date(now.getTime() + EXPIRY_LEAD_DAYS * 24 * 60 * 60 * 1000);
  const cooldownCutoff = new Date(now.getTime() - NOTIF_COOLDOWN_DAYS * 24 * 60 * 60 * 1000);

  for (const org of orgs) {
    try {
      // Find certificates expiring within the lead window
      const expiringCerts = await db
        .select({
          certId: practisingCertificates.id,
          attorneyId: practisingCertificates.attorneyId,
          expiryDate: practisingCertificates.expiryDate,
        })
        .from(practisingCertificates)
        .where(
          and(
            eq(practisingCertificates.organizationId, org.id),
            eq(practisingCertificates.status, "active"),
            isNotNull(practisingCertificates.expiryDate),
            gt(practisingCertificates.expiryDate, now),
            lt(practisingCertificates.expiryDate, expiryHorizon)
          )
        );

      if (expiringCerts.length === 0) continue;

      // Get attorney names
      const attorneyIds = [...new Set(expiringCerts.map((c) => c.attorneyId))];
      const attorneyList = await db
        .select({ id: attorneys.id, userId: attorneys.userId })
        .from(attorneys)
        .where(inArray(attorneys.id, attorneyIds));

      const userIds = attorneyList.map((a) => a.userId);
      const userList = await db
        .select({ id: users.id, name: users.name })
        .from(users)
        .where(inArray(users.id, userIds));

      const userMap = new Map(userList.map((u) => [u.id, u.name]));
      const attorneyNameMap = new Map(
        attorneyList.map((a) => [a.id, userMap.get(a.userId) ?? "Unknown Attorney"])
      );

      // Check for recent notifications using linkUrl for reliable dedup
      const linkUrls = expiringCerts.map((c) => `/attorneys/certificates/${c.certId}`);
      const recentNotifs = await db
        .select({ linkUrl: notifications.linkUrl })
        .from(notifications)
        .where(
          and(
            eq(notifications.organizationId, org.id),
            eq(notifications.type, "warning"),
            gt(notifications.createdAt, cooldownCutoff),
            isNotNull(notifications.linkUrl),
            inArray(notifications.linkUrl, linkUrls)
          )
        );

      const alreadyNotified = new Set(recentNotifs.map((n) => n.linkUrl));

      // Find admin users for this org
      const admins = await getOrgAdmins(org.id);

      const notificationValues = [];
      for (const cert of expiringCerts) {
        const linkUrl = `/attorneys/certificates/${cert.certId}`;
        if (alreadyNotified.has(linkUrl)) continue;

        const attorneyName = attorneyNameMap.get(cert.attorneyId) ?? "Unknown";
        const expiryStr = cert.expiryDate
          ? new Date(cert.expiryDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "N/A";

        for (const admin of admins) {
          notificationValues.push({
            organizationId: org.id,
            userId: admin.id,
            type: "warning" as const,
            title: "Certificate Expiring Soon",
            message: `${attorneyName}'s practising certificate expires on ${expiryStr}.`,
            linkUrl,
          });
        }
      }

      if (notificationValues.length > 0) {
        await db.insert(notifications).values(notificationValues);
        processed += notificationValues.length;
      }
    } catch (err) {
      console.error(`[cron:certificate-expiry] Error for org ${org.id}:`, err);
      errors++;
    }
  }

  return {
    job: "certificate-expiry",
    success: errors === 0,
    processed,
    errors,
  };
}
