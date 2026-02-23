import { db } from "@/lib/db";
import { cases } from "@/lib/db/schema/cases";
import { invoices, payments } from "@/lib/db/schema/billing";
import { timeEntries } from "@/lib/db/schema/time-expenses";
import { clients } from "@/lib/db/schema/clients";
import { sql, gte, lte, and } from "drizzle-orm";

interface DateRange {
  startDate?: Date;
  endDate?: Date;
}

export async function getCaseloadReport({ startDate, endDate }: DateRange = {}) {
  const conditions = [];
  if (startDate) conditions.push(gte(cases.createdAt, startDate));
  if (endDate) conditions.push(lte(cases.createdAt, endDate));

  return db
    .select({
      status: cases.status,
      count: sql<number>`count(*)::int`,
    })
    .from(cases)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(cases.status);
}

export async function getRevenueReport({ startDate, endDate }: DateRange = {}) {
  const conditions = [];
  if (startDate) conditions.push(gte(payments.paymentDate, startDate));
  if (endDate) conditions.push(lte(payments.paymentDate, endDate));

  return db
    .select({
      month: sql<string>`to_char(${payments.paymentDate}, 'YYYY-MM')`,
      total: sql<number>`sum(${payments.amount}::numeric)::numeric`,
    })
    .from(payments)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(sql`to_char(${payments.paymentDate}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${payments.paymentDate}, 'YYYY-MM')`);
}

export async function getBillingReport({ startDate, endDate }: DateRange = {}) {
  const conditions = [];
  if (startDate) conditions.push(gte(invoices.createdAt, startDate));
  if (endDate) conditions.push(lte(invoices.createdAt, endDate));

  return db
    .select({
      status: invoices.status,
      count: sql<number>`count(*)::int`,
      totalAmount: sql<number>`sum(${invoices.totalAmount}::numeric)::numeric`,
      paidAmount: sql<number>`sum(${invoices.paidAmount}::numeric)::numeric`,
    })
    .from(invoices)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(invoices.status);
}

export async function getProductivityReport({ startDate, endDate }: DateRange = {}) {
  const conditions = [];
  if (startDate) conditions.push(gte(timeEntries.date, startDate));
  if (endDate) conditions.push(lte(timeEntries.date, endDate));

  return db
    .select({
      month: sql<string>`to_char(${timeEntries.date}, 'YYYY-MM')`,
      totalHours: sql<number>`sum(${timeEntries.hours}::numeric)::numeric`,
      billableHours: sql<number>`sum(case when ${timeEntries.isBillable} then ${timeEntries.hours}::numeric else 0 end)::numeric`,
    })
    .from(timeEntries)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(sql`to_char(${timeEntries.date}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${timeEntries.date}, 'YYYY-MM')`);
}

export async function getClientReport({ startDate, endDate }: DateRange = {}) {
  const conditions = [];
  if (startDate) conditions.push(gte(clients.createdAt, startDate));
  if (endDate) conditions.push(lte(clients.createdAt, endDate));

  return db
    .select({
      status: clients.status,
      type: clients.type,
      count: sql<number>`count(*)::int`,
    })
    .from(clients)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(clients.status, clients.type);
}
