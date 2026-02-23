"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createExpenseSchema,
  type CreateExpenseInput,
} from "@/lib/validators/time-expense";
import { createExpense } from "@/lib/actions/time-expenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { formatEnum } from "@/lib/utils/format-enum";

const EXPENSE_CATEGORIES = [
  "filing_fee",
  "travel",
  "courier",
  "printing",
  "expert_fee",
  "court_fee",
  "other",
] as const;

interface ExpenseFormProps {
  cases: { id: string; caseNumber: string; title: string }[];
}

export function ExpenseForm({ cases }: ExpenseFormProps) {
  const router = useRouter();

  const form = useForm<CreateExpenseInput>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      caseId: "",
      category: undefined,
      description: "",
      amount: undefined,
      date: "",
      isBillable: true,
    },
  });

  async function onSubmit(data: CreateExpenseInput) {
    try {
      const result = await createExpense(data);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Expense created");
      router.push("/time-expenses?tab=expenses");
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Case *</Label>
              <Select
                value={form.watch("caseId")}
                onValueChange={(val) => form.setValue("caseId", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select case" />
                </SelectTrigger>
                <SelectContent>
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.caseNumber} - {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.caseId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.caseId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={form.watch("category")}
                onValueChange={(val) =>
                  form.setValue(
                    "category",
                    val as CreateExpenseInput["category"]
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {formatEnum(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (KES) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                {...form.register("amount", { valueAsNumber: true })}
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" {...form.register("date")} />
              {form.formState.errors.date && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.date.message}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                rows={3}
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="isBillable"
                checked={form.watch("isBillable")}
                onCheckedChange={(val) =>
                  form.setValue("isBillable", val === true)
                }
              />
              <Label htmlFor="isBillable">Billable</Label>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Create Expense"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
