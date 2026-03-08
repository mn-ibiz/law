import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Timer, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface TimeEntry {
  id: string;
  description: string;
  hours: string;
  date: Date;
  caseNumber: string | null;
}

export function AttorneyTimeEntries({ data, locale }: { data: TimeEntry[]; locale: string }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Recent Time Entries</CardTitle>
            <CardDescription className="text-xs">Latest logged hours</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="gap-1 text-xs" asChild>
            <Link href="/time-expenses">
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            icon={Timer}
            title="No time entries"
            description="Start logging your time."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Case
                  </th>
                  <th className="pb-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Description
                  </th>
                  <th className="pb-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Hours
                  </th>
                  <th className="pb-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b last:border-0 transition-colors hover:bg-muted/50"
                  >
                    <td className="py-2.5 font-mono text-xs text-muted-foreground">
                      {entry.caseNumber ?? "—"}
                    </td>
                    <td className="py-2.5 max-w-48 truncate font-medium">
                      {entry.description}
                    </td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20">
                        {Number(entry.hours).toFixed(1)}h
                      </span>
                    </td>
                    <td className="py-2.5 text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString(locale, {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
