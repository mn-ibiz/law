import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PriorityBadge } from "@/components/shared/status-badges";
import { Clock, ArrowRight } from "lucide-react";
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
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Upcoming Deadlines</CardTitle>
            <CardDescription className="text-xs">Next 10 due dates</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="gap-1 text-xs" asChild>
            <Link href="/deadlines">
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No upcoming deadlines"
            description="All caught up!"
          />
        ) : (
          <div className="space-y-3">
            {data.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-transparent p-2 text-sm transition-colors hover:border-border hover:bg-muted/50"
              >
                <div className="min-w-0">
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
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">
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
