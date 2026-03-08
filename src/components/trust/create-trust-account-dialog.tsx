"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "@/hooks/use-action";
import { createTrustAccount } from "@/lib/actions/trust";
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
import { Plus } from "lucide-react";
import { useOrgConfig } from "@/components/providers/tenant-config-provider";

interface CreateTrustAccountDialogProps {
  clients: { id: string; name: string }[];
  cases: { id: string; caseNumber: string; title: string }[];
}

const ACCOUNT_TYPES = ["client", "general"] as const;

export function CreateTrustAccountDialog({
  clients,
  cases,
}: CreateTrustAccountDialogProps) {
  const { currency } = useOrgConfig();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [clientId, setClientId] = useState("");
  const [caseId, setCaseId] = useState("");
  const [accountType, setAccountType] = useState<string>("client");
  const [initialBalance, setInitialBalance] = useState("");
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");

  const { execute, isPending } = useAction(createTrustAccount, {
    successMessage: "Trust account created successfully",
    onSuccess: () => {
      setOpen(false);
      resetForm();
      router.refresh();
    },
  });

  function resetForm() {
    setAccountName("");
    setClientId("");
    setCaseId("");
    setAccountType("client");
    setInitialBalance("");
    setBankName("");
    setBranchName("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accountName.trim() || !clientId) return;

    execute({
      accountName: accountName.trim(),
      clientId,
      caseId: caseId || undefined,
      accountType: accountType as "client" | "general",
      initialBalance: parseFloat(initialBalance) || 0,
      bankName: bankName.trim() || undefined,
      branchName: branchName.trim() || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1 size-4" />
          New Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Trust Account</DialogTitle>
          <DialogDescription>
            Set up a new trust account for a client.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ta-name">Account Name *</Label>
            <Input
              id="ta-name"
              placeholder="e.g. John Doe Trust Account"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Client *</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Case (optional)</Label>
              <Select value={caseId} onValueChange={setCaseId}>
                <SelectTrigger className="w-full">
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
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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

            <div className="space-y-2">
              <Label htmlFor="ta-balance">{`Initial Balance (${currency})`}</Label>
              <Input
                id="ta-balance"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ta-bank">Bank Name</Label>
              <Input
                id="ta-bank"
                placeholder="Optional"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ta-branch">Branch Name</Label>
              <Input
                id="ta-branch"
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
              disabled={isPending || !accountName.trim() || !clientId}
            >
              {isPending ? "Creating..." : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
