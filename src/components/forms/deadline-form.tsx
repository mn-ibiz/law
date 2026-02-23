"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createDeadlineSchema, type CreateDeadlineInput } from "@/lib/validators/calendar";
import { createDeadline } from "@/lib/actions/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface DeadlineFormProps {
  cases: { id: string; caseNumber: string; title: string }[];
  users: { id: string; name: string }[];
}

export function DeadlineForm({ cases, users }: DeadlineFormProps) {
  const router = useRouter();

  const form = useForm<CreateDeadlineInput>({
    resolver: zodResolver(createDeadlineSchema),
    defaultValues: {
      title: "",
      description: "",
      caseId: "",
      assignedTo: "",
      priority: "medium",
      dueDate: "",
      isStatutory: false,
    },
  });

  async function onSubmit(data: CreateDeadlineInput) {
    try {
      const result = await createDeadline(data);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Deadline created");
      router.push("/deadlines");
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
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" {...form.register("title")} />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Case</Label>
              <Select
                value={form.watch("caseId") ?? ""}
                onValueChange={(val) => form.setValue("caseId", val === "__none__" ? "" : val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select case (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.caseNumber} — {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label>Priority *</Label>
              <Select
                value={form.watch("priority")}
                onValueChange={(val) => form.setValue("priority", val as CreateDeadlineInput["priority"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input id="dueDate" type="date" {...form.register("dueDate")} />
              {form.formState.errors.dueDate && (
                <p className="text-sm text-destructive">{form.formState.errors.dueDate.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2 md:col-span-2">
              <Checkbox
                id="isStatutory"
                checked={form.watch("isStatutory")}
                onCheckedChange={(checked) => form.setValue("isStatutory", checked === true)}
              />
              <Label htmlFor="isStatutory" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Statutory Deadline
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...form.register("description")} />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating..." : "Create Deadline"}
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
