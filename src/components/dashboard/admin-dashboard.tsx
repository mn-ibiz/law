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
import { ARAgingChart } from "./charts/ar-aging-chart";
import { KPICards } from "./widgets/kpi-cards";
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
import { getUtilizationRate, getRealizationRate, getCollectionRate, getARAgingBuckets } from "@/lib/queries/kpi";

async function AdminStats() {
  const stats = await getAdminDashboardStats();

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        label="Active Cases"
        value={formatNumber(stats.activeCases)}
        icon={Briefcase}
        color="blue"
      />
      <StatCard
        label="Total Clients"
        value={formatNumber(stats.totalClients)}
        icon={Users}
        color="purple"
      />
      <StatCard
        label="Revenue This Month"
        value={formatKES(stats.revenueThisMonth)}
        icon={Banknote}
        color="emerald"
      />
      <StatCard
        label="Outstanding Invoices"
        value={formatKES(stats.outstandingInvoices)}
        icon={FileWarning}
        color="amber"
      />
      <StatCard
        label="Active Attorneys"
        value={formatNumber(stats.activeAttorneys)}
        icon={UserCheck}
        color="cyan"
      />
      <StatCard
        label="Overdue Deadlines"
        value={formatNumber(stats.overdueDeadlines)}
        icon={AlertTriangle}
        description={stats.overdueDeadlines > 0 ? "Requires attention" : "All on track"}
        color="rose"
      />
    </div>
  );
}

async function AdminKPIs() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [utilization, realization, collection] = await Promise.all([
    getUtilizationRate(startOfMonth, now),
    getRealizationRate(startOfMonth, now),
    getCollectionRate(startOfMonth, now),
  ]);

  return <KPICards utilization={utilization} realization={realization} collection={collection} />;
}

async function AdminCharts() {
  const [revenue, caseStatus, arAging] = await Promise.all([
    getMonthlyRevenue(),
    getCaseStatusDistribution(),
    getARAgingBuckets(),
  ]);

  return (
    <div className="grid gap-4 lg:grid-cols-7">
      <div className="lg:col-span-4">
        <RevenueChart data={revenue} />
      </div>
      <div className="lg:col-span-3">
        <CaseStatusChart data={caseStatus} />
      </div>
    </div>
  );
}

async function AdminARChart() {
  const arAging = await getARAgingBuckets();
  return <ARAgingChart data={arAging} />;
}

async function AdminWidgets() {
  const [recentCases, deadlines, overdueInvoices] = await Promise.all([
    getRecentCases(10),
    getUpcomingDeadlines(10),
    getOverdueInvoices(),
  ]);

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        <UpcomingDeadlines data={deadlines} />
        <OverdueInvoicesTable data={overdueInvoices} />
      </div>
      <RecentCasesTable data={recentCases} />
    </>
  );
}

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Row 1: Key stat cards */}
      <Suspense fallback={<DashboardSkeleton cards={6} />}>
        <AdminStats />
      </Suspense>

      {/* Row 2: KPI gauges + Compliance side-by-side */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Suspense fallback={<DashboardSkeleton cards={3} />}>
            <AdminKPIs />
          </Suspense>
        </div>
        <div className="lg:col-span-2">
          <Suspense fallback={<div className="animate-pulse h-48 bg-muted rounded-xl" />}>
            <ComplianceWidget />
          </Suspense>
        </div>
      </div>

      {/* Row 3: Charts */}
      <Suspense fallback={<DashboardSkeleton cards={0} />}>
        <AdminCharts />
      </Suspense>

      {/* Row 4: AR Aging */}
      <Suspense fallback={<div className="animate-pulse h-48 bg-muted rounded-xl" />}>
        <AdminARChart />
      </Suspense>

      {/* Row 5: Action tables */}
      <Suspense fallback={<div className="animate-pulse h-32 bg-muted rounded-xl" />}>
        <AdminWidgets />
      </Suspense>
    </div>
  );
}
