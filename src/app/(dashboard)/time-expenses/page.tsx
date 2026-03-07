import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getTimeEntries, getExpenses } from "@/lib/queries/time-expenses";
import { Card, CardContent } from "@/components/ui/card";
import { TimeEntryDataTable } from "@/components/time-expenses/time-entry-data-table";
import { ExpenseDataTable } from "@/components/time-expenses/expense-data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { formatKES } from "@/lib/utils/format";
import { Plus, Clock, Receipt, CalendarDays, DollarSign } from "lucide-react";
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

  const totalHours = entries.reduce((sum, e) => sum + Number(e.hours), 0);
  const billableHours = entries
    .filter((e) => e.isBillable)
    .reduce((sum, e) => sum + Number(e.hours), 0);
  const totalExpenses = expenseList.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Time & Expenses</h1>
            <p className="text-sm text-muted-foreground">
              Track billable hours and expenses.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/time-expenses/new?type=time">
              <Plus className="mr-2 h-4 w-4" />
              New Time Entry
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/time-expenses/weekly">
              <CalendarDays className="mr-2 h-4 w-4" />
              Weekly View
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/time-expenses/new?type=expense">
              <Plus className="mr-2 h-4 w-4" />
              New Expense
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Hours</p>
              <p className="text-2xl font-bold">{totalHours.toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Billable Hours</p>
              <p className="text-2xl font-bold">{billableHours.toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expenses</p>
              <p className="text-2xl font-bold">{expenseList.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold">{formatKES(totalExpenses)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={params.tab === "expenses" ? "expenses" : "time"}>
        <TabsList>
          <TabsTrigger value="time">Time Entries</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>
        <TabsContent value="time">
          <TimeEntryDataTable data={entries} />
        </TabsContent>
        <TabsContent value="expenses">
          <ExpenseDataTable data={expenseList} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
