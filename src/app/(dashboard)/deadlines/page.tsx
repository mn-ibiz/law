import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getDeadlines } from "@/lib/queries/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const priorityVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  low: "secondary",
  medium: "outline",
  high: "default",
  critical: "destructive",
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Deadlines</h1>
        <p className="text-muted-foreground">
          Track statutory and case deadlines.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{overdue.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{upcoming.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-muted-foreground">{completed.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          {deadlineList.length === 0 ? (
            <p className="text-sm text-muted-foreground">No deadlines set.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Case</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deadlineList.map((d) => {
                  const isOverdue = !d.completedAt && new Date(d.dueDate) < now;
                  return (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">
                        {d.title}
                        {d.isStatutory && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Statutory
                          </Badge>
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
                        <Badge variant={priorityVariant[d.priority] ?? "secondary"}>
                          {d.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={isOverdue ? "text-destructive font-medium" : ""}>
                          {new Date(d.dueDate).toLocaleDateString("en-KE")}
                        </span>
                      </TableCell>
                      <TableCell>
                        {d.completedAt ? (
                          <Badge variant="secondary">Completed</Badge>
                        ) : isOverdue ? (
                          <Badge variant="destructive">Overdue</Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
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
