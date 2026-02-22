import { db } from "@/lib/db";
import { cases } from "@/lib/db/schema/cases";
import { clients } from "@/lib/db/schema/clients";
import { users } from "@/lib/db/schema/auth";
import { invoices } from "@/lib/db/schema/billing";
import { payments } from "@/lib/db/schema/billing";
import { deadlines } from "@/lib/db/schema/calendar";
import { sql, eq, and, lte, isNull, desc, ne, gte } from "drizzle-orm";

export async function getMonthlyRevenue() {
  const result = await db.execute<{ month: string; revenue: number }>(sql`
    SELECT
      to_char(date_trunc('month', ${payments.paymentDate}), 'Mon') as month,
      coalesce(sum(${payments.amount}::numeric), 0)::float as revenue
    FROM ${payments}
    WHERE ${payments.paymentDate} >= date_trunc('month', now()) - interval '11 months'
    GROUP BY date_trunc('month', ${payments.paymentDate})
    ORDER BY date_trunc('month', ${payments.paymentDate})
  `);
  return result.rows ?? [];
}

export async function getCaseStatusDistribution() {
  const result = await db
    .select({
      status: cases.status,
      count: sql<number>`count(*)::int`,
    })
    .from(cases)
    .groupBy(cases.status);
  return result;
}

export async function getRecentCases(limit = 10) {
  const result = await db
    .select({
      id: cases.id,
      caseNumber: cases.caseNumber,
      title: cases.title,
      status: cases.status,
      createdAt: cases.createdAt,
      clientName: sql<string>`${clients.firstName} || ' ' || ${clients.lastName}`,
    })
    .from(cases)
    .innerJoin(clients, eq(cases.clientId, clients.id))
    .orderBy(desc(cases.createdAt))
    .limit(limit);
  return result;
}

export async function getUpcomingDeadlines(limit = 10) {
  const now = new Date();
  const result = await db
    .select({
      id: deadlines.id,
      title: deadlines.title,
      dueDate: deadlines.dueDate,
      priority: deadlines.priority,
      caseId: deadlines.caseId,
      caseNumber: cases.caseNumber,
      assignedToName: users.name,
    })
    .from(deadlines)
    .leftJoin(cases, eq(deadlines.caseId, cases.id))
    .leftJoin(users, eq(deadlines.assignedTo, users.id))
    .where(and(gte(deadlines.dueDate, now), isNull(deadlines.completedAt)))
    .orderBy(deadlines.dueDate)
    .limit(limit);
  return result;
}

export async function getOverdueInvoices() {
  const now = new Date();
  const result = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      clientName: sql<string>`${clients.firstName} || ' ' || ${clients.lastName}`,
      totalAmount: invoices.totalAmount,
      paidAmount: invoices.paidAmount,
      dueDate: invoices.dueDate,
    })
    .from(invoices)
    .innerJoin(clients, eq(invoices.clientId, clients.id))
    .where(
      and(
        lte(invoices.dueDate, now),
        ne(invoices.status, "paid"),
        ne(invoices.status, "cancelled")
      )
    )
    .orderBy(invoices.dueDate)
    .limit(20);
  return result;
}
