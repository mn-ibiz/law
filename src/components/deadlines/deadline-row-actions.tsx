"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "@/hooks/use-action";
import { completeDeadline, deleteDeadline } from "@/lib/actions/calendar";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle } from "lucide-react";
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

interface DeadlineRowActionsProps {
  deadlineId: string;
  deadlineTitle: string;
  isCompleted: boolean;
}

export function DeadlineRowActions({
  deadlineId,
  deadlineTitle,
  isCompleted,
}: DeadlineRowActionsProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { execute: execComplete, isPending: completePending } = useAction(
    (input: { id: string }) => completeDeadline(input.id),
    {
      successMessage: "Deadline marked as completed",
      onSuccess: () => router.refresh(),
    }
  );

  const { execute: execDelete, isPending: deletePending } = useAction(
    (input: { id: string }) => deleteDeadline(input.id),
    {
      successMessage: "Deadline deleted",
      onSuccess: () => {
        setDeleteOpen(false);
        router.refresh();
      },
    }
  );

  return (
    <div className="flex items-center gap-1">
      <RowActionsMenu
        actions={
          isCompleted
            ? []
            : [
                {
                  label: completePending ? "Completing..." : "Mark Complete",
                  icon: CheckCircle,
                  onClick: () => execComplete({ id: deadlineId }),
                  disabled: completePending,
                },
              ]
        }
        onDelete={() => setDeleteOpen(true)}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this deadline?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{deadlineTitle}&rdquo;. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => execDelete({ id: deadlineId })}
              disabled={deletePending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePending ? <Spinner className="h-4 w-4 mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
