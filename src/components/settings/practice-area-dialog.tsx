"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { practiceAreaSchema, type PracticeAreaInput } from "@/lib/validators/settings";
import { createPracticeArea, updatePracticeArea } from "@/lib/actions/settings";
import { useAction } from "@/hooks/use-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PracticeAreaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: {
    id: string;
    name: string;
    description: string | null;
  } | null;
}

export function PracticeAreaDialog({ open, onOpenChange, editData }: PracticeAreaDialogProps) {
  const router = useRouter();
  const isEditing = !!editData;

  const form = useForm<PracticeAreaInput>({
    resolver: zodResolver(practiceAreaSchema),
    defaultValues: {
      name: editData?.name ?? "",
      description: editData?.description ?? "",
    },
  });

  // Reset form when editData changes
  if (isEditing && form.getValues("name") !== editData.name) {
    form.reset({ name: editData.name, description: editData.description ?? "" });
  }

  const { execute: executeCreate, isPending: isCreating } = useAction(createPracticeArea, {
    successMessage: "Practice area created",
    onSuccess: () => {
      form.reset();
      onOpenChange(false);
      router.refresh();
    },
  });

  const { execute: executeUpdate, isPending: isUpdating } = useAction(
    (data: PracticeAreaInput) => updatePracticeArea(editData?.id ?? "", data),
    {
      successMessage: "Practice area updated",
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
        router.refresh();
      },
    }
  );

  const isPending = isCreating || isUpdating;

  function onSubmit(data: PracticeAreaInput) {
    if (isEditing) {
      executeUpdate(data);
    } else {
      executeCreate(data);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Practice Area" : "New Practice Area"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pa-name">Name *</Label>
            <Input id="pa-name" {...form.register("name")} placeholder="e.g. Commercial Litigation" />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pa-desc">Description</Label>
            <Textarea id="pa-desc" rows={3} {...form.register("description")} placeholder="Optional description" />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
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
