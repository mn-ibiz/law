import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getCauseLists, getCauseListEntries } from "@/lib/queries/courts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, ScrollText } from "lucide-react";
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
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cause List Details",
  description: "View cause list entries and hearing details",
};

export default async function CauseListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminOrAttorney();
  const { id } = await params;

  const allCauseLists = await getCauseLists();
  const causeList = allCauseLists.find((cl) => cl.id === id);

  if (!causeList) {
    notFound();
  }

  const entries = await getCauseListEntries(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/cause-lists">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <ScrollText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Cause List -{" "}
              {new Date(causeList.date).toLocaleDateString(APP_LOCALE, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h1>
            <p className="text-sm text-muted-foreground">
              {[causeList.courtName, causeList.judge, causeList.courtRoom]
                .filter(Boolean)
                .join(" | ") || "No court details specified"}
            </p>
          </div>
        </div>
      </div>

      {causeList.notes && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {causeList.notes}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <EmptyState
              icon={ScrollText}
              title="No entries"
              description="This cause list has no entries yet."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground w-12">#</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Time</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Case No.</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Parties</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Matter</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Outcome</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry, idx) => (
                  <TableRow key={entry.id} className="transition-colors hover:bg-muted/50">
                    <TableCell className="font-medium text-muted-foreground">
                      {idx + 1}
                    </TableCell>
                    <TableCell>{entry.time ?? "—"}</TableCell>
                    <TableCell>
                      {entry.caseId ? (
                        <Link
                          href={`/cases/${entry.caseId}`}
                          className="text-primary hover:underline"
                        >
                          {entry.caseNumber ?? "View Case"}
                        </Link>
                      ) : (
                        entry.caseNumber ?? "—"
                      )}
                    </TableCell>
                    <TableCell>{entry.parties ?? "—"}</TableCell>
                    <TableCell>{entry.matter ?? "—"}</TableCell>
                    <TableCell>{entry.outcome ?? "—"}</TableCell>
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
