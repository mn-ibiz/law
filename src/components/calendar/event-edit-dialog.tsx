"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "@/hooks/use-action";
import { updateEvent } from "@/lib/actions/calendar";
import { formatEnum } from "@/lib/utils/format-enum";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CalendarEvent } from "./calendar-types";

const EVENT_TYPES = [
  "court_hearing",
  "meeting",
  "deadline",
  "reminder",
  "consultation",
  "deposition",
  "mediation",
  "arbitration",
  "filing_deadline",
  "client_meeting",
  "internal_meeting",
  "court_mention",
  "site_visit",
  "training",
  "other",
] as const;

function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toTimeString(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function composeDatetime(date: string, time: string): string {
  if (!date) return "";
  if (!time) return `${date}T00:00`;
  return `${date}T${time}`;
}

interface EventEditDialogProps {
  event: CalendarEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventEditDialog({
  event,
  open,
  onOpenChange,
}: EventEditDialogProps) {
  const router = useRouter();

  const start = new Date(event.startTime);
  const end = new Date(event.endTime);

  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState("");
  const [type, setType] = useState(event.type);
  const [location, setLocation] = useState(event.location ?? "");
  const [allDay, setAllDay] = useState(event.allDay);
  const [isCourtDate, setIsCourtDate] = useState(event.isCourtDate);
  const [startDate, setStartDate] = useState(toDateString(start));
  const [startTime, setStartTime] = useState(toTimeString(start));
  const [endDate, setEndDate] = useState(toDateString(end));
  const [endTime, setEndTime] = useState(toTimeString(end));

  const { execute, isPending } = useAction(
    (data: { id: string; payload: Record<string, unknown> }) =>
      updateEvent(data.id, data.payload),
    {
      successMessage: "Event updated",
      onSuccess: () => {
        onOpenChange(false);
        router.refresh();
      },
    }
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const computedStartTime = allDay
      ? composeDatetime(startDate, "00:00")
      : composeDatetime(startDate, startTime);
    const computedEndTime = allDay
      ? composeDatetime(endDate || startDate, "23:59")
      : composeDatetime(endDate || startDate, endTime);

    execute({
      id: event.id,
      payload: {
        title,
        description: description || undefined,
        type,
        location: location || undefined,
        allDay,
        isCourtDate,
        startTime: computedStartTime,
        endTime: computedEndTime,
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>Update the event details below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-event-title">Title</Label>
            <Input
              id="edit-event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Event Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {formatEnum(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-event-start-date">Start Date</Label>
              <Input
                id="edit-event-start-date"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (!endDate || endDate < e.target.value) {
                    setEndDate(e.target.value);
                  }
                }}
                required
              />
            </div>

            {!allDay && (
              <div className="space-y-2">
                <Label htmlFor="edit-event-start-time">Start Time</Label>
                <Input
                  id="edit-event-start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-event-end-date">End Date</Label>
              <Input
                id="edit-event-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            {!allDay && (
              <div className="space-y-2">
                <Label htmlFor="edit-event-end-time">End Time</Label>
                <Input
                  id="edit-event-end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-event-location">Location</Label>
            <Input
              id="edit-event-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Event location (optional)"
            />
          </div>

          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="edit-event-all-day"
                checked={allDay}
                onCheckedChange={(checked) => setAllDay(checked === true)}
              />
              <Label htmlFor="edit-event-all-day" className="cursor-pointer">
                All Day Event
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="edit-event-court-date"
                checked={isCourtDate}
                onCheckedChange={(checked) => setIsCourtDate(checked === true)}
              />
              <Label htmlFor="edit-event-court-date" className="cursor-pointer">
                Court Date
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-event-description">Description</Label>
            <Textarea
              id="edit-event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Event description (optional)"
            />
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
      </DialogContent>
    </Dialog>
  );
}
