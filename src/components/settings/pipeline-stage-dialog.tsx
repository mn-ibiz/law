"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { pipelineStageSchema } from "@/lib/validators/pipeline";
import { createPipelineStage, updatePipelineStage } from "@/lib/actions/cases";
import { useAction } from "@/hooks/use-action";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PipelineStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practiceAreas: { id: string; name: string }[];
  editData?: {
    id: string;
    name: string;
    description: string | null;
    order: number;
    color: string | null;
    isDefault: boolean;
    practiceAreaId: string | null;
    maxDurationDays: number | null;
  } | null;
}

export function PipelineStageDialog({ open, onOpenChange, practiceAreas, editData }: PipelineStageDialogProps) {
  const router = useRouter();
  const isEditing = !!editData;

  type FormValues = {
    name: string;
    description?: string;
    order: number;
    color?: string;
    isDefault: boolean;
    practiceAreaId?: string | null;
    maxDurationDays?: number | null;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(pipelineStageSchema) as any,
    defaultValues: {
      name: editData?.name ?? "",
      description: editData?.description ?? "",
      order: editData?.order ?? 0,
      color: editData?.color ?? "",
      isDefault: editData?.isDefault ?? false,
      practiceAreaId: editData?.practiceAreaId ?? null,
      maxDurationDays: editData?.maxDurationDays ?? null,
    },
  });

  // Reset form when editData changes
  if (isEditing && form.getValues("name") !== editData.name) {
    form.reset({
      name: editData.name,
      description: editData.description ?? "",
      order: editData.order,
      color: editData.color ?? "",
      isDefault: editData.isDefault,
      practiceAreaId: editData.practiceAreaId ?? null,
      maxDurationDays: editData.maxDurationDays ?? null,
    });
  }

  const { execute: executeCreate, isPending: isCreating } = useAction(createPipelineStage, {
    successMessage: "Pipeline stage created",
    onSuccess: () => {
      form.reset();
      onOpenChange(false);
      router.refresh();
    },
  });

  const { execute: executeUpdate, isPending: isUpdating } = useAction(
    (data: FormValues) => updatePipelineStage(editData?.id ?? "", data),
    {
      successMessage: "Pipeline stage updated",
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
        router.refresh();
      },
    }
  );

  const isPending = isCreating || isUpdating;

  function onSubmit(data: FormValues) {
    if (isEditing) {
      executeUpdate(data);
    } else {
      executeCreate(data);
    }
  }

  const colorValue = form.watch("color");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Pipeline Stage" : "New Pipeline Stage"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ps-name">Name *</Label>
            <Input id="ps-name" {...form.register("name")} placeholder="e.g. Discovery" />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ps-desc">Description</Label>
            <Textarea id="ps-desc" rows={3} {...form.register("description")} placeholder="Optional description" />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ps-order">Order *</Label>
            <Input
              id="ps-order"
              type="number"
              min={0}
              {...form.register("order", { valueAsNumber: true })}
              placeholder="0"
            />
            {form.formState.errors.order && (
              <p className="text-sm text-destructive">{form.formState.errors.order.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ps-color">Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="ps-color"
                {...form.register("color")}
                placeholder="#3b82f6"
              />
              {colorValue && (
                <span
                  className="inline-block h-6 w-6 shrink-0 rounded-full border"
                  style={{ backgroundColor: colorValue }}
                />
              )}
            </div>
            {form.formState.errors.color && (
              <p className="text-sm text-destructive">{form.formState.errors.color.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ps-practice-area">Practice Area</Label>
            <Select
              value={form.watch("practiceAreaId") ?? "none"}
              onValueChange={(val) => form.setValue("practiceAreaId", val === "none" ? null : val)}
            >
              <SelectTrigger id="ps-practice-area">
                <SelectValue placeholder="Select a practice area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {practiceAreas.map((pa) => (
                  <SelectItem key={pa.id} value={pa.id}>
                    {pa.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.practiceAreaId && (
              <p className="text-sm text-destructive">{form.formState.errors.practiceAreaId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ps-max-duration">Max Duration (days)</Label>
            <Input
              id="ps-max-duration"
              type="number"
              min={1}
              {...form.register("maxDurationDays", {
                setValueAs: (v: string) => (v === "" ? null : parseInt(v, 10)),
              })}
              placeholder="Optional"
            />
            {form.formState.errors.maxDurationDays && (
              <p className="text-sm text-destructive">{form.formState.errors.maxDurationDays.message}</p>
            )}
          </div>

          <div className="flex gap-4 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
