"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateCourtRuleSchema, type UpdateCourtRuleInput } from "@/lib/validators/court";
import { updateCourtRule } from "@/lib/actions/courts";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CourtRuleEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: {
    id: string;
    courtId: string | null;
    name: string;
    description: string | null;
    triggerEvent: string;
    offsetDays: number;
    deadlineTitle: string;
    priority: string;
    isStatutory: boolean;
  };
  courts: { id: string; name: string }[];
}

export function CourtRuleEditDialog({
  open,
  onOpenChange,
  rule,
  courts,
}: CourtRuleEditDialogProps) {
  const router = useRouter();

  const form = useForm<UpdateCourtRuleInput>({
    resolver: zodResolver(updateCourtRuleSchema),
    defaultValues: {
      courtId: rule.courtId ?? undefined,
      name: rule.name,
      description: rule.description ?? "",
      triggerEvent: rule.triggerEvent as "hearing_date" | "filing_date",
      offsetDays: rule.offsetDays,
      deadlineTitle: rule.deadlineTitle,
      priority: rule.priority as "low" | "medium" | "high" | "critical",
      isStatutory: rule.isStatutory,
    },
  });

  async function onSubmit(data: UpdateCourtRuleInput) {
    try {
      const result = await updateCourtRule(rule.id, data);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Court rule updated");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Court Rule</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editRuleName">Rule Name *</Label>
            <Input
              id="editRuleName"
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
            <Label htmlFor="editRuleDescription">Description</Label>
            <Textarea
              id="editRuleDescription"
              rows={2}
              {...form.register("description")}
              placeholder="Optional description of the rule"
            />
          </div>

          <div className="space-y-2">
            <Label>Court (optional)</Label>
            <Select
              value={form.watch("courtId") ?? "__all__"}
              onValueChange={(val) =>
                form.setValue("courtId", val === "__all__" ? undefined : val)
              }
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
                value={form.watch("triggerEvent")}
                onValueChange={(val) =>
                  form.setValue("triggerEvent", val as "hearing_date" | "filing_date")
                }
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
              <Label htmlFor="editOffsetDays">Offset Days *</Label>
              <Input
                id="editOffsetDays"
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
            <Label htmlFor="editDeadlineTitle">Deadline Title *</Label>
            <Input
              id="editDeadlineTitle"
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
                value={form.watch("priority")}
                onValueChange={(val) =>
                  form.setValue("priority", val as "low" | "medium" | "high" | "critical")
                }
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
                id="editIsStatutory"
                checked={form.watch("isStatutory")}
                onCheckedChange={(checked) =>
                  form.setValue("isStatutory", checked === true)
                }
              />
              <Label htmlFor="editIsStatutory" className="cursor-pointer">
                Statutory deadline
              </Label>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
