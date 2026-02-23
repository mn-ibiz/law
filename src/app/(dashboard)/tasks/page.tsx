import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getTasks } from "@/lib/queries/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskStatusBadge, PriorityBadge } from "@/components/shared/status-badges";
import { TaskRowActions } from "@/components/tasks/task-row-actions";
import Link from "next/link";
import { Plus, CheckSquare } from "lucide-react";
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
  title: "Tasks",
  description: "Manage and track work tasks",
};

export default async function TasksPage() {
  await requireAdminOrAttorney();
  const taskList = await getTasks();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage and track work tasks.</p>
        </div>
        <Button size="sm" asChild>
          <Link href="/tasks/new">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Task
          </Link>
        </Button>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {taskList.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No tasks yet"
              description="Create your first task to start tracking work across cases and team members."
              actionLabel="New Task"
              actionHref="/tasks/new"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Title</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Case</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Assigned To</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Priority</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Due Date</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taskList.map((task) => (
                  <TableRow key={task.id} className="transition-colors hover:bg-muted/50">
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>
                      {task.caseId ? (
                        <Link href={`/cases/${task.caseId}`} className="text-primary hover:underline font-mono text-xs">
                          {task.caseNumber}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{task.assignedToName ?? "Unassigned"}</TableCell>
                    <TableCell>
                      <PriorityBadge priority={task.priority} />
                    </TableCell>
                    <TableCell>
                      <TaskStatusBadge status={task.status} />
                    </TableCell>
                    <TableCell>
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString(APP_LOCALE)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <TaskRowActions
                        task={{
                          id: task.id,
                          title: task.title,
                          description: task.description,
                          priority: task.priority,
                          dueDate: task.dueDate,
                          status: task.status,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
