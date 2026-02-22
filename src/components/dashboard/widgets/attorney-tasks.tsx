import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { CheckSquare } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils/format";

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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">My Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No open tasks"
            description="All tasks completed!"
          />
        ) : (
          <div className="space-y-3">
            {data.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{t.title}</p>
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
                  <Badge variant="outline" className="capitalize text-xs">
                    {t.status}
                  </Badge>
                  {t.dueDate && (
                    <span className="text-xs text-muted-foreground">
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
