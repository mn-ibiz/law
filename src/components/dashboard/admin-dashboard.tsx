import { Suspense } from "react";
import {
  Briefcase,
  Users,
  Banknote,
  FileWarning,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { RevenueChart } from "./charts/revenue-chart";
import { CaseStatusChart } from "./charts/case-status-chart";
import { RecentCasesTable } from "./widgets/recent-cases-table";
import { UpcomingDeadlines } from "./widgets/upcoming-deadlines";
import { OverdueInvoicesTable } from "./widgets/overdue-invoices-table";
import { ComplianceWidget } from "./widgets/compliance-widget";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { formatKES, formatNumber } from "@/lib/utils/format";
import { getAdminDashboardStats } from "@/lib/queries/dashboard";
import {
  getMonthlyRevenue,
  getCaseStatusDistribution,
  getRecentCases,
  getUpcomingDeadlines,
  getOverdueInvoices,
} from "@/lib/queries/dashboard-charts";

async function AdminStats() {
  const stats = await getAdminDashboardStats();

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label="Active Cases"
        value={formatNumber(stats.activeCases)}
        icon={Briefcase}
      />
      <StatCard
        label="Total Clients"
        value={formatNumber(stats.totalClients)}
        icon={Users}
      />
      <StatCard
        label="Revenue This Month"
        value={formatKES(stats.revenueThisMonth)}
        icon={Banknote}
      />
      <StatCard
        label="Outstanding Invoices"
        value={formatKES(stats.outstandingInvoices)}
        icon={FileWarning}
      />
      <StatCard
        label="Active Attorneys"
        value={formatNumber(stats.activeAttorneys)}
        icon={UserCheck}
      />
      <StatCard
        label="Overdue Deadlines"
        value={formatNumber(stats.overdueDeadlines)}
        icon={AlertTriangle}
        description={stats.overdueDeadlines > 0 ? "Requires attention" : "All on track"}
      />
    </div>
  );
}

async function AdminCharts() {
  const [revenue, caseStatus] = await Promise.all([
    getMonthlyRevenue(),
    getCaseStatusDistribution(),
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <RevenueChart data={revenue} />
      <CaseStatusChart data={caseStatus} />
    </div>
  );
}

async function AdminWidgets() {
  const [recentCases, deadlines, overdueInvoices] = await Promise.all([
    getRecentCases(10),
    getUpcomingDeadlines(10),
    getOverdueInvoices(),
  ]);

  return (
    <>
      <RecentCasesTable data={recentCases} />
      <div className="grid gap-4 md:grid-cols-2">
        <UpcomingDeadlines data={deadlines} />
        <OverdueInvoicesTable data={overdueInvoices} />
      </div>
    </>
  );
}

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<DashboardSkeleton cards={6} />}>
        <AdminStats />
      </Suspense>
      <Suspense fallback={<DashboardSkeleton cards={0} />}>
        <AdminCharts />
      </Suspense>
      <Suspense>
        <AdminWidgets />
      </Suspense>
      <Suspense>
        <ComplianceWidget />
      </Suspense>
    </div>
  );
}
