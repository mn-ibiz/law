"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateFilingSchema, type UpdateFilingInput } from "@/lib/validators/court";
import { updateCourtFiling } from "@/lib/actions/courts";
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
import { Upload, FileText, X } from "lucide-react";

interface FilingEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filing: {
    id: string;
    caseId: string;
    courtId: string | null;
    filingType: string;
    filingNumber: string | null;
    filingDate: Date | null;
    documentUrl: string | null;
    notes: string | null;
    status: string;
  };
  cases: { id: string; caseNumber: string; title: string }[];
  courts: { id: string; name: string }[];
}

const filingTypes = [
  "Plaint",
  "Defence",
  "Reply to Defence",
  "Application",
  "Affidavit",
  "Memorandum of Appeal",
  "Petition",
  "Written Submissions",
  "Notice of Motion",
  "Certificate of Urgency",
  "Other",
];

export function FilingEditDialog({
  open,
  onOpenChange,
  filing,
  cases,
  courts,
}: FilingEditDialogProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(filing.documentUrl);

  const form = useForm<UpdateFilingInput>({
    resolver: zodResolver(updateFilingSchema),
    defaultValues: {
      caseId: filing.caseId,
      courtId: filing.courtId ?? undefined,
      filingType: filing.filingType,
      filingNumber: filing.filingNumber ?? "",
      filingDate: filing.filingDate
        ? new Date(filing.filingDate).toISOString().split("T")[0]
        : "",
      documentUrl: filing.documentUrl ?? "",
      notes: filing.notes ?? "",
      status: filing.status as UpdateFilingInput["status"],
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
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error ?? "Upload failed");
        return;
      }

      setUploadedUrl(result.fileUrl);
      form.setValue("documentUrl", result.fileUrl);
      toast.success("File uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function onSubmit(data: UpdateFilingInput) {
    try {
      const result = await updateCourtFiling(filing.id, data);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Filing updated");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Court Filing</DialogTitle>
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
            {form.formState.errors.caseId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.caseId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Court</Label>
            <Select
              value={form.watch("courtId") ?? ""}
              onValueChange={(val) =>
                form.setValue("courtId", val || undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select court (optional)" />
              </SelectTrigger>
              <SelectContent>
                {courts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Filing Type *</Label>
            <Select
              value={form.watch("filingType")}
              onValueChange={(val) => form.setValue("filingType", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select filing type" />
              </SelectTrigger>
              <SelectContent>
                {filingTypes.map((ft) => (
                  <SelectItem key={ft} value={ft}>
                    {ft}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.filingType && (
              <p className="text-sm text-destructive">
                {form.formState.errors.filingType.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Status *</Label>
            <Select
              value={form.watch("status")}
              onValueChange={(val) =>
                form.setValue("status", val as UpdateFilingInput["status"])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="filed">Filed</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="served">Served</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="editFilingNumber">Filing Number</Label>
              <Input
                id="editFilingNumber"
                {...form.register("filingNumber")}
                placeholder="e.g. E001/2026"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editFilingDate">Filing Date</Label>
              <Input
                id="editFilingDate"
                type="date"
                {...form.register("filingDate")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Document</Label>
            {uploadedUrl ? (
              <div className="flex items-center gap-2 rounded-md border p-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <a
                  href={uploadedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 truncate text-primary hover:underline"
                >
                  {uploadedUrl.split("/").pop()}
                </a>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => {
                    setUploadedUrl(null);
                    form.setValue("documentUrl", "");
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  {uploading ? "Uploading..." : "Upload Document"}
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="editFilingNotes">Notes</Label>
            <Textarea
              id="editFilingNotes"
              rows={3}
              {...form.register("notes")}
              placeholder="Additional notes (optional)"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
