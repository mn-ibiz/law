"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Clock, MapPin, ExternalLink, Trash2, Plus, Gavel } from "lucide-react";
import { formatEnum } from "@/lib/utils/format-enum";
import { getBadgeStyle } from "./event-type-colors";
import { deleteEvent } from "@/lib/actions/calendar";
import type { CalendarEvent } from "./calendar-types";
import { APP_LOCALE } from "@/lib/constants/locale";
import Link from "next/link";

const capsule =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-none whitespace-nowrap";

interface CalendarDaySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  events: CalendarEvent[];
}

export function CalendarDaySheet({
  open,
  onOpenChange,
  date,
  events,
}: CalendarDaySheetProps) {
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [deleting, setDeleting] = useState(false);

  function handleClose(val: boolean) {
    if (!val) {
      setSelectedEvent(null);
    }
    onOpenChange(val);
  }

  async function handleDelete(eventId: string) {
    setDeleting(true);
    try {
      const result = await deleteEvent(eventId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Event deleted");
        setSelectedEvent(null);
        router.refresh();
      }
    } catch {
      toast.error("Failed to delete event");
    } finally {
      setDeleting(false);
    }
  }

  if (!date) return null;

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{format(date, "EEEE, MMMM d, yyyy")}</SheetTitle>
          <SheetDescription>
            {sortedEvents.length} event{sortedEvents.length !== 1 ? "s" : ""}
          </SheetDescription>
        </SheetHeader>

        <div className="px-4">
          <Button size="sm" asChild className="w-full">
            <Link href={`/calendar/new`}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Event
            </Link>
          </Button>
        </div>

        <ScrollArea className="flex-1 px-4 pb-4">
          {sortedEvents.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No events on this day.
            </p>
          ) : selectedEvent ? (
            /* Event Detail View */
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEvent(null)}
                className="mb-2"
              >
                &larr; Back to list
              </Button>

              <div>
                <h3 className="text-base font-semibold">{selectedEvent.title}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`${capsule} ${getBadgeStyle(selectedEvent.type)}`}>
                    {formatEnum(selectedEvent.type)}
                  </span>
                  {selectedEvent.isCourtDate && (
                    <span className={`${capsule} bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20`}>
                      <Gavel className="h-3 w-3" />
                      Court Date
                    </span>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 shrink-0" />
                  {selectedEvent.allDay ? (
                    <span>All day</span>
                  ) : (
                    <span>
                      {new Date(selectedEvent.startTime).toLocaleTimeString(APP_LOCALE, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      &ndash;{" "}
                      {new Date(selectedEvent.endTime).toLocaleTimeString(APP_LOCALE, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>

                {selectedEvent.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}

                {selectedEvent.caseId && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <Link
                      href={`/cases/${selectedEvent.caseId}`}
                      className="text-sm text-primary hover:underline"
                    >
                      View linked case
                    </Link>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(selectedEvent.id)}
                  disabled={deleting}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          ) : (
            /* Events List */
            <div className="space-y-1">
              {sortedEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="w-full rounded-md px-3 py-2.5 text-left transition-colors hover:bg-muted/70"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{event.title}</p>
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          {event.allDay
                            ? "All day"
                            : new Date(event.startTime).toLocaleTimeString(APP_LOCALE, {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                        </span>
                        <span className={`${capsule} ${getBadgeStyle(event.type)}`}>
                          {formatEnum(event.type)}
                        </span>
                        {event.isCourtDate && (
                          <span className={`${capsule} bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20`}>
                            Court
                          </span>
                        )}
                      </div>
                      {event.location && (
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {event.location}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
