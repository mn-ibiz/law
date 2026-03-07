import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, Gauge, Receipt, Coins } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  label: string;
  rate: number;
  benchmark?: number;
  detail?: string;
  icon: LucideIcon;
  color: string;
  progressColor: string;
}

function KPICard({ label, rate, benchmark, detail, icon: Icon, color, progressColor }: KPICardProps) {
  const aboveBenchmark = benchmark ? rate >= benchmark : true;
  const pct = Math.min(100, rate);

  // SVG ring parameters
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-center gap-4 p-4">
        {/* Ring gauge */}
        <div className="relative flex-shrink-0">
          <svg width="76" height="76" className="-rotate-90">
            <circle
              cx="38"
              cy="38"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-muted/40"
            />
            <circle
              cx="38"
              cy="38"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={progressColor}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <div className="mt-0.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">{rate.toFixed(1)}%</span>
          </div>
          {benchmark && (
            <div className="mt-1 flex items-center gap-1">
              <Target className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">{benchmark}%</span>
              <span className={`flex items-center gap-0.5 text-[11px] font-medium ${aboveBenchmark ? "text-emerald-600" : "text-rose-600"}`}>
                {aboveBenchmark ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {aboveBenchmark ? "Above" : "Below"}
              </span>
            </div>
          )}
          {detail && <p className="mt-0.5 text-[11px] text-muted-foreground truncate">{detail}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

interface KPICardsProps {
  utilization: { rate: number; billableHours: number; totalHours: number };
  realization: { rate: number; totalBillableValue: number; totalInvoiced: number };
  collection: { rate: number; totalInvoiced: number; totalCollected: number };
}

export function KPICards({ utilization, realization, collection }: KPICardsProps) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
      <KPICard
        label="Utilization Rate"
        rate={utilization.rate}
        benchmark={38}
        detail={`${utilization.billableHours.toFixed(1)}h billable of ${utilization.totalHours.toFixed(1)}h`}
        icon={Gauge}
        color="text-blue-600"
        progressColor="text-blue-500"
      />
      <KPICard
        label="Realization Rate"
        rate={realization.rate}
        benchmark={88}
        detail={`KES ${(realization.totalInvoiced / 1000).toFixed(0)}K invoiced`}
        icon={Receipt}
        color="text-emerald-600"
        progressColor="text-emerald-500"
      />
      <KPICard
        label="Collection Rate"
        rate={collection.rate}
        benchmark={93}
        detail={`KES ${(collection.totalCollected / 1000).toFixed(0)}K collected`}
        icon={Coins}
        color="text-amber-600"
        progressColor="text-amber-500"
      />
    </div>
  );
}
