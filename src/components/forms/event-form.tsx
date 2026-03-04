"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createEventSchema, type CreateEventInput } from "@/lib/validators/calendar";
import { createEvent } from "@/lib/actions/calendar";
import { formatEnum } from "@/lib/utils/format-enum";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface EventFormProps {
  cases: { id: string; caseNumber: string; title: string }[];
}

function getTodayDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addOneHour(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const newH = (h + 1) % 24;
  return `${String(newH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function EventForm({ cases }: EventFormProps) {
  const router = useRouter();
  const [caseOpen, setCaseOpen] = useState(false);

  const todayStr = getTodayDate();

  const form = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "meeting",
      caseId: undefined,
      location: "",
      startTime: "",
      endTime: "",
      allDay: false,
      isCourtDate: false,
    },
  });

  // Split date/time state managed separately, then composed into startTime/endTime
  const [startDate, setStartDate] = useState(todayStr);
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState(todayStr);
  const [endTime, setEndTime] = useState("");

  const allDay = form.watch("allDay");
  const selectedCaseId = form.watch("caseId");

  // Find the selected case for display
  const selectedCase = useMemo(
    () => cases.find((c) => c.id === selectedCaseId),
    [cases, selectedCaseId]
  );

  // Compose datetime-local strings for form submission
  function composeDatetime(date: string, time: string): string {
    if (!date) return "";
    if (!time) return `${date}T00:00`;
    return `${date}T${time}`;
  }

  // Sync composed values into form when date/time changes
  function handleStartDateChange(val: string) {
    setStartDate(val);
    // Auto-fill end date to same day
    if (!endDate || endDate < val) {
      setEndDate(val);
    }
    form.setValue("startTime", composeDatetime(val, startTime));
    form.setValue("endTime", composeDatetime(endDate || val, endTime));
  }

  function handleStartTimeChange(val: string) {
    setStartTime(val);
    form.setValue("startTime", composeDatetime(startDate, val));
    // Auto-fill end time to +1 hour
    if (!endTime) {
      const auto = addOneHour(val);
      setEndTime(auto);
      form.setValue("endTime", composeDatetime(endDate || startDate, auto));
    }
  }

  function handleEndDateChange(val: string) {
    setEndDate(val);
    form.setValue("endTime", composeDatetime(val, endTime));
  }

  function handleEndTimeChange(val: string) {
    setEndTime(val);
    form.setValue("endTime", composeDatetime(endDate || startDate, val));
  }

  // When allDay toggled on, set times to midnight
  function handleAllDayChange(checked: boolean) {
    form.setValue("allDay", checked);
    if (checked) {
      form.setValue("startTime", composeDatetime(startDate, "00:00"));
      form.setValue("endTime", composeDatetime(endDate || startDate, "23:59"));
    } else {
      form.setValue("startTime", composeDatetime(startDate, startTime));
      form.setValue("endTime", composeDatetime(endDate || startDate, endTime));
    }
  }

  async function onSubmit(data: CreateEventInput) {
    try {
      const result = await createEvent(data);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Event created");
      router.push("/calendar");
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" {...form.register("title")} placeholder="Event title" />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Event Type *</Label>
              <Select
                value={form.watch("type")}
                onValueChange={(val) => form.setValue("type", val as CreateEventInput["type"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {formatEnum(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.type && (
                <p className="text-sm text-destructive">{form.formState.errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Link to Case (optional)</Label>
              <Popover open={caseOpen} onOpenChange={setCaseOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={caseOpen}
                    className="w-full justify-between font-normal"
                  >
                    {selectedCase
                      ? `${selectedCase.caseNumber} - ${selectedCase.title.length > 25 ? selectedCase.title.slice(0, 25) + "..." : selectedCase.title}`
                      : "Select case..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search cases..." />
                    <CommandList>
                      <CommandEmpty>No cases found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="none"
                          onSelect={() => {
                            form.setValue("caseId", undefined);
                            setCaseOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              !selectedCaseId ? "opacity-100" : "opacity-0"
                            )}
                          />
                          None
                        </CommandItem>
                        {cases.map((c) => (
                          <CommandItem
                            key={c.id}
                            value={`${c.caseNumber} ${c.title}`}
                            onSelect={() => {
                              form.setValue("caseId", c.id);
                              setCaseOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCaseId === c.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="min-w-0 flex-1">
                              <span className="font-mono text-xs">{c.caseNumber}</span>
                              <span className="ml-1.5 text-muted-foreground truncate">
                                {c.title.length > 30 ? c.title.slice(0, 30) + "..." : c.title}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Date inputs */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
              />
            </div>

            {!allDay && (
              <div className="space-y-2">
                <Label htmlFor="startTimeInput">Start Time *</Label>
                <Input
                  id="startTimeInput"
                  type="time"
                  value={startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
              />
            </div>

            {!allDay && (
              <div className="space-y-2">
                <Label htmlFor="endTimeInput">End Time *</Label>
                <Input
                  id="endTimeInput"
                  type="time"
                  value={endTime}
                  onChange={(e) => handleEndTimeChange(e.target.value)}
                />
              </div>
            )}

            {/* Hidden actual fields for form validation */}
            <input type="hidden" {...form.register("startTime")} />
            <input type="hidden" {...form.register("endTime")} />

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...form.register("location")} placeholder="Event location (optional)" />
              {form.formState.errors.location && (
                <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="allDay"
                checked={allDay}
                onCheckedChange={(checked) => handleAllDayChange(checked === true)}
              />
              <Label htmlFor="allDay" className="cursor-pointer">All Day Event</Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isCourtDate"
                checked={form.watch("isCourtDate")}
                onCheckedChange={(checked) => form.setValue("isCourtDate", checked === true)}
              />
              <Label htmlFor="isCourtDate" className="cursor-pointer">Court Date</Label>
            </div>
          </div>

          {form.formState.errors.startTime && (
            <p className="text-sm text-destructive">{form.formState.errors.startTime.message}</p>
          )}
          {form.formState.errors.endTime && (
            <p className="text-sm text-destructive">{form.formState.errors.endTime.message}</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              {...form.register("description")}
              placeholder="Event description (optional)"
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating..." : "Create Event"}
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
