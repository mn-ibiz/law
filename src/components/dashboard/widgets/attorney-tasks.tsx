import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { TaskStatusBadge } from "@/components/shared/status-badges";
import { CheckSquare, ArrowRight } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: Date | null;
  caseId: string | null;
  caseNumber: string | null;
}

export function AttorneyTasks({ data }: { data: Task[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">My Tasks</CardTitle>
            <CardDescription className="text-xs">Open task assignments</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="gap-1 text-xs" asChild>
            <Link href="/tasks">
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No open tasks"
            description="All tasks completed!"
          />
        ) : (
          <div className="space-y-2">
            {data.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-transparent p-2 text-sm transition-colors hover:border-border hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{t.title}</p>
                  {t.caseId && t.caseNumber && (
                    <Link
                      href={`/cases/${t.caseId}`}
                      className="text-xs text-muted-foreground hover:text-primary"
                    >
                      {t.caseNumber}
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <TaskStatusBadge status={t.status} />
                  {t.dueDate && (
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                      {formatRelativeDate(new Date(t.dueDate))}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
