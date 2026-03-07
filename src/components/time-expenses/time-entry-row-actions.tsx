"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { useAction } from "@/hooks/use-action";
import { deleteTimeEntry } from "@/lib/actions/time-expenses";
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
import { TimeEntryEditSheet } from "./time-entry-edit-sheet";
import type { TimeEntryRow } from "./time-entry-columns";

interface TimeEntryRowActionsProps {
  entry: TimeEntryRow;
}

export function TimeEntryRowActions({ entry }: TimeEntryRowActionsProps) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const { execute: executeDelete, isPending: isDeleting } = useAction(
    deleteTimeEntry,
    {
      successMessage: "Time entry deleted",
      onSuccess: () => {
        setShowDelete(false);
        router.refresh();
      },
    }
  );

  return (
    <>
      <RowActionsMenu
        actions={[]}
        onEdit={!entry.isBilled ? () => setShowEdit(true) : undefined}
        onDelete={!entry.isBilled ? () => setShowDelete(true) : undefined}
      />

      {/* Edit sheet */}
      {showEdit && (
        <TimeEntryEditSheet
          entry={entry}
          open={showEdit}
          onOpenChange={setShowEdit}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this time entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the time entry. This action cannot be undone.
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
