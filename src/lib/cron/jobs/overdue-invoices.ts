import { db } from "@/lib/db";
import { invoices } from "@/lib/db/schema/billing";
import { clients } from "@/lib/db/schema/clients";
import { notifications } from "@/lib/db/schema/messaging";
import { and, eq, lt, isNotNull, inArray } from "drizzle-orm";
import { getActiveOrganizations, getOrgAdmins, type CronJobResult } from "../runner";

/**
 * Marks overdue invoices (sent/viewed + past due date) and notifies org admins.
 * Idempotent: only processes invoices not already marked overdue, and checks
 * for existing notifications before creating new ones.
 */
export default async function overdueInvoices(): Promise<CronJobResult> {
  const orgs = await getActiveOrganizations();
  let processed = 0;
  let errors = 0;
  const now = new Date();

  for (const org of orgs) {
    try {
      // Find invoices that are sent or viewed (not yet marked overdue) and past due date
      const overdueRows = await db
        .select({
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          clientId: invoices.clientId,
        })
        .from(invoices)
        .where(
          and(
            eq(invoices.organizationId, org.id),
            inArray(invoices.status, ["sent", "viewed"]),
            isNotNull(invoices.dueDate),
            lt(invoices.dueDate, now)
          )
        );

      if (overdueRows.length === 0) continue;

      // Mark invoices as overdue
      const overdueIds = overdueRows.map((r) => r.id);
      await db
        .update(invoices)
        .set({ status: "overdue", updatedAt: now })
        .where(
          and(
            eq(invoices.organizationId, org.id),
            inArray(invoices.id, overdueIds)
          )
        );

      // Get client names for notification messages
      const clientIds = [...new Set(overdueRows.map((r) => r.clientId))];
      const clientList = await db
        .select({ id: clients.id, firstName: clients.firstName, lastName: clients.lastName, companyName: clients.companyName })
        .from(clients)
        .where(inArray(clients.id, clientIds));

      const clientMap = new Map(clientList.map((c) => [c.id, c.companyName || `${c.firstName} ${c.lastName}`]));

      // Check for existing notifications to avoid duplicates on re-run
      const linkUrls = overdueRows.map((inv) => `/billing/${inv.id}`);
      const existingNotifs = await db
        .select({ linkUrl: notifications.linkUrl })
        .from(notifications)
        .where(
          and(
            eq(notifications.organizationId, org.id),
            eq(notifications.type, "billing"),
            isNotNull(notifications.linkUrl),
            inArray(notifications.linkUrl, linkUrls)
          )
        );

      const alreadyNotified = new Set(existingNotifs.map((n) => n.linkUrl));

      // Find admin users for this org to notify
      const admins = await getOrgAdmins(org.id);

      // Create notifications for each admin about each overdue invoice
      const notificationValues = [];
      for (const inv of overdueRows) {
        const linkUrl = `/billing/${inv.id}`;
        if (alreadyNotified.has(linkUrl)) continue;

        const clientName = clientMap.get(inv.clientId) ?? "Unknown";
        for (const admin of admins) {
          notificationValues.push({
            organizationId: org.id,
            userId: admin.id,
            type: "billing" as const,
            title: "Invoice Overdue",
            message: `Invoice ${inv.invoiceNumber} for ${clientName} is overdue.`,
            linkUrl,
          });
        }
      }

      if (notificationValues.length > 0) {
        await db.insert(notifications).values(notificationValues);
      }

      processed += overdueRows.length;
    } catch (err) {
      console.error(`[cron:overdue-invoices] Error for org ${org.id}:`, err);
      errors++;
    }
  }

  return {
    job: "overdue-invoices",
    success: errors === 0,
    processed,
    errors,
  };
}
