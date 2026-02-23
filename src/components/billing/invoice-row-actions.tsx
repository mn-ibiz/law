"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RowActionsMenu, type RowAction } from "@/components/shared/row-actions-menu";
import { PaymentDialog } from "@/components/billing/payment-dialog";
import { useAction } from "@/hooks/use-action";
import { sendInvoice, cancelInvoice, deleteInvoice } from "@/lib/actions/billing";
import { Send, CreditCard, XCircle } from "lucide-react";
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

interface InvoiceRowActionsProps {
  invoiceId: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
  userRole: string;
}

export function InvoiceRowActions({
  invoiceId,
  status,
  totalAmount,
  paidAmount,
  userRole,
}: InvoiceRowActionsProps) {
  const router = useRouter();
  const [showPayment, setShowPayment] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  const { execute: executeSend, isPending: isSending } = useAction(sendInvoice, {
    successMessage: "Invoice sent",
    onSuccess: () => router.refresh(),
  });

  const { execute: executeCancel, isPending: isCancelling } = useAction(cancelInvoice, {
    successMessage: "Invoice cancelled",
    onSuccess: () => {
      setShowCancel(false);
      router.refresh();
    },
  });

  const { execute: executeDelete, isPending: isDeleting } = useAction(deleteInvoice, {
    successMessage: "Invoice deleted",
    onSuccess: () => {
      setShowDelete(false);
      router.refresh();
    },
  });

  const isDraft = status === "draft";
  const isPayable = ["sent", "partially_paid", "overdue"].includes(status);
  const isCancellable =
    !["paid", "cancelled"].includes(status) && userRole === "admin";

  const actions: RowAction[] = [];

  if (isDraft) {
    actions.push({
      label: "Send",
      icon: Send,
      onClick: () => executeSend(invoiceId),
      disabled: isSending,
    });
  }

  if (isPayable) {
    actions.push({
      label: "Record Payment",
      icon: CreditCard,
      onClick: () => setShowPayment(true),
    });
  }

  if (isCancellable) {
    actions.push({
      label: "Cancel Invoice",
      icon: XCircle,
      onClick: () => setShowCancel(true),
      destructive: true,
      separator: true,
    });
  }

  return (
    <>
      <RowActionsMenu
        actions={actions}
        onView={() => router.push(`/billing/${invoiceId}`)}
        onDelete={isDraft ? () => setShowDelete(true) : undefined}
      />

      {/* Payment dialog */}
      <PaymentDialog
        open={showPayment}
        onOpenChange={setShowPayment}
        invoiceId={invoiceId}
        totalAmount={totalAmount}
        paidAmount={paidAmount}
      />

      {/* Delete confirmation */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the draft invoice. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => executeDelete(invoiceId)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Spinner className="h-4 w-4 mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel confirmation */}
      <AlertDialog open={showCancel} onOpenChange={setShowCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the invoice as cancelled. This cannot be easily reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => executeCancel(invoiceId)}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? <Spinner className="h-4 w-4 mr-2" /> : null}
              Cancel Invoice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
