"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createCauseListSchema, type CreateCauseListInput } from "@/lib/validators/court";
import { createCauseList } from "@/lib/actions/courts";
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

interface CauseListFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CauseListForm({ open, onOpenChange }: CauseListFormProps) {
  const router = useRouter();

  const form = useForm<CreateCauseListInput>({
    resolver: zodResolver(createCauseListSchema),
    defaultValues: {
      courtId: undefined,
      date: "",
      judge: "",
      courtRoom: "",
      notes: "",
    },
  });

  async function onSubmit(data: CreateCauseListInput) {
    try {
      const result = await createCauseList(data);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Cause list created");
      form.reset();
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
          <DialogTitle>New Cause List</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="causeListDate">Date *</Label>
            <Input
              id="causeListDate"
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
              <Label htmlFor="causeListJudge">Judge</Label>
              <Input
                id="causeListJudge"
                {...form.register("judge")}
                placeholder="e.g. Hon. Justice Smith"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="causeListCourtRoom">Court Room</Label>
              <Input
                id="causeListCourtRoom"
                {...form.register("courtRoom")}
                placeholder="e.g. Court Room 5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="causeListNotes">Notes</Label>
            <Textarea
              id="causeListNotes"
              rows={3}
              {...form.register("notes")}
              placeholder="Additional notes (optional)"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating..." : "Create Cause List"}
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
