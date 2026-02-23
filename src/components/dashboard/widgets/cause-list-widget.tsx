import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ScrollText, ArrowRight } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";

interface CauseListItem {
  id: string;
  date: Date;
  judge: string | null;
  courtRoom: string | null;
  courtName: string | null;
}

export function CauseListWidget({ data }: { data: CauseListItem[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Upcoming Cause Lists</CardTitle>
            <CardDescription className="text-xs">Next scheduled hearings</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="gap-1 text-xs" asChild>
            <Link href="/cause-lists">
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="No upcoming cause lists"
            description="No scheduled court hearings found."
          />
        ) : (
          <div className="space-y-3">
            {data.map((cl) => (
              <div
                key={cl.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-transparent p-2 text-sm transition-colors hover:border-border hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <Link
                    href={`/cause-lists/${cl.id}`}
                    className="truncate font-medium hover:text-primary"
                  >
                    {cl.courtName ?? "Court hearing"}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {[cl.judge, cl.courtRoom].filter(Boolean).join(" - ") || "No details"}
                  </p>
                </div>
                <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
                  {formatRelativeDate(new Date(cl.date))}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
