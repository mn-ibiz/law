import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target } from "lucide-react";

interface KPICardProps {
  label: string;
  rate: number;
  benchmark?: number;
  detail?: string;
  color: "blue" | "emerald" | "amber" | "purple";
}

const colorMap = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-600", progress: "[&>div]:bg-blue-500" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-600", progress: "[&>div]:bg-emerald-500" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-600", progress: "[&>div]:bg-amber-500" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-600", progress: "[&>div]:bg-purple-500" },
};

function KPICard({ label, rate, benchmark, detail, color }: KPICardProps) {
  const c = colorMap[color];
  const aboveBenchmark = benchmark ? rate >= benchmark : true;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          {benchmark && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Target className="h-3 w-3" />
              {benchmark}%
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{rate.toFixed(1)}%</span>
          {benchmark && (
            <span className={`flex items-center gap-0.5 text-xs ${aboveBenchmark ? "text-emerald-600" : "text-rose-600"}`}>
              {aboveBenchmark ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {aboveBenchmark ? "Above" : "Below"} target
            </span>
          )}
        </div>
        <Progress value={Math.min(100, rate)} className={`h-2 ${c.progress}`} />
        {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
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
        detail={`${utilization.billableHours.toFixed(1)}h billable of ${utilization.totalHours.toFixed(1)}h total`}
        color="blue"
      />
      <KPICard
        label="Realization Rate"
        rate={realization.rate}
        benchmark={88}
        detail={`KES ${(realization.totalInvoiced / 1000).toFixed(0)}K invoiced`}
        color="emerald"
      />
      <KPICard
        label="Collection Rate"
        rate={collection.rate}
        benchmark={93}
        detail={`KES ${(collection.totalCollected / 1000).toFixed(0)}K collected`}
        color="amber"
      />
    </div>
  );
}
