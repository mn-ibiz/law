"use client";

import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createDocumentRecordSchema,
  type CreateDocumentRecordInput,
} from "@/lib/validators/document";
import { createDocumentRecord } from "@/lib/actions/documents";
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
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatEnum } from "@/lib/utils/format-enum";
import { FileTypeIcon } from "@/components/documents/file-type-icon";
import { formatFileSize } from "@/lib/utils/format-file-size";
import { Upload, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const DOCUMENT_CATEGORIES = [
  "pleading",
  "correspondence",
  "contract",
  "evidence",
  "court_order",
  "filing",
  "template",
  "other",
] as const;

interface DocumentFormProps {
  cases: { id: string; caseNumber: string; title: string }[];
  clients: { id: string; name: string }[];
}

export function DocumentForm({ cases, clients }: DocumentFormProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const form = useForm<CreateDocumentRecordInput>({
    resolver: zodResolver(createDocumentRecordSchema),
    defaultValues: {
      title: "",
      caseId: undefined,
      clientId: undefined,
      category: "other",
      description: "",
      fileUrl: "",
      fileName: "",
      fileSize: undefined,
      mimeType: undefined,
    },
  });

  const handleFile = useCallback(
    (f: File) => {
      setFile(f);
      setUploadError(null);
      form.setValue("fileName", f.name);
      if (!form.getValues("title")) {
        form.setValue("title", f.name.replace(/\.[^.]+$/, ""));
      }
    },
    [form]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile]
  );

  const clearFile = useCallback(() => {
    setFile(null);
    setUploadError(null);
    form.setValue("fileUrl", "");
    form.setValue("fileName", "");
    form.setValue("fileSize", undefined);
    form.setValue("mimeType", undefined);
    if (inputRef.current) inputRef.current.value = "";
  }, [form]);

  async function onSubmit(data: CreateDocumentRecordInput) {
    try {
      // If file is selected but not yet uploaded, upload first
      if (file && !data.fileUrl) {
        setUploading(true);
        setUploadProgress(20);

        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        setUploadProgress(60);

        if (!uploadRes.ok) {
          const body = await uploadRes.json();
          throw new Error(body.error ?? "Upload failed");
        }

        const { fileUrl, fileName, fileSize, mimeType } =
          await uploadRes.json();
        setUploadProgress(80);

        data.fileUrl = fileUrl;
        data.fileName = fileName;
        data.fileSize = fileSize;
        data.mimeType = mimeType;
      }

      const result = await createDocumentRecord(data);
      setUploadProgress(100);

      if (result && "error" in result && result.error) {
        toast.error(result.error as string);
        setUploading(false);
        return;
      }

      toast.success("Document uploaded successfully");
      router.push("/documents");
      router.refresh();
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      setUploading(false);
    }
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* File Upload Area */}
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
                dragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">
                Drop a file here or click to browse
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PDF, Word, JPEG, PNG, WebP, Text — max 10MB
              </p>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.txt"
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (selected) handleFile(selected);
                }}
              />
            </div>
          ) : (
            <div className="rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                  <FileTypeIcon mimeType={file.type} className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={clearFile}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Motion to Dismiss"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Case</Label>
              <Select
                value={form.watch("caseId") ?? ""}
                onValueChange={(val) =>
                  form.setValue("caseId", val || undefined)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select case (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.caseNumber} — {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Client</Label>
              <Select
                value={form.watch("clientId") ?? ""}
                onValueChange={(val) =>
                  form.setValue("clientId", val || undefined)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client (optional)" />
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
              <Label>Category *</Label>
              <Select
                value={form.watch("category")}
                onValueChange={(val) =>
                  form.setValue(
                    "category",
                    val as CreateDocumentRecordInput["category"]
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {formatEnum(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.category.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Brief description of the document contents..."
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          {uploading && <Progress value={uploadProgress} className="h-2" />}

          {uploadError && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {uploadError}
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || uploading || !file}
            >
              {uploading ? "Uploading..." : "Upload Document"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
