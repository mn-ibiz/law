import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Briefcase, ArrowRight, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CaseStatusBadge } from "@/components/shared/status-badges";
import { PersonAvatar } from "@/components/shared/person-avatar";

interface RecentCase {
  id: string;
  caseNumber: string;
  title: string;
  status: string;
  clientName: string;
  clientPhotoUrl: string | null;
  createdAt: Date;
}

export function RecentCasesTable({ data }: { data: RecentCase[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10">
              <FolderOpen className="h-4.5 w-4.5 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Recent Cases</CardTitle>
              <p className="text-xs text-muted-foreground">Latest case activity</p>
            </div>
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
            actionLabel="Create Case"
            actionHref="/cases/new"
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
                    <td className="py-2.5 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <PersonAvatar name={c.clientName} imageUrl={c.clientPhotoUrl} size="sm" />
                        {c.clientName}
                      </div>
                    </td>
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
