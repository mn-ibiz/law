import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getDeadlines } from "@/lib/queries/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeadlineDataTable } from "@/components/deadlines/deadline-data-table";
import Link from "next/link";
import { Plus, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deadlines",
  description: "Track statutory and case deadlines",
};

export default async function DeadlinesPage() {
  await requireAdminOrAttorney();
  const deadlineList = await getDeadlines();

  const now = new Date();
  const overdueCount = deadlineList.filter(
    (d) => !d.completedAt && new Date(d.dueDate) < now
  ).length;
  const upcomingCount = deadlineList.filter(
    (d) => !d.completedAt && new Date(d.dueDate) >= now
  ).length;
  const completedCount = deadlineList.filter((d) => d.completedAt).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <AlertTriangle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Deadlines</h1>
            <p className="text-sm text-muted-foreground">
              Track statutory and case deadlines.
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/deadlines/new">
            <Plus className="mr-2 h-4 w-4" />
            New Deadline
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold text-destructive">{overdueCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Upcoming</p>
              <p className="text-2xl font-bold">{upcomingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{completedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <DeadlineDataTable data={deadlineList} />
    </div>
  );
}
