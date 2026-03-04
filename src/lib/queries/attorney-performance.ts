import { db } from "@/lib/db";
import { cases, caseAssignments } from "@/lib/db/schema/cases";
import { timeEntries } from "@/lib/db/schema/time-expenses";
import { sql, eq, and, isNull, inArray } from "drizzle-orm";

export async function getAttorneyPerformanceMetrics(
  attorneyId: string,
  userId: string
) {
  const [casesResolved, avgDuration, billingEff, utilization] = await Promise.all([
    // Cases won/settled
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(caseAssignments)
      .innerJoin(cases, eq(caseAssignments.caseId, cases.id))
      .where(
        and(
          eq(caseAssignments.userId, userId),
          isNull(caseAssignments.unassignedAt),
          inArray(cases.status, ["resolved", "closed"])
        )
      ),

    // Average case duration (days)
    db.execute<{ avg_days: number }>(sql`
      SELECT coalesce(avg(extract(epoch from (c.updated_at - c.created_at)) / 86400), 0)::float as avg_days
      FROM case_assignments ca
      INNER JOIN cases c ON ca.case_id = c.id
      WHERE ca.user_id = ${userId}
        AND ca.unassigned_at IS NULL
        AND c.status IN ('resolved', 'closed')
    `),

    // Billing efficiency
    db.execute<{ invoiced: number; collected: number }>(sql`
      SELECT
        coalesce(sum(i.total_amount::numeric), 0)::float as invoiced,
        coalesce(sum(i.paid_amount::numeric), 0)::float as collected
      FROM case_assignments ca
      INNER JOIN cases c ON ca.case_id = c.id
      INNER JOIN invoices i ON i.case_id = c.id
      WHERE ca.user_id = ${userId}
        AND ca.unassigned_at IS NULL
    `),

    // Utilization rate (billable hours this month / available hours)
    db
      .select({
        billableHours: sql<number>`coalesce(sum(${timeEntries.hours}::numeric), 0)::float`,
      })
      .from(timeEntries)
      .where(
        and(
          eq(timeEntries.userId, userId),
          eq(timeEntries.isBillable, true),
          sql`${timeEntries.date} >= date_trunc('month', now())`
        )
      ),
  ]);

  const casesWonSettled = casesResolved[0]?.count ?? 0;
  const avgCaseDuration = Math.round(
    (avgDuration.rows?.[0]?.avg_days ?? 0) as number
  );

  const billingData = billingEff.rows?.[0] as
    | { invoiced: number; collected: number }
    | undefined;
  const invoiced = billingData?.invoiced ?? 0;
  const collected = billingData?.collected ?? 0;
  const billingEfficiency = invoiced > 0 ? Math.round((collected / invoiced) * 100) : 0;

  const billableHours = utilization[0]?.billableHours ?? 0;
  // Assume ~22 working days/month, 8 hours/day
  const availableHours = 22 * 8;
  const utilizationRate =
    availableHours > 0 ? Math.round((billableHours / availableHours) * 100) : 0;

  return {
    casesWonSettled,
    avgCaseDuration,
    billingEfficiency,
    utilizationRate,
    billableHours,
  };
}

export async function getAttorneyRevenue(userId: string) {
  const result = await db.execute<{ revenue: number }>(sql`
    SELECT coalesce(sum(p.amount::numeric), 0)::float as revenue
    FROM case_assignments ca
    INNER JOIN cases c ON ca.case_id = c.id
    INNER JOIN invoices i ON i.case_id = c.id
    INNER JOIN payments p ON p.invoice_id = i.id
    WHERE ca.user_id = ${userId}
      AND ca.unassigned_at IS NULL
  `);
  return (result.rows?.[0]?.revenue ?? 0) as number;
}

export async function getAttorneyCasesByStatus(userId: string) {
  return db
    .select({
      status: cases.status,
      count: sql<number>`count(*)::int`,
    })
    .from(caseAssignments)
    .innerJoin(cases, eq(caseAssignments.caseId, cases.id))
    .where(
      and(eq(caseAssignments.userId, userId), isNull(caseAssignments.unassignedAt))
    )
    .groupBy(cases.status);
}
