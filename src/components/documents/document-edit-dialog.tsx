"use client";

import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Spinner } from "@/components/ui/spinner";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { useAction } from "@/hooks/use-action";
import { updateDocument, createDocumentVersion } from "@/lib/actions/documents";
import {
  updateDocumentSchema,
  type UpdateDocumentInput,
} from "@/lib/validators/document";
import { formatEnum } from "@/lib/utils/format-enum";

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

interface DocumentEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: {
    id: string;
    title: string;
    category: string;
    description?: string | null;
    caseId?: string | null;
    clientId?: string | null;
    versionCount?: number;
  };
  cases: { id: string; caseNumber: string; title: string }[];
  clients: { id: string; name: string }[];
}

export function DocumentEditDialog({
  open,
  onOpenChange,
  document: doc,
  cases,
  clients,
}: DocumentEditDialogProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [changeNotes, setChangeNotes] = useState("");

  const form = useForm<UpdateDocumentInput>({
    resolver: zodResolver(updateDocumentSchema),
    defaultValues: {
      id: doc.id,
      title: doc.title,
      category: doc.category as UpdateDocumentInput["category"],
      description: doc.description ?? "",
      caseId: doc.caseId ?? undefined,
      clientId: doc.clientId ?? undefined,
    },
  });

  const { execute, isPending } = useAction(
    (input: UpdateDocumentInput) => updateDocument(input),
    {
      successMessage: "Document updated successfully",
      onSuccess: () => {
        onOpenChange(false);
        router.refresh();
      },
    }
  );

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
        // Upload the file
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          toast.error(err.error ?? "Upload failed");
          return;
        }

        const uploaded = await uploadRes.json();

        // Create a document version record
        const nextVersion = (doc.versionCount ?? 0) + 1;
        const result = await createDocumentVersion({
          documentId: doc.id,
          versionNumber: nextVersion,
          fileUrl: uploaded.fileUrl,
          fileName: uploaded.fileName,
          fileSize: uploaded.fileSize,
          changeNotes: changeNotes || undefined,
        });

        if (result?.error) {
          toast.error(result.error as string);
        } else {
          toast.success(`Version ${nextVersion} uploaded successfully`);
          setChangeNotes("");
          router.refresh();
        }
      } catch {
        toast.error("Failed to upload new version");
      } finally {
        setIsUploading(false);
        // Reset file input so the same file can be re-selected
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [doc.id, doc.versionCount, changeNotes, router]
  );

  function onSubmit(data: UpdateDocumentInput) {
    execute(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Document</DialogTitle>
          <DialogDescription>
            Update the document metadata. The file itself cannot be changed here.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title *</Label>
            <Input
              id="edit-title"
              placeholder="e.g. Motion to Dismiss"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={form.watch("category")}
                onValueChange={(val) =>
                  form.setValue(
                    "category",
                    val as UpdateDocumentInput["category"]
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

            <div className="space-y-2">
              <Label>Case</Label>
              <Select
                value={form.watch("caseId") ?? "none"}
                onValueChange={(val) =>
                  form.setValue("caseId", val === "none" ? null : val)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select case (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.caseNumber} — {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Client</Label>
            <Select
              value={form.watch("clientId") ?? "none"}
              onValueChange={(val) =>
                form.setValue("clientId", val === "none" ? null : val)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select client (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>

        {/* Upload New Version Section */}
        <div className="border-t pt-4 mt-2">
          <h4 className="text-sm font-medium mb-2">Upload New Version</h4>
          <p className="text-xs text-muted-foreground mb-3">
            Replace the file by uploading a new version. The previous version will be preserved in version history.
          </p>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="version-notes" className="text-xs">
                Change Notes (optional)
              </Label>
              <Input
                id="version-notes"
                placeholder="Describe what changed..."
                value={changeNotes}
                onChange={(e) => setChangeNotes(e.target.value)}
                disabled={isUploading}
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.txt"
              onChange={handleFileUpload}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Version
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
