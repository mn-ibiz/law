import { Suspense } from "react";
import { requireOrg } from "@/lib/auth/get-session";
import {
  getRevenueReport,
  getAccountsReceivableAgingReport,
  getTrustAccountSummaryReport,
  getTrustTransactionReport,
  getWIPReport,
  getCollectionReport,
  getExpenseSummaryReport,
  getCaseloadReport,
  getCaseTypeReport,
  getAttorneyProductivityReport,
  getMatterProfitabilityReport,
  getBillingReport,
  getProductivityReport,
  getClientReport,
  getDeadlineComplianceReport,
  getPEPReport,
} from "@/lib/queries/reports";
import { formatCurrency } from "@/lib/utils/format";
import { getOrgConfig } from "@/lib/utils/tenant-config";
import { ReportFilters } from "@/components/reports/report-filters";
import { ReportCard } from "@/components/reports/report-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  CreditCard,
  Clock,
  Users,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Briefcase,
  Scale,
  ShieldAlert,
  Landmark,
  ArrowLeftRight,
  PieChart,
  Wallet,
  Gavel,
  UserCheck,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports",
  description: "Comprehensive financial, operational, and compliance reports",
};

function parseDateParam(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
}

function fmt(n: unknown, currency: string, locale: string): string {
  return formatCurrency(Number(n ?? 0), currency, locale);
}

function fmtNum(n: unknown): string {
  return Number(n ?? 0).toFixed(2);
}

function fmtPct(n: unknown): string {
  return `${Number(n ?? 0).toFixed(1)}%`;
}

// ---------------------------------------------------------------------------
// Financial Reports Tab
// ---------------------------------------------------------------------------

