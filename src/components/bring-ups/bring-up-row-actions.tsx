"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "@/hooks/use-action";
import { dismissBringUp, deleteBringUp } from "@/lib/actions/courts";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { Spinner } from "@/components/ui/spinner";
import { XCircle } from "lucide-react";
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

interface BringUpRowActionsProps {
  bringUpId: string;
  status: string;
}

export function BringUpRowActions({
  bringUpId,
  status,
}: BringUpRowActionsProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { execute: execDismiss, isPending: dismissPending } = useAction(
    (input: { id: string }) => dismissBringUp(input.id),
    {
      successMessage: "Bring-up dismissed",
      onSuccess: () => router.refresh(),
    }
  );

  const { execute: execDelete, isPending: deletePending } = useAction(
    (input: { id: string }) => deleteBringUp(input.id),
    {
      successMessage: "Bring-up deleted",
      onSuccess: () => {
        setDeleteOpen(false);
        router.refresh();
      },
    }
  );

  const isDismissed = status === "dismissed";
  const isCompleted = status === "completed";
  const canDismiss = !isDismissed && !isCompleted;

  return (
    <div className="flex items-center gap-1">
      <RowActionsMenu
        actions={
          canDismiss
            ? [
                {
                  label: dismissPending ? "Dismissing..." : "Dismiss",
                  icon: XCircle,
                  onClick: () => execDismiss({ id: bringUpId }),
                  disabled: dismissPending,
                },
              ]
            : []
        }
        onDelete={() => setDeleteOpen(true)}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this bring-up?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this bring-up record. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => execDelete({ id: bringUpId })}
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
