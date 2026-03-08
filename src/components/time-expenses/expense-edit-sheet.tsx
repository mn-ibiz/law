"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "@/hooks/use-action";
import { updateExpense, fetchCaseOptions } from "@/lib/actions/time-expenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatEnum } from "@/lib/utils/format-enum";
import { Upload, X, FileText } from "lucide-react";
import { toast } from "sonner";
import { useOrgConfig } from "@/components/providers/tenant-config-provider";
import type { ExpenseRow } from "./expense-columns";

const EXPENSE_CATEGORIES = [
  "filing_fee",
  "travel",
  "courier",
  "printing",
  "expert_fee",
  "court_fee",
  "other",
] as const;

interface ExpenseEditSheetProps {
  expense: ExpenseRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExpenseEditSheet({ expense, open, onOpenChange }: ExpenseEditSheetProps) {
  const { currency } = useOrgConfig();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [caseId, setCaseId] = useState(expense.caseId ?? "");
  const [category, setCategory] = useState(expense.category);
  const [description, setDescription] = useState(expense.description);
  const [amount, setAmount] = useState(expense.amount);
  const [date, setDate] = useState(
    new Date(expense.date).toISOString().split("T")[0]
  );
  const [isBillable, setIsBillable] = useState(expense.isBillable);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(expense.receiptUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [cases, setCases] = useState<{ id: string; caseNumber: string; title: string }[]>([]);

  useEffect(() => {
    if (open) {
      fetchCaseOptions().then(setCases);
      setCaseId(expense.caseId ?? "");
      setCategory(expense.category);
      setDescription(expense.description);
      setAmount(expense.amount);
      setDate(new Date(expense.date).toISOString().split("T")[0]);
      setIsBillable(expense.isBillable);
      setReceiptUrl(expense.receiptUrl);
    }
  }, [open, expense]);

  const { execute, isPending } = useAction(updateExpense, {
    successMessage: "Expense updated",
    onSuccess: () => {
      onOpenChange(false);
      router.refresh();
    },
  });

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Upload failed");
        return;
      }
      setReceiptUrl(data.fileUrl);
      toast.success("Receipt uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    execute({
      id: expense.id,
      caseId,
      category: category as (typeof EXPENSE_CATEGORIES)[number],
      description,
      amount: Number(amount),
      date,
      isBillable,
      receiptUrl,
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Expense</SheetTitle>
          <SheetDescription>Update the expense details below.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 px-4">
          <div className="space-y-2">
            <Label>Case</Label>
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

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {formatEnum(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-exp-amount">{`Amount (${currency})`}</Label>
            <Input
              id="edit-exp-amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-exp-date">Date</Label>
            <Input
              id="edit-exp-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-exp-description">Description</Label>
            <Textarea
              id="edit-exp-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Receipt</Label>
            {receiptUrl ? (
              <div className="flex items-center gap-2 rounded-md border p-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <a
                  href={receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 truncate text-primary underline"
                >
                  View receipt
                </a>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setReceiptUrl(null)}
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="sr-only">Remove receipt</span>
                </Button>
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="edit-exp-receipt"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-3.5 w-3.5" />
                  {isUploading ? "Uploading..." : "Upload Receipt"}
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="edit-exp-billable"
              checked={isBillable}
              onCheckedChange={(val) => setIsBillable(val === true)}
            />
            <Label htmlFor="edit-exp-billable">Billable</Label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" size="sm" disabled={isPending || isUploading}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
