import { Suspense } from "react";
import { Briefcase, FileText, CreditCard } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { formatKES, formatNumber } from "@/lib/utils/format";
import { getClientDashboardStats } from "@/lib/queries/dashboard";

async function ClientStats({ userId }: { userId: string }) {
  const stats = await getClientDashboardStats(userId);

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label="Open Cases"
        value={formatNumber(stats.openCases)}
        icon={Briefcase}
      />
      <StatCard
        label="Pending Documents"
        value={formatNumber(stats.pendingDocuments)}
        icon={FileText}
      />
      <StatCard
        label="Outstanding Balance"
        value={formatKES(stats.outstandingBalance)}
        icon={CreditCard}
      />
    </div>
  );
}

export function ClientDashboard({ userId }: { userId: string }) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<DashboardSkeleton cards={3} />}>
        <ClientStats userId={userId} />
      </Suspense>
    </div>
  );
}
