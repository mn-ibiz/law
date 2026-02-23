"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createRequisitionSchema,
  type CreateRequisitionInput,
} from "@/lib/validators/time-expense";
import { createRequisition } from "@/lib/actions/time-expenses";
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

interface RequisitionFormProps {
  cases: { id: string; caseNumber: string; title: string }[];
}

export function RequisitionForm({ cases }: RequisitionFormProps) {
  const router = useRouter();

  const form = useForm<CreateRequisitionInput>({
    resolver: zodResolver(createRequisitionSchema),
    defaultValues: {
      caseId: undefined,
      description: "",
      amount: undefined,
      justification: "",
    },
  });

  async function onSubmit(data: CreateRequisitionInput) {
    try {
      // If caseId is empty string, remove it so Zod optional works
      const payload = {
        ...data,
        caseId: data.caseId || undefined,
        justification: data.justification || undefined,
      };

      const result = await createRequisition(payload);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Requisition created");
      router.push("/requisitions");
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
              <Label>Case (Optional)</Label>
              <Select
                value={form.watch("caseId") ?? ""}
                onValueChange={(val) =>
                  form.setValue("caseId", val === "__none__" ? undefined : val)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select case (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No case</SelectItem>
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

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="justification">Justification</Label>
              <Textarea
                id="justification"
                rows={2}
                placeholder="Optional justification for this requisition"
                {...form.register("justification")}
              />
              {form.formState.errors.justification && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.justification.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? "Saving..."
                : "Create Requisition"}
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
