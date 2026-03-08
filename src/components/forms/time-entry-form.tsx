"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createTimeEntrySchema,
  type CreateTimeEntryInput,
} from "@/lib/validators/time-expense";
import { createTimeEntry } from "@/lib/actions/time-expenses";
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
import { useOrgConfig } from "@/components/providers/tenant-config-provider";

interface TimeEntryFormProps {
  cases: { id: string; caseNumber: string; title: string }[];
}

export function TimeEntryForm({ cases }: TimeEntryFormProps) {
  const { currency } = useOrgConfig();
  const router = useRouter();

  const form = useForm<CreateTimeEntryInput>({
    resolver: zodResolver(createTimeEntrySchema),
    defaultValues: {
      caseId: "",
      description: "",
      date: "",
      hours: undefined,
      hourlyRate: undefined,
      isBillable: true,
    },
  });

  async function onSubmit(data: CreateTimeEntryInput) {
    try {
      const result = await createTimeEntry(data);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Time entry created");
      router.push("/time-expenses");
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
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" {...form.register("date")} />
              {form.formState.errors.date && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.date.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hours">Hours *</Label>
              <Input
                id="hours"
                type="number"
                step="0.1"
                min="0.1"
                {...form.register("hours", { valueAsNumber: true })}
              />
              {form.formState.errors.hours && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.hours.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourlyRate">{`Hourly Rate (${currency})`}</Label>
              <Input
                id="hourlyRate"
                type="number"
                step="100"
                placeholder="Optional"
                {...form.register("hourlyRate", { valueAsNumber: true })}
              />
              {form.formState.errors.hourlyRate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.hourlyRate.message}
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
              {form.formState.isSubmitting
                ? "Saving..."
                : "Create Time Entry"}
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
