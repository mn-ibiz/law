"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, AlertTriangle } from "lucide-react";
import { formatEnum } from "@/lib/utils/format-enum";
import { APP_LOCALE } from "@/lib/constants/locale";
import { cn } from "@/lib/utils";
import { getDotColor, getBadgeStyle } from "./event-type-colors";
import { CalendarDaySheet } from "./calendar-day-sheet";
import { PriorityBadge } from "@/components/shared/status-badges";
import type { SerializedCalendarEvent } from "./calendar-types";
import { deserializeEvents, type CalendarEvent } from "./calendar-types";

interface Deadline {
  id: string;
  title: string;
  priority: string;
  dueDate: Date;
  completedAt: Date | null;
  isStatutory: boolean;
  caseNumber: string | null;
  assignedToName: string | null;
}

interface CalendarViewProps {
  events: SerializedCalendarEvent[];
  deadlines: Deadline[];
}

const capsule =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-none whitespace-nowrap";

export function CalendarView({ events: serializedEvents, deadlines }: CalendarViewProps) {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const events = useMemo(() => deserializeEvents(serializedEvents), [serializedEvents]);

  const upcomingEvents = events
    .filter((e) => new Date(e.startTime) >= new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 20);

  const pendingDeadlines = deadlines
    .filter((d) => !d.completedAt)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  function handleEventClick(event: CalendarEvent) {
    const day = new Date(event.startTime);
    // Get all events for the same day
    setSelectedDay(day);
    setSheetOpen(true);
  }

  /** Get all events for the selected day */
  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return [];
    return events.filter((e) => {
      const eventDay = new Date(e.startTime);
      return (
        eventDay.getFullYear() === selectedDay.getFullYear() &&
        eventDay.getMonth() === selectedDay.getMonth() &&
        eventDay.getDate() === selectedDay.getDate()
      );
    });
  }, [events, selectedDay]);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming events.</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className="flex w-full items-start gap-3 border-b pb-3 last:border-0 transition-colors hover:bg-muted/50 rounded-md px-2 -mx-2 py-1 text-left"
                  >
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span
                        className={cn(
                          "inline-block h-2.5 w-2.5 rounded-full",
                          getDotColor(event.type)
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{event.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.startTime).toLocaleString(APP_LOCALE, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                        {event.isCourtDate && (
                          <span className={`${capsule} bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20`}>
                            Court
                          </span>
                        )}
                        <span className={`${capsule} ${getBadgeStyle(event.type)}`}>
                          {formatEnum(event.type)}
                        </span>
                      </div>
                      {event.location && (
                        <p className="text-xs text-muted-foreground mt-1">{event.location}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Pending Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingDeadlines.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending deadlines.</p>
            ) : (
              <div className="space-y-3">
                {pendingDeadlines.map((dl) => {
                  const isOverdue = new Date(dl.dueDate) < new Date();
                  return (
                    <div
                      key={dl.id}
                      className={`flex items-start justify-between border-b pb-3 last:border-0 transition-colors hover:bg-muted/50 rounded-md px-2 -mx-2 py-1 ${
                        isOverdue ? "text-destructive" : ""
                      }`}
                    >
                      <div>
                        <p className="font-medium text-sm">{dl.title}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-muted-foreground">
                            Due: {new Date(dl.dueDate).toLocaleDateString(APP_LOCALE)}
                          </span>
                          {dl.caseNumber && (
                            <span className="text-xs font-mono text-muted-foreground">
                              {dl.caseNumber}
                            </span>
                          )}
                          {dl.isStatutory && (
                            <span className={`${capsule} bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20`}>
                              Statutory
                            </span>
                          )}
                        </div>
                      </div>
                      <PriorityBadge priority={dl.priority} />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CalendarDaySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        date={selectedDay}
        events={selectedDayEvents}
      />
    </>
  );
}
