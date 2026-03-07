import { db } from "@/lib/db";
import { cases } from "@/lib/db/schema/cases";
import {
  invoices,
  payments,
  trustAccounts,
  trustTransactions,
} from "@/lib/db/schema/billing";
import {
  timeEntries,
  expenses,
} from "@/lib/db/schema/time-expenses";
import { clients } from "@/lib/db/schema/clients";
import { attorneys } from "@/lib/db/schema/attorneys";
import { users } from "@/lib/db/schema/auth";
import { deadlines } from "@/lib/db/schema/calendar";
import {
  sql,
  gte,
  lte,
  and,
  eq,
  isNull,
  isNotNull,
  or,
} from "drizzle-orm";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DateRange {
  startDate?: Date;
  endDate?: Date;
}

// Default to last 12 months if no date range provided
function withDefaultDateRange(range: DateRange): {
  startDate: Date;
  endDate: Date;
} {
  const endDate = range.endDate ?? new Date();
  const startDate =
    range.startDate ??
    new Date(new Date().setFullYear(endDate.getFullYear() - 1));
  return { startDate, endDate };
}

// ===========================================================================
// FINANCIAL REPORTS
// ===========================================================================

/**
 * 1. Revenue Report — Monthly revenue (payments received), grouped by month.
 */
export async function getRevenueReport(organizationId: string, range: DateRange = {}) {
  const { startDate, endDate } = withDefaultDateRange(range);

  return db
    .select({
      month: sql<string>`to_char(${payments.paymentDate}, 'YYYY-MM')`,
      totalRevenue: sql<number>`coalesce(sum(${payments.amount}::numeric), 0)::numeric`,
      paymentCount: sql<number>`count(*)::int`,
    })
    .from(payments)
    .where(
      and(
        eq(payments.organizationId, organizationId),
        gte(payments.paymentDate, startDate),
        lte(payments.paymentDate, endDate),
      ),
    )
    .groupBy(sql`to_char(${payments.paymentDate}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${payments.paymentDate}, 'YYYY-MM')`);
}

/**
 * 2. Accounts Receivable Aging Report — AR aging buckets with invoice details.
 *    Considers invoices that are not fully paid and not cancelled/written_off/draft.
 */
export async function getAccountsReceivableAgingReport(organizationId: string) {
  return db
    .select({
      invoiceId: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      clientName: sql<string>`coalesce(${clients.companyName}, ${clients.firstName} || ' ' || ${clients.lastName})`,
      totalAmount: sql<number>`${invoices.totalAmount}::numeric`,
      paidAmount: sql<number>`${invoices.paidAmount}::numeric`,
      balance: sql<number>`(${invoices.totalAmount}::numeric - ${invoices.paidAmount}::numeric)`,
      dueDate: invoices.dueDate,
      daysOutstanding: sql<number>`extract(day from now() - ${invoices.dueDate})::int`,
      agingBucket: sql<string>`
        case
          when ${invoices.dueDate} >= now() then 'Current'
          when extract(day from now() - ${invoices.dueDate}) between 1 and 30 then '1-30 days'
          when extract(day from now() - ${invoices.dueDate}) between 31 and 60 then '31-60 days'
          when extract(day from now() - ${invoices.dueDate}) between 61 and 90 then '61-90 days'
          else '90+ days'
        end
      `,
    })
    .from(invoices)
    .innerJoin(clients, eq(invoices.clientId, clients.id))
    .where(
      and(
        eq(invoices.organizationId, organizationId),
        sql`${invoices.totalAmount}::numeric > ${invoices.paidAmount}::numeric`,
        sql`${invoices.status} not in ('draft', 'cancelled', 'written_off')`,
      ),
    )
    .orderBy(sql`${invoices.dueDate} asc nulls last`);
}

/**
 * 3. Trust Account Summary Report — All trust accounts with balances, type, client.
 */
