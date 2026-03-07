"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "@/hooks/use-action";
import { updateTimeEntry, fetchCaseOptions } from "@/lib/actions/time-expenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { TimeEntryRow } from "./time-entry-columns";

interface TimeEntryEditSheetProps {
  entry: TimeEntryRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TimeEntryEditSheet({ entry, open, onOpenChange }: TimeEntryEditSheetProps) {
  const router = useRouter();
  const [caseId, setCaseId] = useState(entry.caseId ?? "");
  const [description, setDescription] = useState(entry.description);
  const [date, setDate] = useState(
    new Date(entry.date).toISOString().split("T")[0]
  );
  const [hours, setHours] = useState(entry.hours);
  const [hourlyRate, setHourlyRate] = useState(entry.rate ?? "0");
  const [isBillable, setIsBillable] = useState(entry.isBillable);
  const [cases, setCases] = useState<{ id: string; caseNumber: string; title: string }[]>([]);

  useEffect(() => {
    if (open) {
      fetchCaseOptions().then(setCases);
      // Reset form to current entry values when sheet opens
      setCaseId(entry.caseId ?? "");
      setDescription(entry.description);
      setDate(new Date(entry.date).toISOString().split("T")[0]);
      setHours(entry.hours);
      setHourlyRate(entry.rate ?? "0");
      setIsBillable(entry.isBillable);
    }
  }, [open, entry]);

  const { execute, isPending } = useAction(updateTimeEntry, {
    successMessage: "Time entry updated",
    onSuccess: () => {
      onOpenChange(false);
      router.refresh();
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    execute({
      id: entry.id,
      caseId,
      description,
      date,
      hours: Number(hours),
      hourlyRate: Number(hourlyRate) || undefined,
      isBillable,
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Time Entry</SheetTitle>
          <SheetDescription>Update the time entry details below.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 px-4">
          <div className="space-y-2">
            <Label>Case</Label>
            <Select value={caseId} onValueChange={setCaseId}>
              <SelectTrigger className="w-full">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-te-date">Date</Label>
            <Input
              id="edit-te-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-te-hours">Hours</Label>
            <Input
              id="edit-te-hours"
              type="number"
              step="0.1"
              min="0.1"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-te-rate">Hourly Rate (KES)</Label>
            <Input
              id="edit-te-rate"
              type="number"
              step="100"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-te-description">Description</Label>
            <Textarea
              id="edit-te-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="edit-te-billable"
              checked={isBillable}
              onCheckedChange={(val) => setIsBillable(val === true)}
            />
            <Label htmlFor="edit-te-billable">Billable</Label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
