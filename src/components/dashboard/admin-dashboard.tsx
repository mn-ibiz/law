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
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import { getOrgConfig } from "@/lib/utils/tenant-config";
import { getAdminDashboardStats } from "@/lib/queries/dashboard";
import {
  getMonthlyRevenue,
  getCaseStatusDistribution,
  getRecentCases,
  getUpcomingDeadlines,
  getOverdueInvoices,
} from "@/lib/queries/dashboard-charts";
import { getUtilizationRate, getRealizationRate, getCollectionRate, getARAgingBuckets } from "@/lib/queries/kpi";
import { requireOrg } from "@/lib/auth/get-session";
import { OnboardingChecklist, buildChecklistItems } from "./onboarding-checklist";
import { getOnboardingData } from "@/lib/queries/onboarding";

async function AdminStats() {
  const { organizationId } = await requireOrg();
  const [stats, config] = await Promise.all([
    getAdminDashboardStats(organizationId),
    getOrgConfig(organizationId),
  ]);

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
        value={formatCurrency(stats.revenueThisMonth, config.currency, config.locale)}
        icon={Banknote}
        color="emerald"
      />
      <StatCard
        label="Outstanding Invoices"
        value={formatCurrency(stats.outstandingInvoices, config.currency, config.locale)}
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
  const { organizationId } = await requireOrg();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [utilization, realization, collection] = await Promise.all([
    getUtilizationRate(organizationId, startOfMonth, now),
    getRealizationRate(organizationId, startOfMonth, now),
    getCollectionRate(organizationId, startOfMonth, now),
  ]);

  return <KPICards utilization={utilization} realization={realization} collection={collection} />;
}

async function AdminCharts() {
  const { organizationId } = await requireOrg();
  const [revenue, caseStatus, arAging] = await Promise.all([
    getMonthlyRevenue(organizationId),
    getCaseStatusDistribution(organizationId),
    getARAgingBuckets(organizationId),
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
  const { organizationId } = await requireOrg();
  const arAging = await getARAgingBuckets(organizationId);
  return <ARAgingChart data={arAging} />;
}

async function AdminWidgets() {
  const { organizationId } = await requireOrg();
  const [recentCases, deadlines, overdueInvoices] = await Promise.all([
    getRecentCases(organizationId, 10),
    getUpcomingDeadlines(organizationId, 10),
    getOverdueInvoices(organizationId),
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

async function AdminOnboarding() {
  const { organizationId } = await requireOrg();
  const data = await getOnboardingData(organizationId);
  if (!data || data.daysOld > 14) return null;

  const items = buildChecklistItems(data);
  return (
    <OnboardingChecklist
      items={items}
      firmName={data.firmName}
      daysOld={data.daysOld}
    />
  );
}

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Onboarding checklist for new orgs */}
      <Suspense fallback={null}>
        <AdminOnboarding />
      </Suspense>

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
