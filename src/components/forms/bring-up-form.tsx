"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createBringUpSchema, type CreateBringUpInput } from "@/lib/validators/court";
import { createBringUp } from "@/lib/actions/courts";
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

interface BringUpFormProps {
  cases: { id: string; caseNumber: string; title: string }[];
  users: { id: string; name: string }[];
}

export function BringUpForm({ cases, users }: BringUpFormProps) {
  const router = useRouter();

  const form = useForm<CreateBringUpInput>({
    resolver: zodResolver(createBringUpSchema),
    defaultValues: {
      caseId: "",
      assignedTo: "",
      date: "",
      reason: "",
      notes: "",
    },
  });

  async function onSubmit(data: CreateBringUpInput) {
    try {
      const result = await createBringUp(data);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Bring-up created");
      router.push("/bring-ups");
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <Card className="shadow-sm rounded-xl">
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
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
                      {c.caseNumber} — {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.caseId && (
                <p className="text-sm text-destructive">{form.formState.errors.caseId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Assigned To</Label>
              <Select
                value={form.watch("assignedTo") ?? ""}
                onValueChange={(val) => form.setValue("assignedTo", val === "__none__" ? "" : val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Unassigned</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" {...form.register("date")} />
              {form.formState.errors.date && (
                <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea id="reason" rows={3} {...form.register("reason")} />
            {form.formState.errors.reason && (
              <p className="text-sm text-destructive">{form.formState.errors.reason.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={2} {...form.register("notes")} />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating..." : "Create Bring-Up"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
