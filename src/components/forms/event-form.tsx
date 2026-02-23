"use client";

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

const NONE_VALUE = "__none__";

const EVENT_TYPES = [
  "court_hearing",
  "meeting",
  "deadline",
  "reminder",
  "consultation",
  "deposition",
  "other",
] as const;

interface EventFormProps {
  cases: { id: string; caseNumber: string; title: string }[];
}

export function EventForm({ cases }: EventFormProps) {
  const router = useRouter();

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
              <Select
                value={form.watch("caseId") || NONE_VALUE}
                onValueChange={(val) =>
                  form.setValue("caseId", val === NONE_VALUE ? undefined : val)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select case" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>None</SelectItem>
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.caseNumber} - {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="datetime-local"
                {...form.register("startTime")}
              />
              {form.formState.errors.startTime && (
                <p className="text-sm text-destructive">{form.formState.errors.startTime.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="datetime-local"
                {...form.register("endTime")}
              />
              {form.formState.errors.endTime && (
                <p className="text-sm text-destructive">{form.formState.errors.endTime.message}</p>
              )}
            </div>

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
                checked={form.watch("allDay")}
                onCheckedChange={(checked) => form.setValue("allDay", checked === true)}
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
