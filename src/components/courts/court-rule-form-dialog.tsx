"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createCourtRuleSchema, type CreateCourtRuleInput } from "@/lib/validators/court";
import { createCourtRule } from "@/lib/actions/courts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

interface CourtRuleFormDialogProps {
  courts: { id: string; name: string }[];
}

export function CourtRuleFormDialog({ courts }: CourtRuleFormDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<CreateCourtRuleInput>({
    resolver: zodResolver(createCourtRuleSchema),
    defaultValues: {
      courtId: undefined,
      name: "",
      description: "",
      triggerEvent: "hearing_date",
      offsetDays: -7,
      deadlineTitle: "",
      priority: "high",
      isStatutory: true,
    },
  });

  async function onSubmit(data: CreateCourtRuleInput) {
    try {
      const result = await createCourtRule(data);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Court rule created");
      form.reset();
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Rule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Court Rule</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ruleName">Rule Name *</Label>
            <Input
              id="ruleName"
              {...form.register("name")}
              placeholder="e.g. Pre-hearing preparation deadline"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ruleDescription">Description</Label>
            <Textarea
              id="ruleDescription"
              rows={2}
              {...form.register("description")}
              placeholder="Optional description of the rule"
            />
          </div>

          <div className="space-y-2">
            <Label>Court (optional)</Label>
            <Select
              onValueChange={(val) =>
                form.setValue("courtId", val === "__all__" ? undefined : val)
              }
              defaultValue="__all__"
            >
              <SelectTrigger>
                <SelectValue placeholder="All courts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All courts (general rule)</SelectItem>
                {courts.map((court) => (
                  <SelectItem key={court.id} value={court.id}>
                    {court.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Trigger Event *</Label>
              <Select
                onValueChange={(val) =>
                  form.setValue("triggerEvent", val as "hearing_date" | "filing_date")
                }
                defaultValue="hearing_date"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hearing_date">Hearing Date</SelectItem>
                  <SelectItem value="filing_date">Filing Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="offsetDays">Offset Days *</Label>
              <Input
                id="offsetDays"
                type="number"
                {...form.register("offsetDays", { valueAsNumber: true })}
                placeholder="e.g. -7 (7 days before)"
              />
              <p className="text-xs text-muted-foreground">
                Negative = before trigger, positive = after
              </p>
              {form.formState.errors.offsetDays && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.offsetDays.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadlineTitle">Deadline Title *</Label>
            <Input
              id="deadlineTitle"
              {...form.register("deadlineTitle")}
              placeholder="e.g. File witness statements"
            />
            {form.formState.errors.deadlineTitle && (
              <p className="text-sm text-destructive">
                {form.formState.errors.deadlineTitle.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Priority *</Label>
              <Select
                onValueChange={(val) =>
                  form.setValue("priority", val as "low" | "medium" | "high" | "critical")
                }
                defaultValue="high"
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

            <div className="flex items-center gap-2 pt-6">
              <Checkbox
                id="isStatutory"
                defaultChecked={true}
                onCheckedChange={(checked) =>
                  form.setValue("isStatutory", checked === true)
                }
              />
              <Label htmlFor="isStatutory" className="cursor-pointer">
                Statutory deadline
              </Label>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating..." : "Create Rule"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
