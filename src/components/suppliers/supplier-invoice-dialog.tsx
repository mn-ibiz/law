"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createSupplierInvoiceSchema,
  type CreateSupplierInvoiceInput,
} from "@/lib/validators/supplier";
import { createSupplierInvoice } from "@/lib/actions/suppliers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Upload } from "lucide-react";
import { useOrgConfig } from "@/components/providers/tenant-config-provider";

interface SupplierInvoiceDialogProps {
  supplierId: string;
}

export function SupplierInvoiceDialog({ supplierId }: SupplierInvoiceDialogProps) {
  const { currency } = useOrgConfig();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const router = useRouter();

  const form = useForm<CreateSupplierInvoiceInput>({
    resolver: zodResolver(createSupplierInvoiceSchema),
    defaultValues: {
      supplierId,
      invoiceNumber: "",
      amount: 0,
      vatAmount: 0,
      totalAmount: 0,
      description: "",
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: "",
    },
  });

  // Auto-calculate total
  const amount = form.watch("amount");
  const vatAmount = form.watch("vatAmount");

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Upload failed");
        return;
      }
      setFileUrl(json.fileUrl);
      toast.success("File uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(data: CreateSupplierInvoiceInput) {
    try {
      // Server computes totalAmount, but we pass it for validation
      const submitData = {
        ...data,
        totalAmount: (data.amount || 0) + (data.vatAmount || 0),
        fileUrl: fileUrl || undefined,
      };
      const result = await createSupplierInvoice(submitData);
      if (result && "error" in result && result.error) {
        toast.error(result.error as string);
        return;
      }

      toast.success("Invoice created");
      setOpen(false);
      setFileUrl("");
      form.reset({ ...form.getValues(), supplierId });
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          New Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Supplier Invoice</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inv-number">Invoice Number *</Label>
            <Input id="inv-number" {...form.register("invoiceNumber")} placeholder="e.g. INV-001" />
            {form.formState.errors.invoiceNumber && (
              <p className="text-sm text-destructive">{form.formState.errors.invoiceNumber.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="inv-amount">{`Amount (${currency}) *`}</Label>
              <Input
                id="inv-amount"
                type="number"
                step="0.01"
                min="0.01"
                {...form.register("amount", { valueAsNumber: true })}
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-vat">VAT</Label>
              <Input
                id="inv-vat"
                type="number"
                step="0.01"
                min="0"
                {...form.register("vatAmount", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>Total</Label>
              <Input
                readOnly
                value={((amount || 0) + (vatAmount || 0)).toFixed(2)}
                className="bg-muted"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="inv-date">Invoice Date *</Label>
              <Input id="inv-date" type="date" {...form.register("invoiceDate")} />
              {form.formState.errors.invoiceDate && (
                <p className="text-sm text-destructive">{form.formState.errors.invoiceDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-due">Due Date</Label>
              <Input id="inv-due" type="date" {...form.register("dueDate")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inv-desc">Description</Label>
            <Textarea id="inv-desc" rows={2} {...form.register("description")} placeholder="Brief description..." />
          </div>

          <div className="space-y-2">
            <Label>Invoice File (optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                onChange={handleFileUpload}
                disabled={uploading}
                className="flex-1"
              />
              {uploading && <span className="text-xs text-muted-foreground">Uploading...</span>}
            </div>
            {fileUrl && (
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                <Upload className="h-3 w-3" />
                Uploaded file
              </a>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting || uploading}>
              {form.formState.isSubmitting ? "Saving..." : "Create Invoice"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
