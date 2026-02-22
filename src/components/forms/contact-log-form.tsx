"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createContactLogSchema, type CreateContactLogInput } from "@/lib/validators/client";
import { addContactLog } from "@/lib/actions/clients";
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

interface ContactLogFormProps {
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactLogForm({ clientId, open, onOpenChange }: ContactLogFormProps) {
  const form = useForm<CreateContactLogInput>({
    resolver: zodResolver(createContactLogSchema),
    defaultValues: {
      type: "phone_call",
      subject: "",
      notes: "",
      contactDate: new Date().toISOString().split("T")[0],
    },
  });

  async function onSubmit(data: CreateContactLogInput) {
    const result = await addContactLog(clientId, data);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Contact log added");
    form.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Contact Log</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Contact Type *</Label>
            <Select
              value={form.watch("type")}
              onValueChange={(val) => form.setValue("type", val as CreateContactLogInput["type"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone_call">Phone Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="in_person">In Person</SelectItem>
                <SelectItem value="letter">Letter</SelectItem>
                <SelectItem value="video_call">Video Call</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input id="subject" {...form.register("subject")} />
            {form.formState.errors.subject && (
              <p className="text-sm text-destructive">{form.formState.errors.subject.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactDate">Date *</Label>
            <Input id="contactDate" type="date" {...form.register("contactDate")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} {...form.register("notes")} />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Add Log"}
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
