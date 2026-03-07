import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getBringUps } from "@/lib/queries/calendar";
import { getCases } from "@/lib/queries/cases";
import { getUsers } from "@/lib/queries/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BringUpStatusBadge } from "@/components/shared/status-badges";
import { BringUpRowActions } from "@/components/bring-ups/bring-up-row-actions";
import Link from "next/link";
import { Plus, Bell } from "lucide-react";
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
  title: "Bring-Ups",
  description: "File bring-up reminders and follow-ups",
};

export default async function BringUpsPage() {
  await requireAdminOrAttorney();
  const [bringUpList, { data: caseList }, userList] = await Promise.all([
    getBringUps(),
    getCases({ limit: 200 }),
    getUsers(),
  ]);

  const cases = caseList.map((c) => ({
    id: c.id,
    caseNumber: c.caseNumber,
    title: c.title,
  }));

  const users = userList.map((u) => ({
    id: u.id,
    name: u.name ?? u.email,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">File Bring-Ups</h1>
          <p className="text-muted-foreground">
            Track file bring-up dates for cases that need attention.
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/bring-ups/new">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Bring-Up
          </Link>
        </Button>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Upcoming Bring-Ups</CardTitle>
        </CardHeader>
        <CardContent>
          {bringUpList.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No bring-ups scheduled"
              description="Schedule file bring-up reminders for cases that need follow-up attention."
              actionLabel="New Bring-Up"
              actionHref="/bring-ups/new"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Case</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Reason</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Created By</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bringUpList.map((bu) => (
                  <TableRow key={bu.id} className="transition-colors hover:bg-muted/50">
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
                      <BringUpStatusBadge status={bu.status} />
                    </TableCell>
                    <TableCell>{bu.createdByName ?? "—"}</TableCell>
                    <TableCell>
                      <BringUpRowActions
                        bringUpId={bu.id}
                        status={bu.status}
                        bringUp={
                          bu.status === "pending"
                            ? {
                                id: bu.id,
                                caseId: bu.caseId,
                                assignedTo: bu.assignedTo,
                                date: bu.date,
                                reason: bu.reason,
                                notes: bu.notes,
                              }
                            : undefined
                        }
                        cases={cases}
                        users={users}
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
