"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateCauseListSchema, type UpdateCauseListInput } from "@/lib/validators/court";
import { updateCauseList } from "@/lib/actions/courts";
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

interface CauseListEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  causeList: {
    id: string;
    courtId: string | null;
    date: Date;
    judge: string | null;
    courtRoom: string | null;
    notes: string | null;
  };
}

export function CauseListEditDialog({
  open,
  onOpenChange,
  causeList,
}: CauseListEditDialogProps) {
  const router = useRouter();

  const form = useForm<UpdateCauseListInput>({
    resolver: zodResolver(updateCauseListSchema),
    defaultValues: {
      courtId: causeList.courtId ?? undefined,
      date: new Date(causeList.date).toISOString().split("T")[0],
      judge: causeList.judge ?? "",
      courtRoom: causeList.courtRoom ?? "",
      notes: causeList.notes ?? "",
    },
  });

  async function onSubmit(data: UpdateCauseListInput) {
    try {
      const result = await updateCauseList(causeList.id, data);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Cause list updated");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Cause List</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editCauseListDate">Date *</Label>
            <Input
              id="editCauseListDate"
              type="date"
              {...form.register("date")}
            />
            {form.formState.errors.date && (
              <p className="text-sm text-destructive">
                {form.formState.errors.date.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="editCauseListJudge">Judge</Label>
              <Input
                id="editCauseListJudge"
                {...form.register("judge")}
                placeholder="e.g. Hon. Justice Smith"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editCauseListCourtRoom">Court Room</Label>
              <Input
                id="editCauseListCourtRoom"
                {...form.register("courtRoom")}
                placeholder="e.g. Court Room 5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editCauseListNotes">Notes</Label>
            <Textarea
              id="editCauseListNotes"
              rows={3}
              {...form.register("notes")}
              placeholder="Additional notes (optional)"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
