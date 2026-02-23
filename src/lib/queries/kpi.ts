import { db } from "@/lib/db";
import { invoices, payments } from "@/lib/db/schema/billing";
import { timeEntries } from "@/lib/db/schema/time-expenses";
import { sql, and, gte, lte, ne, eq } from "drizzle-orm";

/** Utilization: billable hours / available hours (assuming 8h/day, 22 days/month) */
export async function getUtilizationRate(startDate: Date, endDate: Date) {
  const result = await db
    .select({
      totalBillableHours: sql<number>`coalesce(sum(case when ${timeEntries.isBillable} then ${timeEntries.hours}::numeric else 0 end), 0)::float`,
      totalHours: sql<number>`coalesce(sum(${timeEntries.hours}::numeric), 0)::float`,
      attorneyCount: sql<number>`count(distinct ${timeEntries.userId})::int`,
    })
    .from(timeEntries)
    .where(and(gte(timeEntries.date, startDate), lte(timeEntries.date, endDate)));

  const { totalBillableHours, totalHours, attorneyCount } = result[0] ?? {
    totalBillableHours: 0,
    totalHours: 0,
    attorneyCount: 0,
  };

  // Available hours: attorneys * working days in period * 8 hours
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const workingDays = Math.round(days * (5 / 7)); // approximate
  const availableHours = Math.max(1, (attorneyCount || 1) * workingDays * 8);

  return {
    rate: Math.min(100, (totalBillableHours / availableHours) * 100),
    billableHours: totalBillableHours,
    totalHours,
    availableHours,
  };
}

/** Realization: total invoiced / total billable time value */
export async function getRealizationRate(startDate: Date, endDate: Date) {
  const [timeResult, invoiceResult] = await Promise.all([
    db
      .select({
        totalValue: sql<number>`coalesce(sum(case when ${timeEntries.isBillable} then ${timeEntries.amount}::numeric else 0 end), 0)::float`,
      })
      .from(timeEntries)
      .where(and(gte(timeEntries.date, startDate), lte(timeEntries.date, endDate))),
    db
      .select({
        totalInvoiced: sql<number>`coalesce(sum(${invoices.totalAmount}::numeric), 0)::float`,
      })
      .from(invoices)
      .where(and(gte(invoices.createdAt, startDate), lte(invoices.createdAt, endDate))),
  ]);

  const totalValue = timeResult[0]?.totalValue ?? 0;
  const totalInvoiced = invoiceResult[0]?.totalInvoiced ?? 0;

  return {
    rate: totalValue > 0 ? Math.min(100, (totalInvoiced / totalValue) * 100) : 0,
    totalBillableValue: totalValue,
    totalInvoiced,
  };
}

/** Collection: total collected / total invoiced */
export async function getCollectionRate(startDate: Date, endDate: Date) {
  const [invoiceResult, paymentResult] = await Promise.all([
    db
      .select({
        totalInvoiced: sql<number>`coalesce(sum(${invoices.totalAmount}::numeric), 0)::float`,
      })
      .from(invoices)
      .where(
        and(
          gte(invoices.createdAt, startDate),
          lte(invoices.createdAt, endDate),
          ne(invoices.status, "cancelled")
        )
      ),
    db
      .select({
        totalCollected: sql<number>`coalesce(sum(${payments.amount}::numeric), 0)::float`,
      })
      .from(payments)
      .where(and(gte(payments.paymentDate, startDate), lte(payments.paymentDate, endDate))),
  ]);

  const totalInvoiced = invoiceResult[0]?.totalInvoiced ?? 0;
  const totalCollected = paymentResult[0]?.totalCollected ?? 0;

  return {
    rate: totalInvoiced > 0 ? Math.min(100, (totalCollected / totalInvoiced) * 100) : 0,
    totalInvoiced,
    totalCollected,
  };
}

/** AR Aging: outstanding invoices grouped by age buckets */
export async function getARAgingBuckets() {
  const result = await db
    .select({
      bucket: sql<string>`CASE
        WHEN ${invoices.dueDate} >= NOW() THEN 'current'
        WHEN ${invoices.dueDate} >= NOW() - INTERVAL '30 days' THEN '1-30'
        WHEN ${invoices.dueDate} >= NOW() - INTERVAL '60 days' THEN '31-60'
        WHEN ${invoices.dueDate} >= NOW() - INTERVAL '90 days' THEN '61-90'
        ELSE '90+'
      END`,
      total: sql<number>`coalesce(sum(${invoices.totalAmount}::numeric - ${invoices.paidAmount}::numeric), 0)::float`,
      count: sql<number>`count(*)::int`,
    })
    .from(invoices)
    .where(
      and(
        ne(invoices.status, "paid"),
        ne(invoices.status, "cancelled"),
        ne(invoices.status, "draft")
      )
    )
    .groupBy(sql`CASE
        WHEN ${invoices.dueDate} >= NOW() THEN 'current'
        WHEN ${invoices.dueDate} >= NOW() - INTERVAL '30 days' THEN '1-30'
        WHEN ${invoices.dueDate} >= NOW() - INTERVAL '60 days' THEN '31-60'
        WHEN ${invoices.dueDate} >= NOW() - INTERVAL '90 days' THEN '61-90'
        ELSE '90+'
      END`);

  // Ensure all buckets exist
  const bucketOrder = ["current", "1-30", "31-60", "61-90", "90+"];
  const bucketMap = new Map(result.map((r) => [r.bucket, r]));

  return bucketOrder.map((bucket) => ({
    bucket,
    total: bucketMap.get(bucket)?.total ?? 0,
    count: bucketMap.get(bucket)?.count ?? 0,
  }));
}

/** Attorney time tracked today/this week */
export async function getAttorneyTimeStats(userId: string) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeek = now.getDay();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todayResult, weekResult, monthResult] = await Promise.all([
    db
      .select({
        hours: sql<number>`coalesce(sum(${timeEntries.hours}::numeric), 0)::float`,
        billable: sql<number>`coalesce(sum(case when ${timeEntries.isBillable} then ${timeEntries.hours}::numeric else 0 end), 0)::float`,
      })
      .from(timeEntries)
      .where(and(eq(timeEntries.userId, userId), gte(timeEntries.date, todayStart))),
    db
      .select({
        hours: sql<number>`coalesce(sum(${timeEntries.hours}::numeric), 0)::float`,
        billable: sql<number>`coalesce(sum(case when ${timeEntries.isBillable} then ${timeEntries.hours}::numeric else 0 end), 0)::float`,
      })
      .from(timeEntries)
      .where(and(eq(timeEntries.userId, userId), gte(timeEntries.date, weekStart))),
    db
      .select({
        hours: sql<number>`coalesce(sum(${timeEntries.hours}::numeric), 0)::float`,
        billable: sql<number>`coalesce(sum(case when ${timeEntries.isBillable} then ${timeEntries.hours}::numeric else 0 end), 0)::float`,
      })
      .from(timeEntries)
      .where(and(eq(timeEntries.userId, userId), gte(timeEntries.date, monthStart))),
  ]);

  return {
    today: { hours: todayResult[0]?.hours ?? 0, billable: todayResult[0]?.billable ?? 0 },
    week: { hours: weekResult[0]?.hours ?? 0, billable: weekResult[0]?.billable ?? 0 },
    month: { hours: monthResult[0]?.hours ?? 0, billable: monthResult[0]?.billable ?? 0 },
  };
}
