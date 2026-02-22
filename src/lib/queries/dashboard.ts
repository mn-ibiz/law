import { db } from "@/lib/db";
import { cases, caseAssignments } from "@/lib/db/schema/cases";
import { clients } from "@/lib/db/schema/clients";
import { users } from "@/lib/db/schema/auth";
import { invoices } from "@/lib/db/schema/billing";
import { payments } from "@/lib/db/schema/billing";
import { deadlines } from "@/lib/db/schema/calendar";
import { timeEntries } from "@/lib/db/schema/time-expenses";
import { messages } from "@/lib/db/schema/messaging";
import { documents } from "@/lib/db/schema/documents";
import { sql, eq, and, inArray, isNull, gte, lte, ne } from "drizzle-orm";

export async function getAdminDashboardStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    activeCasesResult,
    totalClientsResult,
    revenueResult,
    outstandingResult,
    activeAttorneysResult,
    overdueDeadlinesResult,
  ] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(cases)
      .where(inArray(cases.status, ["open", "in_progress", "hearing"])),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(clients)
      .where(eq(clients.status, "active")),
    db
      .select({ total: sql<number>`coalesce(sum(${payments.amount}::numeric), 0)::float` })
      .from(payments)
      .where(gte(payments.paymentDate, startOfMonth)),
    db
      .select({
        total: sql<number>`coalesce(sum((${invoices.totalAmount}::numeric - ${invoices.paidAmount}::numeric)), 0)::float`,
      })
      .from(invoices)
      .where(
        and(
          ne(invoices.status, "paid"),
          ne(invoices.status, "cancelled")
        )
      ),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(and(eq(users.role, "attorney"), eq(users.isActive, true))),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(deadlines)
      .where(and(lte(deadlines.dueDate, now), isNull(deadlines.completedAt))),
  ]);

  return {
    activeCases: activeCasesResult[0]?.count ?? 0,
    totalClients: totalClientsResult[0]?.count ?? 0,
    revenueThisMonth: revenueResult[0]?.total ?? 0,
    outstandingInvoices: outstandingResult[0]?.total ?? 0,
    activeAttorneys: activeAttorneysResult[0]?.count ?? 0,
    overdueDeadlines: overdueDeadlinesResult[0]?.count ?? 0,
  };
}

export async function getAttorneyDashboardStats(userId: string) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((dayOfWeek + 6) % 7)); // Monday
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);

  const [
    activeCasesResult,
    hoursThisWeekResult,
    billableHoursResult,
    upcomingDeadlinesResult,
    unreadMessagesResult,
  ] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(caseAssignments)
      .innerJoin(cases, eq(caseAssignments.caseId, cases.id))
      .where(
        and(
          eq(caseAssignments.userId, userId),
          isNull(caseAssignments.unassignedAt),
          inArray(cases.status, ["open", "in_progress", "hearing"])
        )
      ),
    db
      .select({ total: sql<number>`coalesce(sum(${timeEntries.hours}::numeric), 0)::float` })
      .from(timeEntries)
      .where(and(eq(timeEntries.userId, userId), gte(timeEntries.date, startOfWeek))),
    db
      .select({ total: sql<number>`coalesce(sum(${timeEntries.hours}::numeric), 0)::float` })
      .from(timeEntries)
      .where(
        and(
          eq(timeEntries.userId, userId),
          eq(timeEntries.isBillable, true),
          gte(timeEntries.date, startOfMonth)
        )
      ),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(deadlines)
      .where(
        and(
          eq(deadlines.assignedTo, userId),
          isNull(deadlines.completedAt),
          gte(deadlines.dueDate, now),
          lte(deadlines.dueDate, nextWeek)
        )
      ),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(messages)
      .where(and(eq(messages.recipientId, userId), isNull(messages.readAt))),
  ]);

  return {
    activeCases: activeCasesResult[0]?.count ?? 0,
    hoursThisWeek: hoursThisWeekResult[0]?.total ?? 0,
    billableHoursThisMonth: billableHoursResult[0]?.total ?? 0,
    upcomingDeadlines: upcomingDeadlinesResult[0]?.count ?? 0,
    unreadMessages: unreadMessagesResult[0]?.count ?? 0,
  };
}

export async function getClientDashboardStats(userId: string) {
  // Get clientId from users -> clients relation
  const clientResult = await db
    .select({ id: clients.id })
    .from(clients)
    .where(eq(clients.userId, userId))
    .limit(1);

  const clientId = clientResult[0]?.id;
  if (!clientId) {
    return { openCases: 0, pendingDocuments: 0, outstandingBalance: 0 };
  }

  const [openCasesResult, pendingDocsResult, balanceResult] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(cases)
      .where(
        and(
          eq(cases.clientId, clientId),
          inArray(cases.status, ["open", "in_progress", "hearing"])
        )
      ),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(documents)
      .where(
        and(eq(documents.clientId, clientId), eq(documents.status, "draft"))
      ),
    db
      .select({
        total: sql<number>`coalesce(sum((${invoices.totalAmount}::numeric - ${invoices.paidAmount}::numeric)), 0)::float`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.clientId, clientId),
          ne(invoices.status, "paid"),
          ne(invoices.status, "cancelled")
        )
      ),
  ]);

  return {
    openCases: openCasesResult[0]?.count ?? 0,
    pendingDocuments: pendingDocsResult[0]?.count ?? 0,
    outstandingBalance: balanceResult[0]?.total ?? 0,
  };
}