export async function getTrustAccountSummaryReport(organizationId: string) {
  return db
    .select({
      accountId: trustAccounts.id,
      accountName: trustAccounts.accountName,
      accountNumber: trustAccounts.accountNumber,
      type: trustAccounts.type,
      balance: sql<number>`${trustAccounts.balance}::numeric`,
      bankName: trustAccounts.bankName,
      currency: trustAccounts.currency,
      clientName: sql<string>`coalesce(${clients.companyName}, ${clients.firstName} || ' ' || ${clients.lastName})`,
      createdAt: trustAccounts.createdAt,
    })
    .from(trustAccounts)
    .leftJoin(clients, eq(trustAccounts.clientId, clients.id))
    .where(eq(trustAccounts.organizationId, organizationId))
    .orderBy(sql`${trustAccounts.accountName} asc`);
}

/**
 * 4. Trust Transaction Report — Deposits/withdrawals by account with details.
 */
export async function getTrustTransactionReport(organizationId: string, range: DateRange = {}) {
  const { startDate, endDate } = withDefaultDateRange(range);

  return db
    .select({
      transactionId: trustTransactions.id,
      accountName: trustAccounts.accountName,
      accountNumber: trustAccounts.accountNumber,
      transactionType: trustTransactions.type,
      amount: sql<number>`${trustTransactions.amount}::numeric`,
      description: trustTransactions.description,
      reference: trustTransactions.reference,
      performedByName: users.name,
      caseNumber: cases.caseNumber,
      caseTitle: cases.title,
      createdAt: trustTransactions.createdAt,
    })
    .from(trustTransactions)
    .innerJoin(trustAccounts, eq(trustTransactions.accountId, trustAccounts.id))
    .innerJoin(users, eq(trustTransactions.performedBy, users.id))
    .leftJoin(cases, eq(trustTransactions.caseId, cases.id))
    .where(
      and(
        eq(trustTransactions.organizationId, organizationId),
        gte(trustTransactions.createdAt, startDate),
        lte(trustTransactions.createdAt, endDate),
      ),
    )
    .orderBy(sql`${trustTransactions.createdAt} desc`);
}

/**
 * 5. WIP (Work In Progress) Report — Unbilled time entries and expenses by case.
 */
