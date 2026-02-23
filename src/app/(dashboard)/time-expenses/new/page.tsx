import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getCases } from "@/lib/queries/cases";
import { TimeEntryForm } from "@/components/forms/time-entry-form";
import { ExpenseForm } from "@/components/forms/expense-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Time Entry / Expense",
  description: "Record a new time entry or expense",
};

export default async function NewTimeExpensePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  await requireAdminOrAttorney();
  const params = await searchParams;
  const { data: caseList } = await getCases({});

  const cases = caseList.map((c) => ({
    id: c.id,
    caseNumber: c.caseNumber,
    title: c.title,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          New Time Entry / Expense
        </h1>
        <p className="text-muted-foreground">
          Record a new time entry or expense against a case.
        </p>
      </div>

      <Tabs defaultValue={params.type === "expense" ? "expense" : "time"}>
        <TabsList>
          <TabsTrigger value="time">Time Entry</TabsTrigger>
          <TabsTrigger value="expense">Expense</TabsTrigger>
        </TabsList>
        <TabsContent value="time">
          <TimeEntryForm cases={cases} />
        </TabsContent>
        <TabsContent value="expense">
          <ExpenseForm cases={cases} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
