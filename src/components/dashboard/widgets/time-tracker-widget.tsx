import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";

interface TimeTrackerWidgetProps {
  today: { hours: number; billable: number };
  week: { hours: number; billable: number };
  month: { hours: number; billable: number };
}

const TARGET_DAILY = 6;
const TARGET_WEEKLY = 30;
const TARGET_MONTHLY = 120;

function TimeRow({ label, hours, billable, target }: { label: string; hours: number; billable: number; target: number }) {
  const pct = Math.min(100, (billable / target) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {billable.toFixed(1)}h <span className="text-muted-foreground font-normal">/ {target}h</span>
        </span>
      </div>
      <Progress value={pct} className="h-1.5 [&>div]:bg-blue-500" />
      <p className="text-[11px] text-muted-foreground">
        {hours.toFixed(1)}h total ({billable.toFixed(1)}h billable)
      </p>
    </div>
  );
}

export function TimeTrackerWidget({ today, week, month }: TimeTrackerWidgetProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Clock className="h-4 w-4 text-blue-600" />
          My Billable Hours
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <TimeRow label="Today" hours={today.hours} billable={today.billable} target={TARGET_DAILY} />
        <TimeRow label="This Week" hours={week.hours} billable={week.billable} target={TARGET_WEEKLY} />
        <TimeRow label="This Month" hours={month.hours} billable={month.billable} target={TARGET_MONTHLY} />
      </CardContent>
    </Card>
  );
}
