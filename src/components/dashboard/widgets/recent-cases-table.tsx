import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Briefcase, ArrowRight } from "lucide-react";
import { formatEnum } from "@/lib/utils/format-enum";
import { Button } from "@/components/ui/button";
import { CaseStatusBadge } from "@/components/shared/status-badges";

interface RecentCase {
  id: string;
  caseNumber: string;
  title: string;
  status: string;
  clientName: string;
  createdAt: Date;
}

export function RecentCasesTable({ data }: { data: RecentCase[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Recent Cases</CardTitle>
            <CardDescription className="text-xs">Latest case activity</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="gap-1 text-xs" asChild>
            <Link href="/cases">
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No cases yet"
            description="Cases will appear here once created."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Case #
                  </th>
                  <th className="pb-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Title
                  </th>
                  <th className="pb-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Client
                  </th>
                  <th className="pb-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b last:border-0 transition-colors hover:bg-muted/50"
                  >
                    <td className="py-2.5">
                      <Link
                        href={`/cases/${c.id}`}
                        className="font-mono text-xs font-medium text-primary hover:underline"
                      >
                        {c.caseNumber}
                      </Link>
                    </td>
                    <td className="py-2.5 max-w-48 truncate font-medium">
                      {c.title}
                    </td>
                    <td className="py-2.5 text-muted-foreground">{c.clientName}</td>
                    <td className="py-2.5">
                      <CaseStatusBadge status={c.status} />
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
