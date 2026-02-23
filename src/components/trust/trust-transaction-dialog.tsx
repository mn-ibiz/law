"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "@/hooks/use-action";
import { createTrustTransaction } from "@/lib/actions/trust";
import { formatKES } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

interface TrustTransactionDialogProps {
  accountId: string;
  type: "deposit" | "withdrawal";
  currentBalance: number;
  trigger?: React.ReactNode;
}

export function TrustTransactionDialog({
  accountId,
  type,
  currentBalance,
  trigger,
}: TrustTransactionDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");

  const isDeposit = type === "deposit";
  const numericAmount = parseFloat(amount) || 0;
  const exceedsBalance = !isDeposit && numericAmount > currentBalance;

  const { execute, isPending } = useAction(createTrustTransaction, {
    successMessage: `${isDeposit ? "Deposit" : "Withdrawal"} recorded successfully`,
    onSuccess: () => {
      setOpen(false);
      resetForm();
      router.refresh();
    },
  });

  function resetForm() {
    setAmount("");
    setDescription("");
    setReferenceNumber("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (numericAmount <= 0) return;
    if (exceedsBalance) return;

    execute({
      accountId,
      type,
      amount: numericAmount,
      description,
      referenceNumber: referenceNumber || undefined,
    });
  }

  const defaultTrigger = (
    <Button
      variant={isDeposit ? "default" : "outline"}
      size="sm"
    >
      {isDeposit ? (
        <><ArrowDownToLine className="mr-1 size-4" /> Deposit</>
      ) : (
        <><ArrowUpFromLine className="mr-1 size-4" /> Withdraw</>
      )}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        {trigger ?? defaultTrigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isDeposit ? "Record Deposit" : "Record Withdrawal"}
          </DialogTitle>
          <DialogDescription>
            {isDeposit
              ? "Add funds to this trust account."
              : "Withdraw funds from this trust account."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isDeposit && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm font-medium text-amber-800">
                Current Balance: {formatKES(currentBalance)}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="tx-amount">Amount (KES) *</Label>
            <Input
              id="tx-amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            {exceedsBalance && (
              <p className="flex items-center gap-1 text-sm text-destructive">
                <AlertTriangle className="size-3.5" />
                Amount exceeds available balance
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tx-description">Description *</Label>
            <Textarea
              id="tx-description"
              rows={3}
              placeholder={isDeposit ? "e.g. Client retainer deposit" : "e.g. Court filing fee payment"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tx-reference">Reference Number</Label>
            <Input
              id="tx-reference"
              placeholder="Optional"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || numericAmount <= 0 || exceedsBalance || !description.trim()}
            >
              {isPending
                ? "Processing..."
                : isDeposit
                  ? "Record Deposit"
                  : "Record Withdrawal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
