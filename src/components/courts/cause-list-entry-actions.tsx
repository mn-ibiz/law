"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { useAction } from "@/hooks/use-action";
import { updateCauseListEntry, deleteCauseListEntry } from "@/lib/actions/courts";
import { updateCauseListEntrySchema, type UpdateCauseListEntryInput } from "@/lib/validators/court";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";

interface CauseListEntryActionsProps {
  entry: {
    id: string;
    causeListId: string;
    caseId: string | null;
    caseNumber: string | null;
    parties: string | null;
    matter: string | null;
    time: string | null;
    order: number;
    outcome: string | null;
  };
}

export function CauseListEntryActions({ entry }: CauseListEntryActionsProps) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const { execute: executeDelete, isPending: isDeleting } = useAction(deleteCauseListEntry, {
    successMessage: "Entry deleted",
    onSuccess: () => {
      setShowDelete(false);
      router.refresh();
    },
  });

  return (
    <>
      <RowActionsMenu
        actions={[]}
        onEdit={() => setShowEdit(true)}
        onDelete={() => setShowDelete(true)}
      />

      {showEdit && (
        <EntryEditDialog
          open={showEdit}
          onOpenChange={setShowEdit}
          entry={entry}
        />
      )}

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this entry from the cause list.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => executeDelete(entry.id)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Spinner className="h-4 w-4 mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function EntryEditDialog({
  open,
  onOpenChange,
  entry,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: CauseListEntryActionsProps["entry"];
}) {
  const router = useRouter();

  const form = useForm<UpdateCauseListEntryInput>({
    resolver: zodResolver(updateCauseListEntrySchema),
    defaultValues: {
      caseNumber: entry.caseNumber ?? "",
      parties: entry.parties ?? "",
      matter: entry.matter ?? "",
      time: entry.time ?? "",
      order: entry.order,
      outcome: entry.outcome ?? "",
    },
  });

  async function onSubmit(data: UpdateCauseListEntryInput) {
    try {
      const result = await updateCauseListEntry(entry.id, data);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Entry updated");
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
          <DialogTitle>Edit Cause List Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="editEntryTime">Time</Label>
              <Input
                id="editEntryTime"
                {...form.register("time")}
                placeholder="e.g. 9:00 AM"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editEntryOrder">Order</Label>
              <Input
                id="editEntryOrder"
                type="number"
                {...form.register("order", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editEntryCaseNumber">Case Number</Label>
            <Input
              id="editEntryCaseNumber"
              {...form.register("caseNumber")}
              placeholder="e.g. HCCC 123/2026"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editEntryParties">Parties</Label>
            <Input
              id="editEntryParties"
              {...form.register("parties")}
              placeholder="e.g. Smith v Jones"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editEntryMatter">Matter</Label>
            <Input
              id="editEntryMatter"
              {...form.register("matter")}
              placeholder="e.g. Hearing of Application"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editEntryOutcome">Outcome</Label>
            <Textarea
              id="editEntryOutcome"
              rows={2}
              {...form.register("outcome")}
              placeholder="Outcome or orders made"
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