export async function getWIPReport(organizationId: string) {
  const unbilledTime = db
    .select({
      caseId: timeEntries.caseId,
      caseNumber: cases.caseNumber,
      caseTitle: cases.title,
      clientName: sql<string>`coalesce(${clients.companyName}, ${clients.firstName} || ' ' || ${clients.lastName})`,
      unbilledTimeHours: sql<number>`coalesce(sum(${timeEntries.hours}::numeric), 0)::numeric`,
      unbilledTimeAmount: sql<number>`coalesce(sum(${timeEntries.amount}::numeric), 0)::numeric`,
      unbilledExpenseAmount: sql<number>`0::numeric`,
      totalWIP: sql<number>`coalesce(sum(${timeEntries.amount}::numeric), 0)::numeric`,
    })
    .from(timeEntries)
    .innerJoin(cases, eq(timeEntries.caseId, cases.id))
    .innerJoin(clients, eq(cases.clientId, clients.id))
    .where(
      and(
        eq(timeEntries.organizationId, organizationId),
        eq(timeEntries.isBilled, false),
        isNotNull(timeEntries.caseId),
      ),
    )
    .groupBy(
      timeEntries.caseId,
      cases.caseNumber,
      cases.title,
      clients.companyName,
      clients.firstName,
      clients.lastName,
    );

  const unbilledExpenses = db
    .select({
      caseId: expenses.caseId,
      caseNumber: cases.caseNumber,
      caseTitle: cases.title,
      clientName: sql<string>`coalesce(${clients.companyName}, ${clients.firstName} || ' ' || ${clients.lastName})`,
      unbilledTimeHours: sql<number>`0::numeric`,
      unbilledTimeAmount: sql<number>`0::numeric`,
      unbilledExpenseAmount: sql<number>`coalesce(sum(${expenses.amount}::numeric), 0)::numeric`,
      totalWIP: sql<number>`coalesce(sum(${expenses.amount}::numeric), 0)::numeric`,
    })
    .from(expenses)
    .innerJoin(cases, eq(expenses.caseId, cases.id))
    .innerJoin(clients, eq(cases.clientId, clients.id))
    .where(
      and(
        eq(expenses.organizationId, organizationId),
        eq(expenses.isBilled, false),
        isNotNull(expenses.caseId),
      ),
    )
    .groupBy(
      expenses.caseId,
      cases.caseNumber,
      cases.title,
      clients.companyName,
      clients.firstName,
      clients.lastName,
    );

  const [timeRows, expenseRows] = await Promise.all([
    unbilledTime,
    unbilledExpenses,
  ]);

  // Merge time and expense rows by caseId
  const wipMap = new Map<
    string,
    {
      caseId: string;
      caseNumber: string;
      caseTitle: string;
      clientName: string;
      unbilledTimeHours: number;
      unbilledTimeAmount: number;
      unbilledExpenseAmount: number;
      totalWIP: number;
    }
  >();

  for (const row of timeRows) {
    if (!row.caseId) continue;
    wipMap.set(row.caseId, {
      caseId: row.caseId,
      caseNumber: row.caseNumber,
      caseTitle: row.caseTitle,
      clientName: row.clientName,
      unbilledTimeHours: Number(row.unbilledTimeHours),
      unbilledTimeAmount: Number(row.unbilledTimeAmount),
      unbilledExpenseAmount: 0,
      totalWIP: Number(row.unbilledTimeAmount),
    });
  }

  for (const row of expenseRows) {
    if (!row.caseId) continue;
    const existing = wipMap.get(row.caseId);
    if (existing) {
      existing.unbilledExpenseAmount = Number(row.unbilledExpenseAmount);
      existing.totalWIP =
        existing.unbilledTimeAmount + Number(row.unbilledExpenseAmount);
    } else {
      wipMap.set(row.caseId, {
        caseId: row.caseId,
        caseNumber: row.caseNumber,
        caseTitle: row.caseTitle,
        clientName: row.clientName,
        unbilledTimeHours: 0,
        unbilledTimeAmount: 0,
        unbilledExpenseAmount: Number(row.unbilledExpenseAmount),
        totalWIP: Number(row.unbilledExpenseAmount),
      });
    }
  }

  return Array.from(wipMap.values()).sort((a, b) => b.totalWIP - a.totalWIP);
}

/**
 * 6. Collection Report — Total billed vs collected by month with collection rate.
 */
export async function getCollectionReport(organizationId: string, range: DateRange = {}) {
  const { startDate, endDate } = withDefaultDateRange(range);

  const billedByMonth = db
    .select({
      month: sql<string>`to_char(${invoices.createdAt}, 'YYYY-MM')`,
      totalBilled: sql<number>`coalesce(sum(${invoices.totalAmount}::numeric), 0)::numeric`,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.organizationId, organizationId),
        gte(invoices.createdAt, startDate),
        lte(invoices.createdAt, endDate),
        sql`${invoices.status} not in ('draft', 'cancelled')`,
      ),
    )
    .groupBy(sql`to_char(${invoices.createdAt}, 'YYYY-MM')`);

  const collectedByMonth = db
    .select({
      month: sql<string>`to_char(${payments.paymentDate}, 'YYYY-MM')`,
      totalCollected: sql<number>`coalesce(sum(${payments.amount}::numeric), 0)::numeric`,
    })
    .from(payments)
    .where(
      and(
        eq(payments.organizationId, organizationId),
        gte(payments.paymentDate, startDate),
        lte(payments.paymentDate, endDate),
      ),
    )
    .groupBy(sql`to_char(${payments.paymentDate}, 'YYYY-MM')`);

  const [billedRows, collectedRows] = await Promise.all([
    billedByMonth,
    collectedByMonth,
  ]);

  const collectedMap = new Map<string, number>();
  for (const row of collectedRows) {
    collectedMap.set(row.month, Number(row.totalCollected));
  }

  const months = new Set<string>();
  for (const row of billedRows) months.add(row.month);
  for (const row of collectedRows) months.add(row.month);

  return Array.from(months)
    .sort()
    .map((month) => {
      const billed =
        Number(billedRows.find((r) => r.month === month)?.totalBilled) || 0;
      const collected = collectedMap.get(month) || 0;
      const collectionRate =
        billed > 0 ? Math.round((collected / billed) * 10000) / 100 : 0;
      return {
        month,
        totalBilled: billed,
        totalCollected: collected,
        collectionRate,
      };
    });
}

