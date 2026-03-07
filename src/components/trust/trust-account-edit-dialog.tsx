"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "@/hooks/use-action";
import { updateTrustAccount } from "@/lib/actions/trust";
import { formatEnum } from "@/lib/utils/format-enum";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil } from "lucide-react";

interface TrustAccountEditDialogProps {
  account: {
    id: string;
    accountName: string;
    type: string;
    bankName: string | null;
    branchName: string | null;
  };
}

const ACCOUNT_TYPES = ["client", "general"] as const;

export function TrustAccountEditDialog({ account }: TrustAccountEditDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [accountName, setAccountName] = useState(account.accountName);
  const [accountType, setAccountType] = useState(account.type);
  const [bankName, setBankName] = useState(account.bankName ?? "");
  const [branchName, setBranchName] = useState(account.branchName ?? "");

  const { execute, isPending } = useAction(
    (input: { id: string; data: Record<string, unknown> }) =>
      updateTrustAccount(input.id, input.data),
    {
      successMessage: "Trust account updated successfully",
      onSuccess: () => {
        setOpen(false);
        router.refresh();
      },
    }
  );

  function resetForm() {
    setAccountName(account.accountName);
    setAccountType(account.type);
    setBankName(account.bankName ?? "");
    setBranchName(account.branchName ?? "");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accountName.trim()) return;

    execute({
      id: account.id,
      data: {
        accountName: accountName.trim(),
        type: accountType as "client" | "general",
        bankName: bankName.trim() || undefined,
        branchName: branchName.trim() || undefined,
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="mr-1 size-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Trust Account</DialogTitle>
          <DialogDescription>
            Update the details for this trust account. Balance cannot be edited directly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-ta-name">Account Name *</Label>
            <Input
              id="edit-ta-name"
              placeholder="e.g. John Doe Trust Account"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Account Type *</Label>
            <Select value={accountType} onValueChange={setAccountType}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {formatEnum(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-ta-bank">Bank Name</Label>
              <Input
                id="edit-ta-bank"
                placeholder="Optional"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-ta-branch">Branch Name</Label>
              <Input
                id="edit-ta-branch"
                placeholder="Optional"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
              />
            </div>
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
              disabled={isPending || !accountName.trim()}
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
