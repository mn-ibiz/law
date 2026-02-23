"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createFilingSchema, type CreateFilingInput } from "@/lib/validators/court";
import { createCourtFiling } from "@/lib/actions/courts";
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

interface FilingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function FilingForm({ open, onOpenChange, cases, courts }: FilingFormProps) {
  const router = useRouter();

  const form = useForm<CreateFilingInput>({
    resolver: zodResolver(createFilingSchema),
    defaultValues: {
      caseId: "",
      courtId: undefined,
      filingType: "",
      filingNumber: "",
      filingDate: "",
      notes: "",
    },
  });

  async function onSubmit(data: CreateFilingInput) {
    try {
      const result = await createCourtFiling(data);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Filing recorded");
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
          <DialogTitle>Record Court Filing</DialogTitle>
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
            <Label>Court</Label>
            <Select
              value={form.watch("courtId") ?? ""}
              onValueChange={(val) => form.setValue("courtId", val || undefined)}
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
              <p className="text-sm text-destructive">{form.formState.errors.filingType.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="filingNumber">Filing Number</Label>
              <Input id="filingNumber" {...form.register("filingNumber")} placeholder="e.g. E001/2026" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filingDate">Filing Date</Label>
              <Input id="filingDate" type="date" {...form.register("filingDate")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filingNotes">Notes</Label>
            <Textarea id="filingNotes" rows={3} {...form.register("notes")} placeholder="Additional notes (optional)" />
          </div>

          <div className="flex gap-4 pt-2">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Record Filing"}
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