/**
 * 7. Expense Summary Report — Expenses grouped by category with totals.
 */
export async function getExpenseSummaryReport(organizationId: string, range: DateRange = {}) {
  const { startDate, endDate } = withDefaultDateRange(range);

  return db
    .select({
      category: expenses.category,
      totalAmount: sql<number>`coalesce(sum(${expenses.amount}::numeric), 0)::numeric`,
      count: sql<number>`count(*)::int`,
      billableAmount: sql<number>`coalesce(sum(case when ${expenses.isBillable} then ${expenses.amount}::numeric else 0 end), 0)::numeric`,
      nonBillableAmount: sql<number>`coalesce(sum(case when not ${expenses.isBillable} then ${expenses.amount}::numeric else 0 end), 0)::numeric`,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.organizationId, organizationId),
        gte(expenses.date, startDate),
        lte(expenses.date, endDate),
      ),
    )
    .groupBy(expenses.category)
    .orderBy(sql`sum(${expenses.amount}::numeric) desc`);
}

// ===========================================================================
// OPERATIONAL REPORTS
// ===========================================================================

/**
 * 8. Caseload Report — Cases grouped by status with count.
 */
export async function getCaseloadReport(organizationId: string, range: DateRange = {}) {
  const { startDate, endDate } = withDefaultDateRange(range);

  return db
    .select({
      status: cases.status,
      count: sql<number>`count(*)::int`,
    })
    .from(cases)
    .where(
      and(
        eq(cases.organizationId, organizationId),
        gte(cases.createdAt, startDate),
        lte(cases.createdAt, endDate),
      ),
    )
    .groupBy(cases.status);
}

/**
 * 9. Case Type Report — Cases grouped by caseType with count.
 */
export async function getCaseTypeReport(organizationId: string, range: DateRange = {}) {
  const { startDate, endDate } = withDefaultDateRange(range);

  return db
    .select({
      caseType: cases.caseType,
      count: sql<number>`count(*)::int`,
      openCount: sql<number>`count(*) filter (where ${cases.status} in ('open', 'in_progress', 'hearing'))::int`,
      closedCount: sql<number>`count(*) filter (where ${cases.status} in ('resolved', 'closed', 'archived'))::int`,
    })
    .from(cases)
    .where(
      and(
        eq(cases.organizationId, organizationId),
        gte(cases.createdAt, startDate),
        lte(cases.createdAt, endDate),
      ),
    )
    .groupBy(cases.caseType)
    .orderBy(sql`count(*) desc`);
}

/**
 * 10. Attorney Productivity Report — Per attorney: hours, billable hours,
 *     utilization rate, and total amount billed.
 */
export async function getAttorneyProductivityReport(organizationId: string, range: DateRange = {}) {
  const { startDate, endDate } = withDefaultDateRange(range);

  return db
    .select({
      attorneyId: attorneys.id,
      attorneyName: users.name,
      barNumber: attorneys.barNumber,
      department: attorneys.department,
      totalHours: sql<number>`coalesce(sum(${timeEntries.hours}::numeric), 0)::numeric`,
      billableHours: sql<number>`coalesce(sum(case when ${timeEntries.isBillable} then ${timeEntries.hours}::numeric else 0 end), 0)::numeric`,
      nonBillableHours: sql<number>`coalesce(sum(case when not ${timeEntries.isBillable} then ${timeEntries.hours}::numeric else 0 end), 0)::numeric`,
      billedAmount: sql<number>`coalesce(sum(case when ${timeEntries.isBilled} then ${timeEntries.amount}::numeric else 0 end), 0)::numeric`,
      utilizationRate: sql<number>`
        case
          when coalesce(sum(${timeEntries.hours}::numeric), 0) = 0 then 0
          else round(
            coalesce(sum(case when ${timeEntries.isBillable} then ${timeEntries.hours}::numeric else 0 end), 0)
            / sum(${timeEntries.hours}::numeric) * 100,
            2
          )
        end::numeric
      `,
    })
    .from(attorneys)
    .innerJoin(users, eq(attorneys.userId, users.id))
    .leftJoin(
      timeEntries,
      and(
        eq(timeEntries.userId, attorneys.userId),
        gte(timeEntries.date, startDate),
        lte(timeEntries.date, endDate),
      ),
    )
    .where(and(eq(attorneys.organizationId, organizationId), eq(attorneys.isActive, true)))
    .groupBy(attorneys.id, users.name, attorneys.barNumber, attorneys.department)
    .orderBy(sql`coalesce(sum(${timeEntries.hours}::numeric), 0) desc`);
}

