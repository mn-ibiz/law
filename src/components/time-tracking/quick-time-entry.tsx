"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useAction } from "@/hooks/use-action";
import { createTimeEntry } from "@/lib/actions/time-expenses";

interface QuickTimeCase {
  id: string;
  caseNumber: string;
  title: string;
}

interface QuickTimeEntryProps {
  cases: QuickTimeCase[];
  triggerLabel?: string;
  triggerVariant?: "default" | "outline" | "secondary" | "ghost";
}

const quickTimeSchema = z.object({
  date: z.string().min(1, "Date is required"),
  caseId: z.string().uuid("Select a case"),
  description: z.string().min(1, "Description is required").max(5000),
  hours: z.number().min(0.1, "Hours must be at least 0.1"),
  isBillable: z.boolean(),
});

type QuickTimeFormData = z.infer<typeof quickTimeSchema>;

export function QuickTimeEntry({
  cases,
  triggerLabel = "Quick Time Entry",
  triggerVariant = "outline",
}: QuickTimeEntryProps) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<QuickTimeFormData>({
    resolver: zodResolver(quickTimeSchema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      caseId: "",
      description: "",
      hours: 1,
      isBillable: true,
    },
  });

  const isBillable = watch("isBillable");
  const caseId = watch("caseId");

  const { execute, isPending } = useAction(createTimeEntry, {
    successMessage: "Time entry created",
    onSuccess: () => {
      reset();
      setOpen(false);
    },
  });

  function onSubmit(data: QuickTimeFormData) {
    execute(data);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant={triggerVariant} size="sm">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          {triggerLabel}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Quick Time Entry</SheetTitle>
          <SheetDescription>
            Record a manual time entry for a case.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
          <div className="space-y-2">
            <Label htmlFor="quick-date">Date</Label>
            <Input
              id="quick-date"
              type="date"
              {...register("date")}
            />
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-case">Case</Label>
            <Select
              value={caseId}
              onValueChange={(val) => setValue("caseId", val, { shouldValidate: true })}
            >
              <SelectTrigger id="quick-case">
                <SelectValue placeholder="Select a case" />
              </SelectTrigger>
              <SelectContent>
                {cases.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.caseNumber} - {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.caseId && (
              <p className="text-xs text-destructive">{errors.caseId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-desc">Description</Label>
            <Input
              id="quick-desc"
              placeholder="Work performed..."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-hours">Hours</Label>
            <Input
              id="quick-hours"
              type="number"
              step="0.1"
              min="0.1"
              {...register("hours", { valueAsNumber: true })}
            />
            {errors.hours && (
              <p className="text-xs text-destructive">{errors.hours.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="quick-billable">Billable</Label>
            <Switch
              id="quick-billable"
              checked={isBillable}
              onCheckedChange={(checked) =>
                setValue("isBillable", checked, { shouldValidate: true })
              }
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Saving..." : "Save Time Entry"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
