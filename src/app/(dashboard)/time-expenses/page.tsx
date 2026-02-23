import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getTimeEntries, getExpenses } from "@/lib/queries/time-expenses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BillableBadge } from "@/components/shared/status-badges";
import { EmptyState } from "@/components/shared/empty-state";
import { TimeEntryRowActions } from "@/components/time-expenses/time-entry-row-actions";
import { ExpenseRowActions } from "@/components/time-expenses/expense-row-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatKES } from "@/lib/utils/format";
import { formatEnum } from "@/lib/utils/format-enum";
import { APP_LOCALE } from "@/lib/constants/locale";
import { Plus, Clock, Receipt, CalendarDays } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Time & Expenses",
  description: "Track billable hours and expenses",
};

export default async function TimeExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireAdminOrAttorney();
  const params = await searchParams;
  const [entries, expenseList] = await Promise.all([
    getTimeEntries(),
    getExpenses(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Time & Expenses</h1>
          <p className="text-muted-foreground">Track billable hours and expenses.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" asChild>
            <Link href="/time-expenses/new?type=time">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              New Time Entry
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href="/time-expenses/weekly">
              <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
              Weekly View
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href="/time-expenses/new?type=expense">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              New Expense
            </Link>
          </Button>
        </div>
      </div>
      <Tabs defaultValue={params.tab === "expenses" ? "expenses" : "time"}>
        <TabsList>
          <TabsTrigger value="time">Time Entries</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>
        <TabsContent value="time">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Time Entries</CardTitle>
            </CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="No time entries yet"
                  description="Record your first billable time entry to get started."
                  actionLabel="New Time Entry"
                  actionHref="/time-expenses/new?type=time"
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Case</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Attorney</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Hours</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Amount</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Billable</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground w-[50px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((e) => (
                      <TableRow key={e.id} className="transition-colors hover:bg-muted/50">
                        <TableCell>{new Date(e.date).toLocaleDateString(APP_LOCALE)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{e.description}</TableCell>
                        <TableCell>
                          {e.caseNumber ? (
                            <span className="font-mono text-xs">{e.caseNumber}</span>
                          ) : "\u2014"}
                        </TableCell>
                        <TableCell>{e.userName}</TableCell>
                        <TableCell>{e.hours}</TableCell>
                        <TableCell>{e.amount ? formatKES(Number(e.amount)) : "\u2014"}</TableCell>
                        <TableCell>
                          <BillableBadge billable={e.isBillable} />
                        </TableCell>
                        <TableCell>
                          <TimeEntryRowActions
                            timeEntryId={e.id}
                            isBilled={e.isBilled}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="expenses">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              {expenseList.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title="No expenses yet"
                  description="Record your first expense to get started."
                  actionLabel="New Expense"
                  actionHref="/time-expenses/new?type=expense"
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Category</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Case</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Amount</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Billable</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground w-[50px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenseList.map((e) => (
                      <TableRow key={e.id} className="transition-colors hover:bg-muted/50">
                        <TableCell>{new Date(e.date).toLocaleDateString(APP_LOCALE)}</TableCell>
                        <TableCell>{e.description}</TableCell>
                        <TableCell className="capitalize">{formatEnum(e.category)}</TableCell>
                        <TableCell className="font-mono text-xs">{e.caseNumber ?? "\u2014"}</TableCell>
                        <TableCell>{formatKES(Number(e.amount))}</TableCell>
                        <TableCell>
                          <BillableBadge billable={e.isBillable} />
                        </TableCell>
                        <TableCell>
                          <ExpenseRowActions expenseId={e.id} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
