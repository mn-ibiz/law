"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useAction } from "@/hooks/use-action";
import { recordPayment } from "@/lib/actions/billing";
import { formatKES } from "@/lib/utils/format";
import { useRouter } from "next/navigation";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  totalAmount: number;
  paidAmount: number;
}

const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "mpesa", label: "M-Pesa" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
  { value: "credit_card", label: "Credit Card" },
] as const;

export function PaymentDialog({
  open,
  onOpenChange,
  invoiceId,
  totalAmount,
  paidAmount,
}: PaymentDialogProps) {
  const router = useRouter();
  const remainingBalance = totalAmount - paidAmount;

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [mpesaCode, setMpesaCode] = useState("");
  const [notes, setNotes] = useState("");

  const { execute, isPending } = useAction(recordPayment, {
    successMessage: "Payment recorded successfully",
    onSuccess: () => {
      onOpenChange(false);
      resetForm();
      router.refresh();
    },
  });

  function resetForm() {
    setAmount("");
    setPaymentMethod("");
    setReferenceNumber("");
    setMpesaCode("");
    setNotes("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    if (!paymentMethod) return;

    execute({
      invoiceId,
      amount: parsedAmount,
      paymentMethod: paymentMethod as "bank_transfer" | "mpesa" | "cash" | "cheque" | "credit_card",
      referenceNumber: referenceNumber || undefined,
      mpesaCode: mpesaCode || undefined,
      notes: notes || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Outstanding balance: {formatKES(remainingBalance)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Total:</span>{" "}
              <span className="font-medium">{formatKES(totalAmount)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Paid:</span>{" "}
              <span className="font-medium">{formatKES(paidAmount)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-amount">Amount (KES)</Label>
            <Input
              id="payment-amount"
              type="number"
              step="0.01"
              min="0.01"
              max={remainingBalance}
              placeholder={`Max ${formatKES(remainingBalance)}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
              <SelectTrigger id="payment-method" className="w-full">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {paymentMethod === "mpesa" && (
            <div className="space-y-2">
              <Label htmlFor="mpesa-code">M-Pesa Transaction Code</Label>
              <Input
                id="mpesa-code"
                placeholder="e.g. ABC123XYZ"
                value={mpesaCode}
                onChange={(e) => setMpesaCode(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reference-number">Reference Number</Label>
            <Input
              id="reference-number"
              placeholder="Optional reference"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-notes">Notes</Label>
            <Textarea
              id="payment-notes"
              placeholder="Optional payment notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !paymentMethod || !amount}>
              {isPending && <Spinner className="mr-2 h-4 w-4" />}
              Record Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
