import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Clock } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils/format";

interface AttorneyDeadline {
  id: string;
  title: string;
  dueDate: Date;
  priority: string;
  caseId: string | null;
  caseNumber: string | null;
}

export function AttorneyDeadlines({ data }: { data: AttorneyDeadline[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">My Deadlines</CardTitle>
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
                className="flex items-center justify-between gap-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{d.title}</p>
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
                  <Badge
                    variant={d.priority === "high" || d.priority === "urgent" ? "destructive" : "outline"}
                    className="text-xs capitalize"
                  >
                    {d.priority}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
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