/**
 * 11. Matter Profitability Report — Per case: invoiced, paid, time cost,
 *     expenses, and profit margin.
 */
export async function getMatterProfitabilityReport(organizationId: string, range: DateRange = {}) {
  const { startDate, endDate } = withDefaultDateRange(range);

  // Get invoiced/paid per case
  const invoiceData = db
    .select({
      caseId: invoices.caseId,
      totalInvoiced: sql<number>`coalesce(sum(${invoices.totalAmount}::numeric), 0)::numeric`.as("totalInvoiced"),
      totalPaid: sql<number>`coalesce(sum(${invoices.paidAmount}::numeric), 0)::numeric`.as("totalPaid"),
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.organizationId, organizationId),
        isNotNull(invoices.caseId),
        gte(invoices.createdAt, startDate),
        lte(invoices.createdAt, endDate),
        sql`${invoices.status} not in ('draft', 'cancelled')`,
      ),
    )
    .groupBy(invoices.caseId)
    .as("invoice_data");

  // Get time cost per case
  const timeData = db
    .select({
      caseId: timeEntries.caseId,
      totalTimeCost: sql<number>`coalesce(sum(${timeEntries.amount}::numeric), 0)::numeric`.as("totalTimeCost"),
      totalHours: sql<number>`coalesce(sum(${timeEntries.hours}::numeric), 0)::numeric`.as("totalHours"),
    })
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.organizationId, organizationId),
        isNotNull(timeEntries.caseId),
        gte(timeEntries.date, startDate),
        lte(timeEntries.date, endDate),
      ),
    )
    .groupBy(timeEntries.caseId)
    .as("time_data");

  // Get expense cost per case
  const expenseData = db
    .select({
      caseId: expenses.caseId,
      totalExpenses: sql<number>`coalesce(sum(${expenses.amount}::numeric), 0)::numeric`.as("totalExpenses"),
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.organizationId, organizationId),
        isNotNull(expenses.caseId),
        gte(expenses.date, startDate),
        lte(expenses.date, endDate),
      ),
    )
    .groupBy(expenses.caseId)
    .as("expense_data");

  return db
    .select({
      caseId: cases.id,
      caseNumber: cases.caseNumber,
      caseTitle: cases.title,
      caseStatus: cases.status,
      clientName: sql<string>`coalesce(${clients.companyName}, ${clients.firstName} || ' ' || ${clients.lastName})`,
      totalInvoiced: sql<number>`coalesce(${invoiceData.totalInvoiced}, 0)::numeric`,
      totalPaid: sql<number>`coalesce(${invoiceData.totalPaid}, 0)::numeric`,
      totalTimeCost: sql<number>`coalesce(${timeData.totalTimeCost}, 0)::numeric`,
      totalHours: sql<number>`coalesce(${timeData.totalHours}, 0)::numeric`,
      totalExpenses: sql<number>`coalesce(${expenseData.totalExpenses}, 0)::numeric`,
      totalCost: sql<number>`(coalesce(${timeData.totalTimeCost}, 0)::numeric + coalesce(${expenseData.totalExpenses}, 0)::numeric)`,
      profit: sql<number>`(coalesce(${invoiceData.totalPaid}, 0)::numeric - coalesce(${timeData.totalTimeCost}, 0)::numeric - coalesce(${expenseData.totalExpenses}, 0)::numeric)`,
      profitMargin: sql<number>`
        case
          when coalesce(${invoiceData.totalPaid}, 0)::numeric = 0 then 0
          else round(
            (coalesce(${invoiceData.totalPaid}, 0)::numeric - coalesce(${timeData.totalTimeCost}, 0)::numeric - coalesce(${expenseData.totalExpenses}, 0)::numeric)
            / coalesce(${invoiceData.totalPaid}, 0)::numeric * 100,
            2
          )
        end::numeric
      `,
    })
    .from(cases)
    .innerJoin(clients, eq(cases.clientId, clients.id))
    .leftJoin(invoiceData, eq(cases.id, invoiceData.caseId))
    .leftJoin(timeData, eq(cases.id, timeData.caseId))
    .leftJoin(expenseData, eq(cases.id, expenseData.caseId))
    .where(
      and(
        eq(cases.organizationId, organizationId),
        gte(cases.createdAt, startDate),
        lte(cases.createdAt, endDate),
      ),
    )
    .orderBy(
      sql`(coalesce(${invoiceData.totalPaid}, 0)::numeric - coalesce(${timeData.totalTimeCost}, 0)::numeric - coalesce(${expenseData.totalExpenses}, 0)::numeric) desc`,
    );
}

