import { Suspense } from "react";
import { Briefcase, Clock, Timer, Calendar, MessageSquare } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { AttorneyCasesTable } from "./widgets/attorney-cases-table";
import { AttorneyDeadlines } from "./widgets/attorney-deadlines";
import { AttorneyTimeEntries } from "./widgets/attorney-time-entries";
import { AttorneyTasks } from "./widgets/attorney-tasks";
import { TimeTrackerWidget } from "./widgets/time-tracker-widget";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { formatNumber } from "@/lib/utils/format";
import { getAttorneyDashboardStats } from "@/lib/queries/dashboard";
import { getAttorneyTimeStats } from "@/lib/queries/kpi";
import {
  getAttorneyCases,
  getAttorneyDeadlines,
  getAttorneyRecentTimeEntries,
  getAttorneyTasks,
} from "@/lib/queries/dashboard-attorney";

async function AttorneyStats({ userId }: { userId: string }) {
  const stats = await getAttorneyDashboardStats(userId);

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label="My Active Cases"
        value={formatNumber(stats.activeCases)}
        icon={Briefcase}
        color="blue"
      />
      <StatCard
        label="Hours This Week"
        value={stats.hoursThisWeek.toFixed(1)}
        icon={Clock}
        color="amber"
      />
      <StatCard
        label="Billable Hours (Month)"
        value={stats.billableHoursThisMonth.toFixed(1)}
        icon={Timer}
        color="emerald"
      />
      <StatCard
        label="Upcoming Deadlines"
        value={formatNumber(stats.upcomingDeadlines)}
        icon={Calendar}
        description="Next 7 days"
        color="rose"
      />
      <StatCard
        label="Unread Messages"
        value={formatNumber(stats.unreadMessages)}
        icon={MessageSquare}
        color="purple"
      />
    </div>
  );
}

async function AttorneyTimeTracker({ userId }: { userId: string }) {
  const timeStats = await getAttorneyTimeStats(userId);
  return <TimeTrackerWidget {...timeStats} />;
}

async function AttorneyWidgets({ userId }: { userId: string }) {
  const [myCases, deadlines, timeEntries, tasks] = await Promise.all([
    getAttorneyCases(userId),
    getAttorneyDeadlines(userId),
    getAttorneyRecentTimeEntries(userId),
    getAttorneyTasks(userId),
  ]);

  return (
    <>
      <AttorneyCasesTable data={myCases} />
      <div className="grid gap-4 md:grid-cols-2">
        <AttorneyDeadlines data={deadlines} />
        <AttorneyTasks data={tasks} />
      </div>
      <AttorneyTimeEntries data={timeEntries} />
    </>
  );
}

export function AttorneyDashboard({ userId }: { userId: string }) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<DashboardSkeleton cards={5} />}>
        <AttorneyStats userId={userId} />
      </Suspense>
      <Suspense fallback={<div className="animate-pulse h-48 bg-muted rounded-lg" />}>
        <AttorneyTimeTracker userId={userId} />
      </Suspense>
      <Suspense>
        <AttorneyWidgets userId={userId} />
      </Suspense>
    </div>
  );
}
