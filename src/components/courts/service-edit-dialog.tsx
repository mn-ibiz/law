"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createServiceOfDocumentSchema, type CreateServiceOfDocumentInput } from "@/lib/validators/court";
import { updateServiceOfDocument } from "@/lib/actions/courts";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatEnum } from "@/lib/utils/format-enum";
import { Upload } from "lucide-react";

interface ServiceRecord {
  id: string;
  caseId: string;
  documentTitle: string;
  servedTo: string;
  method: string;
  serviceDate: Date | null;
  proofOfServiceUrl: string | null;
  notes: string | null;
}

interface ServiceEditDialogProps {
  record: ServiceRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cases: { id: string; caseNumber: string; title: string }[];
}

const serviceMethods = [
  "personal",
  "substituted",
  "email",
  "registered_mail",
  "court_process_server",
  "other",
] as const;

export function ServiceEditDialog({ record, open, onOpenChange, cases }: ServiceEditDialogProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [proofUrl, setProofUrl] = useState(record.proofOfServiceUrl ?? "");

  const form = useForm<CreateServiceOfDocumentInput>({
    resolver: zodResolver(createServiceOfDocumentSchema),
    defaultValues: {
      caseId: record.caseId,
      documentTitle: record.documentTitle,
      servedTo: record.servedTo,
      method: record.method as CreateServiceOfDocumentInput["method"],
      serviceDate: record.serviceDate
        ? new Date(record.serviceDate).toISOString().split("T")[0]
        : "",
      proofOfServiceUrl: record.proofOfServiceUrl ?? "",
      notes: record.notes ?? "",
    },
  });

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
      setProofUrl(json.fileUrl);
      form.setValue("proofOfServiceUrl", json.fileUrl);
      toast.success("File uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(data: CreateServiceOfDocumentInput) {
    try {
      const submitData = { ...data, proofOfServiceUrl: proofUrl || data.proofOfServiceUrl };
      const result = await updateServiceOfDocument(record.id, submitData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Service record updated");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Service Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Case *</Label>
            <Select
              value={form.watch("caseId")}
              onValueChange={(val) => form.setValue("caseId", val)}
            >
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
            <Label htmlFor="edit-documentTitle">Document Title *</Label>
            <Input id="edit-documentTitle" {...form.register("documentTitle")} />
            {form.formState.errors.documentTitle && (
              <p className="text-sm text-destructive">{form.formState.errors.documentTitle.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-servedTo">Party Served *</Label>
            <Input id="edit-servedTo" {...form.register("servedTo")} />
            {form.formState.errors.servedTo && (
              <p className="text-sm text-destructive">{form.formState.errors.servedTo.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Service Method *</Label>
              <Select
                value={form.watch("method")}
                onValueChange={(val) => form.setValue("method", val as CreateServiceOfDocumentInput["method"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {serviceMethods.map((m) => (
                    <SelectItem key={m} value={m}>
                      {formatEnum(m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-serviceDate">Date Served</Label>
              <Input id="edit-serviceDate" type="date" {...form.register("serviceDate")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Proof of Service</Label>
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
            {proofUrl && (
              <a href={proofUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                <Upload className="h-3 w-3" />
                Current file
              </a>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-serviceNotes">Notes</Label>
            <Textarea id="edit-serviceNotes" rows={3} {...form.register("notes")} />
          </div>

          <div className="flex gap-4 pt-2">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
