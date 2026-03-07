"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateCourtSchema, type UpdateCourtInput } from "@/lib/validators/court";
import { updateCourt, toggleCourtActive } from "@/lib/actions/courts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface CourtEditDialogProps {
  court: {
    id: string;
    name: string;
    level: string;
    jurisdiction: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    isActive: boolean;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const courtLevels = [
  { value: "supreme", label: "Supreme Court" },
  { value: "appellate", label: "Court of Appeal" },
  { value: "high", label: "High Court" },
  { value: "elc", label: "Environment & Land Court" },
  { value: "elrc", label: "Employment & Labour Relations Court" },
  { value: "magistrate", label: "Magistrate Court" },
  { value: "tribunal", label: "Tribunal" },
  { value: "kadhi", label: "Kadhi Court" },
  { value: "court_martial", label: "Court Martial" },
];

export function CourtEditDialog({ court, open, onOpenChange }: CourtEditDialogProps) {
  const router = useRouter();
  const [toggling, setToggling] = useState(false);

  const form = useForm<UpdateCourtInput>({
    resolver: zodResolver(updateCourtSchema),
    defaultValues: {
      name: court.name,
      level: court.level,
      jurisdiction: court.jurisdiction ?? "",
      address: court.address ?? "",
      phone: court.phone ?? "",
      email: court.email ?? "",
    },
  });

  async function onSubmit(data: UpdateCourtInput) {
    try {
      const result = await updateCourt(court.id, data);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Court updated");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  async function handleToggleActive() {
    setToggling(true);
    try {
      const result = await toggleCourtActive(court.id);

      if (result && "error" in result && result.error) {
        toast.error(result.error as string);
      } else {
        toast.success(court.isActive ? "Court deactivated" : "Court activated");
        onOpenChange(false);
        router.refresh();
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setToggling(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Court</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="courtName">Court Name *</Label>
            <Input
              id="courtName"
              {...form.register("name")}
              placeholder="e.g. Milimani Law Courts"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Level *</Label>
            <Select
              value={form.watch("level")}
              onValueChange={(val) => form.setValue("level", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select court level" />
              </SelectTrigger>
              <SelectContent>
                {courtLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.level && (
              <p className="text-sm text-destructive">
                {form.formState.errors.level.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="jurisdiction">Jurisdiction</Label>
            <Input
              id="jurisdiction"
              {...form.register("jurisdiction")}
              placeholder="e.g. Nairobi"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="courtAddress">Address</Label>
            <Input
              id="courtAddress"
              {...form.register("address")}
              placeholder="Physical address"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="courtPhone">Phone</Label>
              <Input
                id="courtPhone"
                {...form.register("phone")}
                placeholder="+254..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="courtEmail">Email</Label>
              <Input
                id="courtEmail"
                type="email"
                {...form.register("email")}
                placeholder="court@example.com"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant={court.isActive ? "destructive" : "outline"}
              size="sm"
              onClick={handleToggleActive}
              disabled={toggling}
            >
              {toggling
                ? "Processing..."
                : court.isActive
                  ? "Deactivate Court"
                  : "Activate Court"}
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
