"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil } from "lucide-react";
import { createPlan, updatePlan } from "@/lib/actions/admin";

interface PlanData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  maxUsers: number | null;
  maxCases: number | null;
  maxStorageMb: number | null;
  monthlyPrice: string | null;
  annualPrice: string | null;
  trialDays: number;
  isActive: boolean;
}

interface PlanEditorProps {
  mode: "create" | "edit";
  plan?: PlanData;
}

export function PlanEditor({ mode, plan }: PlanEditorProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isActive, setIsActive] = useState(plan?.isActive ?? true);
  const router = useRouter();

  const handleOpenChange = useCallback((v: boolean) => {
    setOpen(v);
    if (v) setIsActive(plan?.isActive ?? true); // Reset on open
  }, [plan?.isActive]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name") as string,
      slug: form.get("slug") as string,
      description: (form.get("description") as string) || undefined,
      maxUsers: form.get("maxUsers") ? parseInt(form.get("maxUsers") as string, 10) : null,
      maxCases: form.get("maxCases") ? parseInt(form.get("maxCases") as string, 10) : null,
      maxStorageMb: form.get("maxStorageMb") ? parseInt(form.get("maxStorageMb") as string, 10) : null,
      monthlyPrice: (form.get("monthlyPrice") as string) || undefined,
      annualPrice: (form.get("annualPrice") as string) || undefined,
      trialDays: parseInt(form.get("trialDays") as string, 10) || 14,
      isActive,
    };

    try {
      const result =
        mode === "create"
          ? await createPlan(data)
          : await updatePlan(plan!.id, data);

      if ("error" in result && result.error) {
        toast.error(result.error);
      } else {
        toast.success(mode === "create" ? "Plan created" : "Plan updated");
        setOpen(false);
        router.refresh();
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" /> New Plan
          </Button>
        ) : (
          <Button variant="ghost" size="sm">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Plan" : "Edit Plan"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plan-name">Name *</Label>
            <Input id="plan-name" name="name" defaultValue={plan?.name ?? ""} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan-slug">Slug *</Label>
            <Input
              id="plan-slug"
              name="slug"
              defaultValue={plan?.slug ?? ""}
              required
              disabled={mode === "edit"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan-desc">Description</Label>
            <Textarea id="plan-desc" name="description" rows={2} defaultValue={plan?.description ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="plan-monthly">Monthly Price</Label>
              <Input id="plan-monthly" name="monthlyPrice" type="number" step="0.01" defaultValue={plan?.monthlyPrice ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-annual">Annual Price</Label>
              <Input id="plan-annual" name="annualPrice" type="number" step="0.01" defaultValue={plan?.annualPrice ?? ""} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="plan-users">Max Users</Label>
              <Input id="plan-users" name="maxUsers" type="number" placeholder="Unlimited" defaultValue={plan?.maxUsers ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-cases">Max Cases</Label>
              <Input id="plan-cases" name="maxCases" type="number" placeholder="Unlimited" defaultValue={plan?.maxCases ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-storage">Storage (MB)</Label>
              <Input id="plan-storage" name="maxStorageMb" type="number" placeholder="Unlimited" defaultValue={plan?.maxStorageMb ?? ""} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan-trial">Trial Days</Label>
            <Input id="plan-trial" name="trialDays" type="number" defaultValue={plan?.trialDays ?? 14} />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <Label>Active</Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : mode === "create" ? "Create" : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
