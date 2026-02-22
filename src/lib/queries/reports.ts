import { db } from "@/lib/db";
import { cases } from "@/lib/db/schema/cases";
import { invoices, payments } from "@/lib/db/schema/billing";
import { timeEntries } from "@/lib/db/schema/time-expenses";
import { clients } from "@/lib/db/schema/clients";
import { sql, eq, gte, lte, and } from "drizzle-orm";

export async function getCaseloadReport() {
  return db
    .select({
      status: cases.status,
      count: sql<number>`count(*)::int`,
    })
    .from(cases)
    .groupBy(cases.status);
}

export async function getRevenueReport(startDate?: Date, endDate?: Date) {
  const conditions = [];
  if (startDate) conditions.push(gte(payments.paymentDate, startDate));
  if (endDate) conditions.push(lte(payments.paymentDate, endDate));

  const result = await db
    .select({
      month: sql<string>`to_char(${payments.paymentDate}, 'YYYY-MM')`,
      total: sql<number>`sum(${payments.amount}::numeric)::numeric`,
    })
    .from(payments)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(sql`to_char(${payments.paymentDate}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${payments.paymentDate}, 'YYYY-MM')`);

  return result;
}

export async function getBillingReport() {
  return db
    .select({
      status: invoices.status,
      count: sql<number>`count(*)::int`,
      totalAmount: sql<number>`sum(${invoices.totalAmount}::numeric)::numeric`,
      paidAmount: sql<number>`sum(${invoices.paidAmount}::numeric)::numeric`,
    })
    .from(invoices)
    .groupBy(invoices.status);
}

export async function getProductivityReport() {
  return db
    .select({
      month: sql<string>`to_char(${timeEntries.date}, 'YYYY-MM')`,
      totalHours: sql<number>`sum(${timeEntries.hours}::numeric)::numeric`,
      billableHours: sql<number>`sum(case when ${timeEntries.isBillable} then ${timeEntries.hours}::numeric else 0 end)::numeric`,
    })
    .from(timeEntries)
    .groupBy(sql`to_char(${timeEntries.date}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${timeEntries.date}, 'YYYY-MM')`);
}

export async function getClientReport() {
  return db
    .select({
      status: clients.status,
      type: clients.type,
      count: sql<number>`count(*)::int`,
    })
    .from(clients)
    .groupBy(clients.status, clients.type);
}
