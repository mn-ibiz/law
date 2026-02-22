import { Suspense } from "react";
import { Briefcase, Clock, Timer, Calendar, MessageSquare } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { AttorneyCasesTable } from "./widgets/attorney-cases-table";
import { AttorneyDeadlines } from "./widgets/attorney-deadlines";
import { AttorneyTimeEntries } from "./widgets/attorney-time-entries";
import { AttorneyTasks } from "./widgets/attorney-tasks";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { formatNumber } from "@/lib/utils/format";
import { getAttorneyDashboardStats } from "@/lib/queries/dashboard";
import {
  getAttorneyCases,
  getAttorneyDeadlines,
  getAttorneyRecentTimeEntries,
  getAttorneyTasks,
} from "@/lib/queries/dashboard-attorney";

async function AttorneyStats({ userId }: { userId: string }) {
  const stats = await getAttorneyDashboardStats(userId);

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label="My Active Cases"
        value={formatNumber(stats.activeCases)}
        icon={Briefcase}
      />
      <StatCard
        label="Hours This Week"
        value={stats.hoursThisWeek.toFixed(1)}
        icon={Clock}
      />
      <StatCard
        label="Billable Hours (Month)"
        value={stats.billableHoursThisMonth.toFixed(1)}
        icon={Timer}
      />
      <StatCard
        label="Upcoming Deadlines"
        value={formatNumber(stats.upcomingDeadlines)}
        icon={Calendar}
        description="Next 7 days"
      />
      <StatCard
        label="Unread Messages"
        value={formatNumber(stats.unreadMessages)}
        icon={MessageSquare}
      />
    </div>
  );
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
      <Suspense>
        <AttorneyWidgets userId={userId} />
      </Suspense>
    </div>
  );
}
