import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getTasks } from "@/lib/queries/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatEnum } from "@/lib/utils/format-enum";
import Link from "next/link";
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

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  in_progress: "default",
  completed: "secondary",
  cancelled: "secondary",
};

const priorityVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  low: "secondary",
  medium: "outline",
  high: "default",
  critical: "destructive",
};

export default async function TasksPage() {
  await requireAdminOrAttorney();
  const taskList = await getTasks();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <p className="text-muted-foreground">Manage and track work tasks.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {taskList.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks created.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Case</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taskList.map((task) => (
                  <TableRow key={task.id}>
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
                      <Badge variant={priorityVariant[task.priority] ?? "secondary"}>
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[task.status] ?? "secondary"}>
                        {formatEnum(task.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString(APP_LOCALE)
                        : "—"}
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
