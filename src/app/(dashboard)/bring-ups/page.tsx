import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getBringUps } from "@/lib/queries/calendar";
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
import { APP_LOCALE } from "@/lib/constants/locale";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bring-Ups",
  description: "File bring-up reminders and follow-ups",
};

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  completed: "default",
  dismissed: "secondary",
  overdue: "destructive",
};

export default async function BringUpsPage() {
  await requireAdminOrAttorney();
  const bringUpList = await getBringUps();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">File Bring-Ups</h1>
        <p className="text-muted-foreground">
          Track file bring-up dates for cases that need attention.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bring-Ups</CardTitle>
        </CardHeader>
        <CardContent>
          {bringUpList.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bring-ups scheduled.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Case</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bringUpList.map((bu) => (
                  <TableRow key={bu.id}>
                    <TableCell>
                      {new Date(bu.date).toLocaleDateString(APP_LOCALE)}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/cases/${bu.caseId}`}
                        className="text-primary hover:underline"
                      >
                        {bu.caseNumber} — {bu.caseTitle}
                      </Link>
                    </TableCell>
                    <TableCell>{bu.reason}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[bu.status] ?? "secondary"}>
                        {bu.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{bu.createdByName ?? "—"}</TableCell>
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