/**
 * 12. Client Report — Client distribution by status and type.
 */
export async function getClientReport(organizationId: string, range: DateRange = {}) {
  const { startDate, endDate } = withDefaultDateRange(range);

  return db
    .select({
      status: clients.status,
      type: clients.type,
      count: sql<number>`count(*)::int`,
    })
    .from(clients)
    .where(
      and(
        eq(clients.organizationId, organizationId),
        gte(clients.createdAt, startDate),
        lte(clients.createdAt, endDate),
      ),
    )
    .groupBy(clients.status, clients.type);
}

/**
 * 13. Billing Report — Invoice status breakdown with totals.
 */
export async function getBillingReport(organizationId: string, range: DateRange = {}) {
  const { startDate, endDate } = withDefaultDateRange(range);

  return db
    .select({
      status: invoices.status,
      count: sql<number>`count(*)::int`,
      totalAmount: sql<number>`coalesce(sum(${invoices.totalAmount}::numeric), 0)::numeric`,
      paidAmount: sql<number>`coalesce(sum(${invoices.paidAmount}::numeric), 0)::numeric`,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.organizationId, organizationId),
        gte(invoices.createdAt, startDate),
        lte(invoices.createdAt, endDate),
      ),
    )
    .groupBy(invoices.status);
}

/**
 * 14. Productivity Report — Monthly hours breakdown (total vs billable).
 */
export async function getProductivityReport(organizationId: string, range: DateRange = {}) {
  const { startDate, endDate } = withDefaultDateRange(range);

  return db
    .select({
      month: sql<string>`to_char(${timeEntries.date}, 'YYYY-MM')`,
      totalHours: sql<number>`coalesce(sum(${timeEntries.hours}::numeric), 0)::numeric`,
      billableHours: sql<number>`coalesce(sum(case when ${timeEntries.isBillable} then ${timeEntries.hours}::numeric else 0 end), 0)::numeric`,
    })
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.organizationId, organizationId),
        gte(timeEntries.date, startDate),
        lte(timeEntries.date, endDate),
      ),
    )
    .groupBy(sql`to_char(${timeEntries.date}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${timeEntries.date}, 'YYYY-MM')`);
}

// ===========================================================================
// COMPLIANCE REPORTS
// ===========================================================================

/**
 * 15. Deadline Compliance Report — Deadlines: total, completed on time,
 *     overdue, and breakdown by priority.
 */
