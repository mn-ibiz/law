"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createServiceOfDocumentSchema, type CreateServiceOfDocumentInput } from "@/lib/validators/court";
import { createServiceOfDocument } from "@/lib/actions/courts";
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

interface ServiceFormProps {
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

export function ServiceForm({ open, onOpenChange, cases }: ServiceFormProps) {
  const router = useRouter();

  const form = useForm<CreateServiceOfDocumentInput>({
    resolver: zodResolver(createServiceOfDocumentSchema),
    defaultValues: {
      caseId: "",
      documentTitle: "",
      servedTo: "",
      method: "personal",
      serviceDate: "",
      notes: "",
    },
  });

  async function onSubmit(data: CreateServiceOfDocumentInput) {
    try {
      const result = await createServiceOfDocument(data);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Service of process recorded");
      form.reset();
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
          <DialogTitle>Record Service of Process</DialogTitle>
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
              <p className="text-sm text-destructive">{form.formState.errors.caseId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentTitle">Document Title *</Label>
            <Input id="documentTitle" {...form.register("documentTitle")} placeholder="e.g. Plaint, Summons to Enter Appearance" />
            {form.formState.errors.documentTitle && (
              <p className="text-sm text-destructive">{form.formState.errors.documentTitle.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="servedTo">Party Served *</Label>
            <Input id="servedTo" {...form.register("servedTo")} placeholder="Name of party served" />
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
              {form.formState.errors.method && (
                <p className="text-sm text-destructive">{form.formState.errors.method.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceDate">Date Served</Label>
              <Input id="serviceDate" type="date" {...form.register("serviceDate")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceNotes">Notes</Label>
            <Textarea id="serviceNotes" rows={3} {...form.register("notes")} placeholder="Additional notes (optional)" />
          </div>

          <div className="flex gap-4 pt-2">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Record Service"}
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
