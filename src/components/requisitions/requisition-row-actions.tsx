"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RowActionsMenu, type RowAction } from "@/components/shared/row-actions-menu";
import { useAction } from "@/hooks/use-action";
import {
  submitRequisition,
  approveRequisition,
  rejectRequisition,
  deleteRequisition,
} from "@/lib/actions/time-expenses";
import { Send, CheckCircle, XCircle } from "lucide-react";
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

interface RequisitionRowActionsProps {
  requisitionId: string;
  status: string;
  userRole: string;
}

export function RequisitionRowActions({
  requisitionId,
  status,
  userRole,
}: RequisitionRowActionsProps) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);

  const isDraft = status === "draft";
  const isPendingApproval = status === "pending_approval";
  const isAdmin = userRole === "admin";

  const { execute: executeSubmit, isPending: isSubmitting } = useAction(
    submitRequisition,
    {
      successMessage: "Requisition submitted for approval",
      onSuccess: () => router.refresh(),
    }
  );

  const { execute: executeApprove, isPending: isApproving } = useAction(
    approveRequisition,
    {
      successMessage: "Requisition approved",
      onSuccess: () => router.refresh(),
    }
  );

  const { execute: executeReject, isPending: isRejecting } = useAction(
    rejectRequisition,
    {
      successMessage: "Requisition rejected",
      onSuccess: () => router.refresh(),
    }
  );

  const { execute: executeDelete, isPending: isDeleting } = useAction(
    deleteRequisition,
    {
      successMessage: "Requisition deleted",
      onSuccess: () => {
        setShowDelete(false);
        router.refresh();
      },
    }
  );

  const actions: RowAction[] = [];

  if (isDraft) {
    actions.push({
      label: "Submit for Approval",
      icon: Send,
      onClick: () => executeSubmit(requisitionId),
      disabled: isSubmitting,
    });
  }

  if (isPendingApproval && isAdmin) {
    actions.push({
      label: "Approve",
      icon: CheckCircle,
      onClick: () => executeApprove(requisitionId),
      disabled: isApproving,
    });
    actions.push({
      label: "Reject",
      icon: XCircle,
      onClick: () => executeReject(requisitionId),
      disabled: isRejecting,
      destructive: true,
    });
  }

  return (
    <>
      <RowActionsMenu
        actions={actions}
        onDelete={isDraft ? () => setShowDelete(true) : undefined}
      />

      {/* Delete confirmation */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this requisition?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the draft requisition. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => executeDelete(requisitionId)}
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