export async function getDeadlineComplianceReport(organizationId: string, range: DateRange = {}) {
  const { startDate, endDate } = withDefaultDateRange(range);

  const byPriority = db
    .select({
      priority: deadlines.priority,
      total: sql<number>`count(*)::int`,
      completedOnTime: sql<number>`count(*) filter (where ${deadlines.completedAt} is not null and ${deadlines.completedAt} <= ${deadlines.dueDate})::int`,
      completedLate: sql<number>`count(*) filter (where ${deadlines.completedAt} is not null and ${deadlines.completedAt} > ${deadlines.dueDate})::int`,
      incomplete: sql<number>`count(*) filter (where ${deadlines.completedAt} is null)::int`,
      overdue: sql<number>`count(*) filter (where ${deadlines.completedAt} is null and ${deadlines.dueDate} < now())::int`,
      statutory: sql<number>`count(*) filter (where ${deadlines.isStatutory})::int`,
      complianceRate: sql<number>`
        case
          when count(*) = 0 then 0
          else round(
            count(*) filter (where ${deadlines.completedAt} is not null and ${deadlines.completedAt} <= ${deadlines.dueDate})::numeric
            / count(*)::numeric * 100,
            2
          )
        end::numeric
      `,
    })
    .from(deadlines)
    .where(
      and(
        eq(deadlines.organizationId, organizationId),
        gte(deadlines.dueDate, startDate),
        lte(deadlines.dueDate, endDate),
      ),
    )
    .groupBy(deadlines.priority);

  const summary = db
    .select({
      total: sql<number>`count(*)::int`,
      completedOnTime: sql<number>`count(*) filter (where ${deadlines.completedAt} is not null and ${deadlines.completedAt} <= ${deadlines.dueDate})::int`,
      completedLate: sql<number>`count(*) filter (where ${deadlines.completedAt} is not null and ${deadlines.completedAt} > ${deadlines.dueDate})::int`,
      incomplete: sql<number>`count(*) filter (where ${deadlines.completedAt} is null)::int`,
      overdue: sql<number>`count(*) filter (where ${deadlines.completedAt} is null and ${deadlines.dueDate} < now())::int`,
      statutory: sql<number>`count(*) filter (where ${deadlines.isStatutory})::int`,
      overallComplianceRate: sql<number>`
        case
          when count(*) = 0 then 0
          else round(
            count(*) filter (where ${deadlines.completedAt} is not null and ${deadlines.completedAt} <= ${deadlines.dueDate})::numeric
            / count(*)::numeric * 100,
            2
          )
        end::numeric
      `,
    })
    .from(deadlines)
    .where(
      and(
        eq(deadlines.organizationId, organizationId),
        gte(deadlines.dueDate, startDate),
        lte(deadlines.dueDate, endDate),
      ),
    );

  const [priorityRows, summaryRows] = await Promise.all([
    byPriority,
    summary,
  ]);

  return {
    summary: summaryRows[0] ?? {
      total: 0,
      completedOnTime: 0,
      completedLate: 0,
      incomplete: 0,
      overdue: 0,
      statutory: 0,
      overallComplianceRate: 0,
    },
    byPriority: priorityRows,
  };
}

/**
 * 16. PEP (Politically Exposed Persons) Report — All PEP-flagged clients
 *     with their active case count.
 */
export async function getPEPReport(organizationId: string) {
  return db
    .select({
      clientId: clients.id,
      clientName: sql<string>`coalesce(${clients.companyName}, ${clients.firstName} || ' ' || ${clients.lastName})`,
      clientType: clients.type,
      email: clients.email,
      phone: clients.phone,
      pepDetails: clients.pepDetails,
      status: clients.status,
      activeCaseCount: sql<number>`coalesce(count(${cases.id}) filter (where ${cases.status} in ('open', 'in_progress', 'hearing')), 0)::int`,
      totalCaseCount: sql<number>`coalesce(count(${cases.id}), 0)::int`,
      createdAt: clients.createdAt,
    })
    .from(clients)
    .leftJoin(cases, eq(cases.clientId, clients.id))
    .where(and(eq(clients.organizationId, organizationId), eq(clients.isPep, true)))
    .groupBy(
      clients.id,
      clients.companyName,
      clients.firstName,
      clients.lastName,
      clients.type,
      clients.email,
      clients.phone,
      clients.pepDetails,
      clients.status,
      clients.createdAt,
    )
    .orderBy(sql`${clients.lastName} asc, ${clients.firstName} asc`);
}
