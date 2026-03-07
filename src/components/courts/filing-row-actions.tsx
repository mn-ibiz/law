"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { useAction } from "@/hooks/use-action";
import { deleteCourtFiling } from "@/lib/actions/courts";
import { FilingEditDialog } from "./filing-edit-dialog";
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

interface FilingRowActionsProps {
  filing: {
    id: string;
    caseId: string;
    courtId: string | null;
    filingType: string;
    filingNumber: string | null;
    filingDate: Date | null;
    documentUrl: string | null;
    notes: string | null;
    status: string;
  };
  cases: { id: string; caseNumber: string; title: string }[];
  courts: { id: string; name: string }[];
}

export function FilingRowActions({ filing, cases, courts }: FilingRowActionsProps) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const { execute: executeDelete, isPending: isDeleting } = useAction(deleteCourtFiling, {
    successMessage: "Filing deleted",
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
        <FilingEditDialog
          open={showEdit}
          onOpenChange={setShowEdit}
          filing={filing}
          cases={cases}
          courts={courts}
        />
      )}

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this filing?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the court filing record for
              &ldquo;{filing.filingType}&rdquo;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => executeDelete(filing.id)}
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
