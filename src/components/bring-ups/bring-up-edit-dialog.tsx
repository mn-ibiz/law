"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "@/hooks/use-action";
import { updateBringUp } from "@/lib/actions/courts";
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

interface BringUpEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bringUp: {
    id: string;
    caseId: string;
    assignedTo: string | null;
    date: Date;
    reason: string;
    notes: string | null;
  };
  cases: { id: string; caseNumber: string; title: string }[];
  users: { id: string; name: string }[];
}

export function BringUpEditDialog({
  open,
  onOpenChange,
  bringUp,
  cases,
  users,
}: BringUpEditDialogProps) {
  const router = useRouter();

  const dateStr = new Date(bringUp.date).toISOString().split("T")[0];

  const [caseId, setCaseId] = useState(bringUp.caseId);
  const [assignedTo, setAssignedTo] = useState(bringUp.assignedTo ?? "");
  const [date, setDate] = useState(dateStr);
  const [reason, setReason] = useState(bringUp.reason);
  const [notes, setNotes] = useState(bringUp.notes ?? "");

  const { execute, isPending } = useAction(
    (input: { id: string; data: Record<string, unknown> }) =>
      updateBringUp(input.id, input.data),
    {
      successMessage: "Bring-up updated successfully",
      onSuccess: () => {
        onOpenChange(false);
        router.refresh();
      },
    }
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!caseId || !date || !reason.trim()) return;

    execute({
      id: bringUp.id,
      data: {
        caseId,
        assignedTo: assignedTo || undefined,
        date,
        reason: reason.trim(),
        notes: notes.trim() || undefined,
      },
    });
  }

  function handleOpenChange(value: boolean) {
    if (value) {
      const d = new Date(bringUp.date).toISOString().split("T")[0];
      setCaseId(bringUp.caseId);
      setAssignedTo(bringUp.assignedTo ?? "");
      setDate(d);
      setReason(bringUp.reason);
      setNotes(bringUp.notes ?? "");
    }
    onOpenChange(value);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Bring-Up</DialogTitle>
          <DialogDescription>
            Update this pending bring-up. Only pending bring-ups can be edited.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Case *</Label>
              <Select value={caseId} onValueChange={setCaseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select case" />
                </SelectTrigger>
                <SelectContent>
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.caseNumber} - {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assigned To</Label>
              <Select
                value={assignedTo || "__none__"}
                onValueChange={(val) => setAssignedTo(val === "__none__" ? "" : val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Unassigned</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-bu-date">Date *</Label>
              <Input
                id="edit-bu-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-bu-reason">Reason *</Label>
            <Textarea
              id="edit-bu-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-bu-notes">Notes</Label>
            <Textarea
              id="edit-bu-notes"
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
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !caseId || !date || !reason.trim()}
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
