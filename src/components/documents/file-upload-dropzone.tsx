"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { FileTypeIcon } from "./file-type-icon";
import { formatFileSize } from "@/lib/utils/format-file-size";

type UploadState = "idle" | "previewing" | "uploading" | "done" | "error";

const CATEGORIES = [
  { value: "pleading", label: "Pleading" },
  { value: "correspondence", label: "Correspondence" },
  { value: "contract", label: "Contract" },
  { value: "evidence", label: "Evidence" },
  { value: "court_order", label: "Court Order" },
  { value: "filing", label: "Filing" },
  { value: "other", label: "Other" },
] as const;

interface FileUploadDropzoneProps {
  caseId: string;
  onUploadComplete: () => void;
}

export function FileUploadDropzone({ caseId, onUploadComplete }: FileUploadDropzoneProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("other");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setTitle(f.name.replace(/\.[^.]+$/, ""));
    setError(null);
    setState("previewing");

    if (f.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  }, []);

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

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) handleFile(selected);
    },
    [handleFile]
  );

  const reset = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setTitle("");
    setCategory("other");
    setProgress(0);
    setError(null);
    setState("idle");
    if (inputRef.current) inputRef.current.value = "";
  }, [preview]);

  const handleUpload = async () => {
    if (!file) return;
    setState("uploading");
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", file);

      setProgress(30);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      setProgress(60);

      if (!uploadRes.ok) {
        const body = await uploadRes.json();
        throw new Error(body.error ?? "Upload failed");
      }

      const { fileUrl, fileName, fileSize, mimeType } = await uploadRes.json();
      setProgress(80);

      const { createDocumentRecord } = await import("@/lib/actions/documents");
      const result = await createDocumentRecord({
        title,
        caseId,
        category,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
      });

      if (result && "error" in result && result.error) {
        throw new Error(result.error as string);
      }

      setProgress(100);
      setState("done");
      setTimeout(() => {
        reset();
        onUploadComplete();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setState("error");
    }
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      {state === "idle" && (
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
            onChange={handleInputChange}
          />
        </div>
      )}

      {/* Preview / Form */}
      {(state === "previewing" || state === "uploading" || state === "error") && file && (
        <div className="rounded-lg border p-4 space-y-4">
          <div className="flex items-start gap-3">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Preview"
                className="h-16 w-16 rounded-md object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
                <FileTypeIcon mimeType={file.type} className="h-8 w-8" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={reset} disabled={state === "uploading"}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="doc-title">Title</Label>
              <Input
                id="doc-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={state === "uploading"}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-category">Category</Label>
              <Select value={category} onValueChange={setCategory} disabled={state === "uploading"}>
                <SelectTrigger id="doc-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {state === "uploading" && (
            <Progress value={progress} className="h-2" />
          )}

          {state === "error" && error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={reset} disabled={state === "uploading"}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleUpload}
              disabled={state === "uploading" || !title.trim()}
            >
              {state === "uploading" ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      )}

      {/* Success */}
      {state === "done" && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Document uploaded successfully
        </div>
      )}
    </div>
  );
}
