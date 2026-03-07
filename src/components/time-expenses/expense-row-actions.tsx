"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { useAction } from "@/hooks/use-action";
import { deleteExpense } from "@/lib/actions/time-expenses";
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
import { ExpenseEditSheet } from "./expense-edit-sheet";
import type { ExpenseRow } from "./expense-columns";

interface ExpenseRowActionsProps {
  expense: ExpenseRow;
}

export function ExpenseRowActions({ expense }: ExpenseRowActionsProps) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const { execute: executeDelete, isPending: isDeleting } = useAction(
    deleteExpense,
    {
      successMessage: "Expense deleted",
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
        onEdit={!expense.isBilled ? () => setShowEdit(true) : undefined}
        onDelete={!expense.isBilled ? () => setShowDelete(true) : undefined}
      />

      {/* Edit sheet */}
      {showEdit && (
        <ExpenseEditSheet
          expense={expense}
          open={showEdit}
          onOpenChange={setShowEdit}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the expense record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => executeDelete(expense.id)}
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
