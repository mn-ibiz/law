import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getCauseLists } from "@/lib/queries/courts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ScrollText } from "lucide-react";
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
import { CauseListActions } from "@/components/courts/cause-list-actions";
import { CauseListRowActions } from "@/components/courts/cause-list-row-actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cause Lists",
  description: "Track court cause lists and scheduled hearings",
};

export default async function CauseListsPage() {
  await requireAdminOrAttorney();
  const causeListData = await getCauseLists();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <ScrollText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cause Lists</h1>
            <p className="text-sm text-muted-foreground">
              Track court cause lists and scheduled hearings.
            </p>
          </div>
        </div>
        <CauseListActions />
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>All Cause Lists</CardTitle>
        </CardHeader>
        <CardContent>
          {causeListData.length === 0 ? (
            <EmptyState
              icon={ScrollText}
              title="No cause lists"
              description="Create a cause list to track scheduled court hearings and matters."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Court</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Judge</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Court Room</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Notes</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Created</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {causeListData.map((cl) => (
                  <TableRow key={cl.id} className="transition-colors hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <Link
                        href={`/cause-lists/${cl.id}`}
                        className="text-primary hover:underline"
                      >
                        {new Date(cl.date).toLocaleDateString(APP_LOCALE, {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </Link>
                    </TableCell>
                    <TableCell>{cl.courtName ?? "\u2014"}</TableCell>
                    <TableCell>{cl.judge ?? "\u2014"}</TableCell>
                    <TableCell>{cl.courtRoom ?? "\u2014"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {cl.notes ?? "\u2014"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(cl.createdAt).toLocaleDateString(APP_LOCALE)}
                    </TableCell>
                    <TableCell>
                      <CauseListRowActions
                        causeList={{
                          id: cl.id,
                          courtId: cl.courtId,
                          date: cl.date,
                          judge: cl.judge,
                          courtRoom: cl.courtRoom,
                          notes: cl.notes,
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