async function FinancialReports({
  organizationId,
  startDate,
  endDate,
}: {
  organizationId: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const dateRange = { startDate, endDate };
  const dateRangeLabel = startDate && endDate
    ? {
        start: startDate.toLocaleDateString("en-KE"),
        end: endDate.toLocaleDateString("en-KE"),
      }
    : undefined;

  const [
    revenue,
    arAging,
    trustSummary,
    trustTransactions,
    wip,
    collection,
    expenseSummary,
    billing,
    config,
  ] = await Promise.all([
    getRevenueReport(organizationId, dateRange),
    getAccountsReceivableAgingReport(organizationId),
    getTrustAccountSummaryReport(organizationId),
    getTrustTransactionReport(organizationId, dateRange),
    getWIPReport(organizationId),
    getCollectionReport(organizationId, dateRange),
    getExpenseSummaryReport(organizationId, dateRange),
    getBillingReport(organizationId, dateRange),
    getOrgConfig(organizationId),
  ]);
  const { currency, locale } = config;

  const totalRevenue = revenue.reduce(
    (sum, r) => sum + Number(r.totalRevenue),
    0
  );
  const totalAR = arAging.reduce((sum, r) => sum + Number(r.balance), 0);
  const totalWIP = wip.reduce((sum, r) => sum + r.totalWIP, 0);
  const totalTrustBalance = trustSummary.reduce(
    (sum, r) => sum + Number(r.balance),
    0
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total Revenue"
          value={fmt(totalRevenue, currency, locale)}
          icon={<DollarSign className="h-4 w-4 text-emerald-600" />}
          bg="bg-emerald-500/10"
        />
        <SummaryCard
          label="Accounts Receivable"
          value={fmt(totalAR, currency, locale)}
          icon={<CreditCard className="h-4 w-4 text-amber-600" />}
          bg="bg-amber-500/10"
        />
        <SummaryCard
          label="Work In Progress"
          value={fmt(totalWIP, currency, locale)}
          icon={<Clock className="h-4 w-4 text-blue-600" />}
          bg="bg-blue-500/10"
        />
        <SummaryCard
          label="Trust Balances"
          value={fmt(totalTrustBalance, currency, locale)}
          icon={<Landmark className="h-4 w-4 text-purple-600" />}
          bg="bg-purple-500/10"
        />
      </div>

      {/* Revenue Report */}
      <ReportCard
        title="Revenue Report"
        description="Monthly revenue from payments received"
        iconNode={<TrendingUp className="h-4 w-4" />}
        iconColor="bg-emerald-500/10 text-emerald-600"
        columns={[
          { key: "month", label: "Month" },
          { key: "paymentCount", label: "Payments", align: "right" as const },
          {
            key: "totalRevenue",
            label: "Revenue",
            align: "right" as const,
            format: "currency",
          },
        ]}
        data={revenue.map((r) => ({
          ...r,
          totalRevenue: Number(r.totalRevenue),
          paymentCount: Number(r.paymentCount),
        }))}
        filename="revenue-report"
        dateRange={dateRangeLabel}
        summary={[
          { label: "Total Revenue", value: fmt(totalRevenue, currency, locale) },
          {
            label: "Total Payments",
            value: String(
              revenue.reduce((s, r) => s + Number(r.paymentCount), 0)
            ),
          },
        ]}
      />

      {/* AR Aging Report */}
      <ReportCard
        title="Accounts Receivable Aging"
        description="Outstanding invoices by aging bucket"
        iconNode={<CreditCard className="h-4 w-4" />}
        iconColor="bg-amber-500/10 text-amber-600"
        columns={[
          { key: "invoiceNumber", label: "Invoice #" },
          { key: "clientName", label: "Client" },
          { key: "agingBucket", label: "Aging" },
          {
            key: "balance",
            label: "Balance",
            align: "right" as const,
            format: "currency",
          },
          {
            key: "daysOutstanding",
            label: "Days",
            align: "right" as const,
          },
        ]}
        data={arAging.map((r) => ({
          ...r,
          balance: Number(r.balance),
          totalAmount: Number(r.totalAmount),
          paidAmount: Number(r.paidAmount),
          daysOutstanding: Math.max(0, Number(r.daysOutstanding)),
        }))}
        filename="ar-aging-report"
        summary={[
          { label: "Total Outstanding", value: fmt(totalAR, currency, locale) },
          { label: "Invoices", value: String(arAging.length) },
        ]}
        emptyMessage="No outstanding receivables."
      />

      {/* Collection Report */}
      <ReportCard
        title="Collection Report"
        description="Billed vs collected amounts with collection rate"
        iconNode={<Wallet className="h-4 w-4" />}
        iconColor="bg-indigo-500/10 text-indigo-600"
        columns={[
          { key: "month", label: "Month" },
          {
            key: "totalBilled",
            label: "Billed",
            align: "right" as const,
            format: "currency",
          },
          {
            key: "totalCollected",
            label: "Collected",
            align: "right" as const,
            format: "currency",
          },
          {
            key: "collectionRate",
            label: "Rate",
            align: "right" as const,
            format: "percent",
          },
        ]}
        data={collection}
        filename="collection-report"
        dateRange={dateRangeLabel}
        summary={[
          {
            label: "Avg Collection Rate",
            value: fmtPct(
              collection.length > 0
                ? collection.reduce((s, r) => s + r.collectionRate, 0) /
                    collection.length
                : 0
            ),
          },
        ]}
      />

      {/* Billing Summary */}
      <ReportCard
        title="Billing Summary"
        description="Invoice status breakdown with totals"
        iconNode={<CreditCard className="h-4 w-4" />}
        iconColor="bg-emerald-500/10 text-emerald-600"
        columns={[
          {
            key: "status",
            label: "Status",
            format: "enum",
          },
          { key: "count", label: "Count", align: "right" as const },
          {
            key: "totalAmount",
            label: "Total",
            align: "right" as const,
            format: "currency",
          },
          {
            key: "paidAmount",
            label: "Paid",
            align: "right" as const,
            format: "currency",
          },
        ]}
        data={billing.map((r) => ({
          ...r,
          count: Number(r.count),
          totalAmount: Number(r.totalAmount),
          paidAmount: Number(r.paidAmount),
        }))}
        filename="billing-summary"
        dateRange={dateRangeLabel}
      />

      {/* WIP Report */}
      <ReportCard
        title="Work In Progress (WIP)"
        description="Unbilled time and expenses by case"
        iconNode={<Clock className="h-4 w-4" />}
        iconColor="bg-blue-500/10 text-blue-600"
        columns={[
          { key: "caseNumber", label: "Case #" },
          { key: "caseTitle", label: "Matter" },
          { key: "clientName", label: "Client" },
          {
            key: "unbilledTimeHours",
            label: "Hours",
            align: "right" as const,
            format: "number",
          },
          {
            key: "unbilledTimeAmount",
            label: "Time",
            align: "right" as const,
            format: "currency",
          },
          {
            key: "unbilledExpenseAmount",
            label: "Expenses",
            align: "right" as const,
            format: "currency",
          },
          {
            key: "totalWIP",
            label: "Total WIP",
            align: "right" as const,
            format: "currency",
          },
        ]}
        data={wip}
        filename="wip-report"
        summary={[
          { label: "Total WIP", value: fmt(totalWIP, currency, locale) },
          { label: "Matters", value: String(wip.length) },
        ]}
        emptyMessage="No unbilled work in progress."
      />

      {/* Trust Account Summary */}
      <ReportCard
        title="Trust Account Summary"
        description="All trust accounts with current balances"
        iconNode={<Landmark className="h-4 w-4" />}
        iconColor="bg-purple-500/10 text-purple-600"
        columns={[
          { key: "accountName", label: "Account" },
          { key: "accountNumber", label: "Account #" },
          {
            key: "type",
            label: "Type",
            format: "enum",
          },
          { key: "clientName", label: "Client" },
          { key: "bankName", label: "Bank" },
          {
            key: "balance",
            label: "Balance",
            align: "right" as const,
            format: "currency",
          },
        ]}
        data={trustSummary.map((r) => ({
          ...r,
          balance: Number(r.balance),
        }))}
        filename="trust-account-summary"
        summary={[
          { label: "Total Trust Balance", value: fmt(totalTrustBalance, currency, locale) },
          { label: "Accounts", value: String(trustSummary.length) },
        ]}
        emptyMessage="No trust accounts found."
      />

      {/* Trust Transactions */}
      <ReportCard
        title="Trust Transactions"
        description="Deposits and withdrawals across trust accounts"
        iconNode={<ArrowLeftRight className="h-4 w-4" />}
        iconColor="bg-violet-500/10 text-violet-600"
        columns={[
          {
            key: "createdAt",
            label: "Date",
            format: "date",
          },
          { key: "accountName", label: "Account" },
          {
            key: "transactionType",
            label: "Type",
            format: "enum",
          },
          {
            key: "amount",
            label: "Amount",
            align: "right" as const,
            format: "currency",
          },
          { key: "description", label: "Description" },
          { key: "performedByName", label: "By" },
        ]}
        data={trustTransactions.map((r) => ({
          ...r,
          amount: Number(r.amount),
        }))}
        filename="trust-transactions"
        dateRange={dateRangeLabel}
        emptyMessage="No trust transactions in this period."
      />

      {/* Expense Summary */}
      <ReportCard
        title="Expense Summary"
        description="Expenses grouped by category"
        iconNode={<PieChart className="h-4 w-4" />}
        iconColor="bg-rose-500/10 text-rose-600"
        columns={[
          {
            key: "category",
            label: "Category",
            format: "enum",
          },
          { key: "count", label: "Count", align: "right" as const },
          {
            key: "billableAmount",
            label: "Billable",
            align: "right" as const,
            format: "currency",
          },
          {
            key: "nonBillableAmount",
            label: "Non-Billable",
            align: "right" as const,
            format: "currency",
          },
          {
            key: "totalAmount",
            label: "Total",
            align: "right" as const,
            format: "currency",
          },
        ]}
        data={expenseSummary.map((r) => ({
          ...r,
          count: Number(r.count),
          totalAmount: Number(r.totalAmount),
          billableAmount: Number(r.billableAmount),
          nonBillableAmount: Number(r.nonBillableAmount),
        }))}
        filename="expense-summary"
        dateRange={dateRangeLabel}
        summary={[
          {
            label: "Total Expenses",
            value: fmt(
              expenseSummary.reduce((s, r) => s + Number(r.totalAmount), 0),
              currency,
              locale,
            ),
          },
        ]}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Operational Reports Tab
// ---------------------------------------------------------------------------

async function OperationalReports({
  organizationId,
  startDate,
  endDate,
}: {
  organizationId: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const dateRange = { startDate, endDate };
  const dateRangeLabel = startDate && endDate
    ? {
        start: startDate.toLocaleDateString("en-KE"),
        end: endDate.toLocaleDateString("en-KE"),
      }
    : undefined;

  const [caseload, caseType, attorneys, profitability, productivity, clients] =
    await Promise.all([
      getCaseloadReport(organizationId, dateRange),
      getCaseTypeReport(organizationId, dateRange),
      getAttorneyProductivityReport(organizationId, dateRange),
      getMatterProfitabilityReport(organizationId, dateRange),
      getProductivityReport(organizationId, dateRange),
      getClientReport(organizationId, dateRange),
    ]);

  const totalCases = caseload.reduce((s, r) => s + Number(r.count), 0);
  const totalHours = productivity.reduce(
    (s, r) => s + Number(r.totalHours),
    0
  );
  const totalBillableHours = productivity.reduce(
    (s, r) => s + Number(r.billableHours),
    0
  );
  const utilizationRate =
    totalHours > 0
      ? ((totalBillableHours / totalHours) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total Cases"
          value={String(totalCases)}
          icon={<Briefcase className="h-4 w-4 text-blue-600" />}
          bg="bg-blue-500/10"
        />
        <SummaryCard
          label="Total Hours"
          value={fmtNum(totalHours)}
          icon={<Clock className="h-4 w-4 text-amber-600" />}
          bg="bg-amber-500/10"
        />
        <SummaryCard
          label="Billable Hours"
          value={fmtNum(totalBillableHours)}
          icon={<TrendingUp className="h-4 w-4 text-emerald-600" />}
          bg="bg-emerald-500/10"
        />
        <SummaryCard
          label="Utilization Rate"
          value={`${utilizationRate}%`}
          icon={<BarChart3 className="h-4 w-4 text-purple-600" />}
          bg="bg-purple-500/10"
        />
      </div>

      {/* Caseload by Status */}
      <ReportCard
        title="Caseload by Status"
        description="Case distribution across statuses"
        iconNode={<Briefcase className="h-4 w-4" />}
        iconColor="bg-blue-500/10 text-blue-600"
        columns={[
          {
            key: "status",
            label: "Status",
            format: "enum",
          },
          { key: "count", label: "Count", align: "right" as const },
        ]}
        data={caseload.map((r) => ({
          ...r,
          count: Number(r.count),
        }))}
        filename="caseload-report"
        dateRange={dateRangeLabel}
        summary={[{ label: "Total Cases", value: String(totalCases) }]}
      />

      {/* Case Type Breakdown */}
      <ReportCard
        title="Case Type Breakdown"
        description="Cases grouped by type with open/closed breakdown"
        iconNode={<Scale className="h-4 w-4" />}
        iconColor="bg-indigo-500/10 text-indigo-600"
        columns={[
          {
            key: "caseType",
            label: "Case Type",
            format: "enum",
          },
          { key: "count", label: "Total", align: "right" as const },
          { key: "openCount", label: "Open", align: "right" as const },
          { key: "closedCount", label: "Closed", align: "right" as const },
        ]}
        data={caseType.map((r) => ({
          ...r,
          count: Number(r.count),
          openCount: Number(r.openCount),
          closedCount: Number(r.closedCount),
        }))}
        filename="case-type-report"
        dateRange={dateRangeLabel}
      />

      {/* Attorney Productivity */}
      <ReportCard
        title="Attorney Productivity"
        description="Per-attorney hours, billable amounts, and utilization"
        iconNode={<UserCheck className="h-4 w-4" />}
        iconColor="bg-teal-500/10 text-teal-600"
        columns={[
          { key: "attorneyName", label: "Attorney" },
          { key: "department", label: "Department" },
          {
            key: "totalHours",
            label: "Total Hrs",
            align: "right" as const,
            format: "number",
          },
          {
            key: "billableHours",
            label: "Billable Hrs",
            align: "right" as const,
            format: "number",
          },
          {
            key: "billedAmount",
            label: "Billed",
            align: "right" as const,
            format: "currency",
          },
          {
            key: "utilizationRate",
            label: "Utilization",
            align: "right" as const,
            format: "percent",
          },
        ]}
        data={attorneys.map((r) => ({
          ...r,
          totalHours: Number(r.totalHours),
          billableHours: Number(r.billableHours),
          nonBillableHours: Number(r.nonBillableHours),
          billedAmount: Number(r.billedAmount),
          utilizationRate: Number(r.utilizationRate),
        }))}
        filename="attorney-productivity"
        dateRange={dateRangeLabel}
        emptyMessage="No attorney data available."
      />

      {/* Monthly Productivity */}
      <ReportCard
        title="Monthly Productivity"
        description="Hours logged per month (total vs billable)"
        iconNode={<Clock className="h-4 w-4" />}
        iconColor="bg-amber-500/10 text-amber-600"
        columns={[
          { key: "month", label: "Month" },
          {
            key: "totalHours",
            label: "Total Hours",
            align: "right" as const,
            format: "number",
          },
          {
            key: "billableHours",
            label: "Billable Hours",
            align: "right" as const,
            format: "number",
          },
        ]}
        data={productivity.map((r) => ({
          ...r,
          totalHours: Number(r.totalHours),
          billableHours: Number(r.billableHours),
        }))}
        filename="productivity-report"
        dateRange={dateRangeLabel}
        summary={[
          { label: "Total Hours", value: fmtNum(totalHours) },
          { label: "Billable Hours", value: fmtNum(totalBillableHours) },
          { label: "Utilization", value: `${utilizationRate}%` },
        ]}
      />

      {/* Matter Profitability */}
      <ReportCard
        title="Matter Profitability"
        description="Revenue, costs, and profit margin per case"
        iconNode={<TrendingUp className="h-4 w-4" />}
        iconColor="bg-emerald-500/10 text-emerald-600"
        columns={[
          { key: "caseNumber", label: "Case #" },
          { key: "caseTitle", label: "Matter" },
          { key: "clientName", label: "Client" },
          {
            key: "totalPaid",
            label: "Revenue",
            align: "right" as const,
            format: "currency",
          },
          {
            key: "totalCost",
            label: "Cost",
            align: "right" as const,
            format: "currency",
          },
          {
            key: "profit",
            label: "Profit",
            align: "right" as const,
            format: "currency",
          },
          {
            key: "profitMargin",
            label: "Margin",
            align: "right" as const,
            format: "percent",
          },
        ]}
        data={profitability.map((r) => ({
          ...r,
          totalInvoiced: Number(r.totalInvoiced),
          totalPaid: Number(r.totalPaid),
          totalTimeCost: Number(r.totalTimeCost),
          totalHours: Number(r.totalHours),
          totalExpenses: Number(r.totalExpenses),
          totalCost: Number(r.totalCost),
          profit: Number(r.profit),
          profitMargin: Number(r.profitMargin),
        }))}
        filename="matter-profitability"
        dateRange={dateRangeLabel}
        emptyMessage="No case data available for this period."
      />

      {/* Client Distribution */}
      <ReportCard
        title="Client Distribution"
        description="Clients by status and type"
        iconNode={<Users className="h-4 w-4" />}
        iconColor="bg-purple-500/10 text-purple-600"
        columns={[
          {
            key: "status",
            label: "Status",
            format: "enum",
          },
          {
            key: "type",
            label: "Type",
            format: "enum",
          },
          { key: "count", label: "Count", align: "right" as const },
        ]}
        data={clients.map((r) => ({
          ...r,
          count: Number(r.count),
        }))}
        filename="client-distribution"
        dateRange={dateRangeLabel}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compliance Reports Tab
// ---------------------------------------------------------------------------

async function ComplianceReports({
  organizationId,
  startDate,
  endDate,
}: {
  organizationId: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const dateRange = { startDate, endDate };
  const dateRangeLabel = startDate && endDate
    ? {
        start: startDate.toLocaleDateString("en-KE"),
        end: endDate.toLocaleDateString("en-KE"),
      }
    : undefined;

  const [deadlineCompliance, pepReport] = await Promise.all([
    getDeadlineComplianceReport(organizationId, dateRange),
    getPEPReport(organizationId),
  ]);

  const { summary: dlSummary, byPriority } = deadlineCompliance;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Overall Compliance"
          value={fmtPct(dlSummary.overallComplianceRate)}
          icon={<ShieldAlert className="h-4 w-4 text-emerald-600" />}
          bg="bg-emerald-500/10"
        />
        <SummaryCard
          label="Total Deadlines"
          value={String(dlSummary.total)}
          icon={<Gavel className="h-4 w-4 text-blue-600" />}
          bg="bg-blue-500/10"
        />
        <SummaryCard
          label="Overdue"
          value={String(dlSummary.overdue)}
          icon={<AlertTriangle className="h-4 w-4 text-red-600" />}
          bg="bg-red-500/10"
        />
        <SummaryCard
          label="PEP Clients"
          value={String(pepReport.length)}
          icon={<ShieldAlert className="h-4 w-4 text-amber-600" />}
          bg="bg-amber-500/10"
        />
      </div>

      {/* Deadline Compliance by Priority */}
      <ReportCard
        title="Deadline Compliance"
        description="Deadline compliance rates by priority level"
        iconNode={<Gavel className="h-4 w-4" />}
        iconColor="bg-blue-500/10 text-blue-600"
        columns={[
          {
            key: "priority",
            label: "Priority",
            format: "enum",
          },
          { key: "total", label: "Total", align: "right" as const },
          {
            key: "completedOnTime",
            label: "On Time",
            align: "right" as const,
          },
          {
            key: "completedLate",
            label: "Late",
            align: "right" as const,
          },
          { key: "overdue", label: "Overdue", align: "right" as const },
          { key: "statutory", label: "Statutory", align: "right" as const },
          {
            key: "complianceRate",
            label: "Rate",
            align: "right" as const,
            format: "percent",
          },
        ]}
        data={byPriority.map((r) => ({
          ...r,
          total: Number(r.total),
          completedOnTime: Number(r.completedOnTime),
          completedLate: Number(r.completedLate),
          incomplete: Number(r.incomplete),
          overdue: Number(r.overdue),
          statutory: Number(r.statutory),
          complianceRate: Number(r.complianceRate),
        }))}
        filename="deadline-compliance"
        dateRange={dateRangeLabel}
        summary={[
          {
            label: "Overall Compliance Rate",
            value: fmtPct(dlSummary.overallComplianceRate),
          },
          { label: "Total Deadlines", value: String(dlSummary.total) },
          {
            label: "Completed On Time",
            value: String(dlSummary.completedOnTime),
          },
          { label: "Overdue", value: String(dlSummary.overdue) },
          { label: "Statutory Deadlines", value: String(dlSummary.statutory) },
        ]}
        emptyMessage="No deadlines found in this period."
      />

      {/* PEP Report */}
      <ReportCard
        title="Politically Exposed Persons (PEP)"
        description="PEP-flagged clients with case activity"
        iconNode={<ShieldAlert className="h-4 w-4" />}
        iconColor="bg-amber-500/10 text-amber-600"
        columns={[
          { key: "clientName", label: "Client" },
          {
            key: "clientType",
            label: "Type",
            format: "enum",
          },
          { key: "email", label: "Email" },
          {
            key: "status",
            label: "Status",
            format: "enum",
          },
          {
            key: "activeCaseCount",
            label: "Active Cases",
            align: "right" as const,
          },
          {
            key: "totalCaseCount",
            label: "Total Cases",
            align: "right" as const,
          },
        ]}
        data={pepReport.map((r) => ({
          ...r,
          activeCaseCount: Number(r.activeCaseCount),
          totalCaseCount: Number(r.totalCaseCount),
        }))}
        filename="pep-report"
        summary={[
          { label: "Total PEP Clients", value: String(pepReport.length) },
          {
            label: "With Active Cases",
            value: String(
              pepReport.filter((r) => Number(r.activeCaseCount) > 0).length
            ),
          },
        ]}
        emptyMessage="No PEP-flagged clients found."
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Summary Card helper
// ---------------------------------------------------------------------------

function SummaryCard({
  label,
  value,
  icon,
  bg,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  bg: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const { organizationId } = await requireOrg();
  const params = await searchParams;
  const startDate = parseDateParam(params.start);
  const endDate = parseDateParam(params.end);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Comprehensive financial, operational, and compliance reports
          </p>
        </div>
      </div>

      <Suspense>
        <ReportFilters />
      </Suspense>

      <Tabs defaultValue="financial" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="financial" className="text-xs sm:text-sm">
            <DollarSign className="mr-1.5 h-3.5 w-3.5" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="operational" className="text-xs sm:text-sm">
            <Briefcase className="mr-1.5 h-3.5 w-3.5" />
            Operational
          </TabsTrigger>
          <TabsTrigger value="compliance" className="text-xs sm:text-sm">
            <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
            Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="mt-6">
          <Suspense
            fallback={
              <div className="animate-pulse h-96 bg-muted rounded-lg" />
            }
          >
            <FinancialReports organizationId={organizationId} startDate={startDate} endDate={endDate} />
          </Suspense>
        </TabsContent>

        <TabsContent value="operational" className="mt-6">
          <Suspense
            fallback={
              <div className="animate-pulse h-96 bg-muted rounded-lg" />
            }
          >
            <OperationalReports organizationId={organizationId} startDate={startDate} endDate={endDate} />
          </Suspense>
        </TabsContent>

        <TabsContent value="compliance" className="mt-6">
          <Suspense
            fallback={
              <div className="animate-pulse h-96 bg-muted rounded-lg" />
            }
          >
            <ComplianceReports organizationId={organizationId} startDate={startDate} endDate={endDate} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
