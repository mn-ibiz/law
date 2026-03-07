import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PriorityBadge } from "@/components/shared/status-badges";
import { Clock, ArrowRight, CalendarClock } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";

interface Deadline {
  id: string;
  title: string;
  dueDate: Date;
  priority: string;
  caseId: string | null;
  caseNumber: string | null;
  assignedToName?: string | null;
}

export function UpcomingDeadlines({ data }: { data: Deadline[] }) {
  const urgentCount = data.filter((d) => d.priority === "high" || d.priority === "urgent").length;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
              <CalendarClock className="h-4.5 w-4.5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Upcoming Deadlines</CardTitle>
              <p className="text-xs text-muted-foreground">Next 10 due dates</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {urgentCount > 0 && (
              <Badge variant="secondary" className="bg-rose-500/10 text-rose-700 border-rose-200 text-[10px] font-semibold">
                {urgentCount} urgent
              </Badge>
            )}
            <Button variant="ghost" size="sm" className="gap-1 text-xs" asChild>
              <Link href="/deadlines">
                View all
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No upcoming deadlines"
            description="All caught up! No pending deadlines."
          />
        ) : (
          <div className="space-y-1">
            {data.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between gap-3 rounded-lg p-2.5 text-sm transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{d.title}</p>
                  {d.caseId && d.caseNumber && (
                    <Link
                      href={`/cases/${d.caseId}`}
                      className="text-xs text-muted-foreground hover:text-primary"
                    >
                      {d.caseNumber}
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <PriorityBadge priority={d.priority} />
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap font-medium">
                    {formatRelativeDate(new Date(d.dueDate))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
