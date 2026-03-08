"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "@/hooks/use-action";
import { updateRequisition } from "@/lib/actions/time-expenses";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrgConfig } from "@/components/providers/tenant-config-provider";

interface RequisitionEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requisition: {
    id: string;
    description: string;
    amount: string;
    caseId: string | null;
    notes: string | null;
  };
  cases: { id: string; caseNumber: string; title: string }[];
}

export function RequisitionEditDialog({
  open,
  onOpenChange,
  requisition,
  cases,
}: RequisitionEditDialogProps) {
  const { currency } = useOrgConfig();
  const router = useRouter();
  const [description, setDescription] = useState(requisition.description);
  const [amount, setAmount] = useState(requisition.amount);
  const [caseId, setCaseId] = useState(requisition.caseId ?? "");
  const [justification, setJustification] = useState(requisition.notes ?? "");

  const { execute, isPending } = useAction(
    (input: { id: string; data: Record<string, unknown> }) =>
      updateRequisition(input.id, input.data),
    {
      successMessage: "Requisition updated successfully",
      onSuccess: () => {
        onOpenChange(false);
        router.refresh();
      },
    }
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    execute({
      id: requisition.id,
      data: {
        description: description.trim(),
        amount: parseFloat(amount),
        caseId: caseId || undefined,
        justification: justification.trim() || undefined,
      },
    });
  }

  // Reset form state when dialog opens with new data
  function handleOpenChange(value: boolean) {
    if (value) {
      setDescription(requisition.description);
      setAmount(requisition.amount);
      setCaseId(requisition.caseId ?? "");
      setJustification(requisition.notes ?? "");
    }
    onOpenChange(value);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Requisition</DialogTitle>
          <DialogDescription>
            Update this draft requisition. Only draft requisitions can be edited.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Case (Optional)</Label>
              <Select
                value={caseId || "__none__"}
                onValueChange={(val) => setCaseId(val === "__none__" ? "" : val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select case (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No case</SelectItem>
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.caseNumber} - {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-req-amount">{`Amount (${currency}) *`}</Label>
              <Input
                id="edit-req-amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-req-desc">Description *</Label>
            <Textarea
              id="edit-req-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-req-just">Justification</Label>
            <Textarea
              id="edit-req-just"
              rows={2}
              placeholder="Optional justification for this requisition"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !description.trim() || !amount}
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
