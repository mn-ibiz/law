import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getDeadlines } from "@/lib/queries/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskStatusBadge, PriorityBadge } from "@/components/shared/status-badges";
import { DeadlineRowActions } from "@/components/deadlines/deadline-row-actions";
import Link from "next/link";
import { Plus, AlertTriangle } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { APP_LOCALE } from "@/lib/constants/locale";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deadlines",
  description: "Track statutory and case deadlines",
};

export default async function DeadlinesPage() {
  await requireAdminOrAttorney();
  const deadlineList = await getDeadlines();

  const now = new Date();
  const overdue = deadlineList.filter(
    (d) => !d.completedAt && new Date(d.dueDate) < now
  );
  const upcoming = deadlineList.filter(
    (d) => !d.completedAt && new Date(d.dueDate) >= now
  );
  const completed = deadlineList.filter((d) => d.completedAt);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Deadlines</h1>
          <p className="text-muted-foreground">
            Track statutory and case deadlines.
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/deadlines/new">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Deadline
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{overdue.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{upcoming.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-muted-foreground">{completed.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>All Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          {deadlineList.length === 0 ? (
            <EmptyState
              icon={AlertTriangle}
              title="No deadlines set"
              description="Track statutory and case deadlines to stay on top of important dates."
              actionLabel="New Deadline"
              actionHref="/deadlines/new"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Title</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Case</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Assigned To</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Priority</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Due Date</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deadlineList.map((d) => {
                  const isOverdue = !d.completedAt && new Date(d.dueDate) < now;
                  return (
                    <TableRow key={d.id} className="transition-colors hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {d.title}
                        {d.isStatutory && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold leading-none text-rose-700 ring-1 ring-inset ring-rose-600/20">
                            Statutory
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {d.caseId ? (
                          <Link
                            href={`/cases/${d.caseId}`}
                            className="text-primary hover:underline font-mono text-xs"
                          >
                            {d.caseNumber}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>{d.assignedToName ?? "Unassigned"}</TableCell>
                      <TableCell>
                        <PriorityBadge priority={d.priority} />
                      </TableCell>
                      <TableCell>
                        <span className={isOverdue ? "text-destructive font-medium" : ""}>
                          {new Date(d.dueDate).toLocaleDateString(APP_LOCALE)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {d.completedAt ? (
                          <TaskStatusBadge status="completed" />
                        ) : isOverdue ? (
                          <TaskStatusBadge status="overdue" />
                        ) : (
                          <TaskStatusBadge status="pending" />
                        )}
                      </TableCell>
                      <TableCell>
                        <DeadlineRowActions
                          deadlineId={d.id}
                          deadlineTitle={d.title}
                          isCompleted={!!d.completedAt}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
