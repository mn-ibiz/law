"use client";

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

interface DocumentFormProps {
  cases: { id: string; caseNumber: string; title: string }[];
  clients: { id: string; name: string }[];
}

export function DocumentForm({ cases, clients }: DocumentFormProps) {
  const router = useRouter();

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

  async function onSubmit(data: CreateDocumentRecordInput) {
    try {
      const result = await createDocumentRecord(data);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Document record created");
      router.push("/documents");
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Create a document metadata record. File storage integration (S3) is
            not yet available — enter the file URL manually or use a placeholder.
          </p>

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

            <div className="space-y-2">
              <Label htmlFor="fileName">File Name *</Label>
              <Input
                id="fileName"
                placeholder="e.g. motion-to-dismiss.pdf"
                {...form.register("fileName")}
              />
              {form.formState.errors.fileName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.fileName.message}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="fileUrl">File URL *</Label>
              <Input
                id="fileUrl"
                placeholder="https://storage.example.com/documents/file.pdf"
                {...form.register("fileUrl")}
              />
              {form.formState.errors.fileUrl && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.fileUrl.message}
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

          <div className="flex gap-4">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? "Saving..."
                : "Create Document Record"}
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
