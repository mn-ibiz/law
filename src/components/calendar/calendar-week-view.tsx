"use client";

import { useState, useMemo } from "react";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  format,
  getHours,
  getMinutes,
  differenceInMinutes,
} from "date-fns";
import { cn } from "@/lib/utils";
import { getBlockColor } from "./event-type-colors";
import { CalendarDaySheet } from "./calendar-day-sheet";
import type { SerializedCalendarEvent } from "./calendar-types";
import { deserializeEvents, type CalendarEvent } from "./calendar-types";

const START_HOUR = 6;
const END_HOUR = 22;
const TOTAL_HOURS = END_HOUR - START_HOUR;

interface CalendarWeekViewProps {
  events: SerializedCalendarEvent[];
  currentWeek: Date;
}

export function CalendarWeekView({ events: serializedEvents, currentWeek }: CalendarWeekViewProps) {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const events = useMemo(() => deserializeEvents(serializedEvents), [serializedEvents]);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  /** Partition events by day */
  const eventsByDay = useMemo(() => {
    const map = new Map<string, { allDay: CalendarEvent[]; timed: CalendarEvent[] }>();
    for (const day of days) {
      map.set(format(day, "yyyy-MM-dd"), { allDay: [], timed: [] });
    }
    for (const event of events) {
      const key = format(new Date(event.startTime), "yyyy-MM-dd");
      const bucket = map.get(key);
      if (!bucket) continue;
      if (event.allDay) {
        bucket.allDay.push(event);
      } else {
        bucket.timed.push(event);
      }
    }
    return map;
  }, [events, days]);

  function handleEventClick(day: Date) {
    setSelectedDay(day);
    setSheetOpen(true);
  }

  /** Compute top offset and height for a timed event */
  function getEventPosition(event: CalendarEvent) {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    const startMinutes = (getHours(start) - START_HOUR) * 60 + getMinutes(start);
    const durationMinutes = Math.max(differenceInMinutes(end, start), 30); // min 30 min height
    const totalMinutes = TOTAL_HOURS * 60;

    const topPercent = Math.max(0, (startMinutes / totalMinutes) * 100);
    const heightPercent = Math.min((durationMinutes / totalMinutes) * 100, 100 - topPercent);

    return { top: `${topPercent}%`, height: `${Math.max(heightPercent, 2)}%` };
  }

  const selectedDayKey = selectedDay ? format(selectedDay, "yyyy-MM-dd") : null;
  const selectedDayEvents = selectedDayKey
    ? [...(eventsByDay.get(selectedDayKey)?.allDay ?? []), ...(eventsByDay.get(selectedDayKey)?.timed ?? [])]
    : [];

  // Hour labels
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

  return (
    <>
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        {/* Header: day labels + all-day events */}
        <div className="grid grid-cols-[3.5rem_repeat(7,1fr)] border-b">
          {/* Corner cell */}
          <div className="border-r p-1" />
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const bucket = eventsByDay.get(key);
            const allDayEvents = bucket?.allDay ?? [];
            const today = isToday(day);

            return (
              <div
                key={key}
                className={cn(
                  "border-r last:border-r-0 p-1 text-center",
                  today && "bg-primary/5"
                )}
              >
                <button
                  onClick={() => handleEventClick(day)}
                  className="w-full hover:bg-muted/50 rounded-md py-1 transition-colors"
                >
                  <div className="text-[10px] uppercase text-muted-foreground sm:text-xs">
                    {format(day, "EEE")}
                  </div>
                  <div
                    className={cn(
                      "mx-auto flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium",
                      today && "bg-primary text-primary-foreground font-bold"
                    )}
                  >
                    {format(day, "d")}
                  </div>
                </button>
                {/* All-day events */}
                {allDayEvents.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {allDayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "rounded px-1 py-0.5 text-[10px] font-medium truncate border-l-2",
                          getBlockColor(event.type)
                        )}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {allDayEvents.length > 2 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{allDayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="grid grid-cols-[3.5rem_repeat(7,1fr)] overflow-auto max-h-[600px]">
          {/* Hour labels column */}
          <div className="relative border-r">
            {hours.map((hour) => (
              <div
                key={hour}
                className="flex h-12 items-start justify-end pr-2 text-[10px] text-muted-foreground sm:text-xs"
                style={{ marginTop: hour === START_HOUR ? 0 : undefined }}
              >
                {format(new Date(2000, 0, 1, hour), "h a")}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const bucket = eventsByDay.get(key);
            const timedEvents = bucket?.timed ?? [];
            const today = isToday(day);

            return (
              <div
                key={key}
                className={cn(
                  "relative border-r last:border-r-0",
                  today && "bg-primary/5"
                )}
                style={{ height: `${TOTAL_HOURS * 3}rem` }}
              >
                {/* Hour grid lines */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 border-t border-dashed border-muted"
                    style={{ top: `${((hour - START_HOUR) / TOTAL_HOURS) * 100}%` }}
                  />
                ))}

                {/* Event blocks */}
                {timedEvents.map((event) => {
                  const pos = getEventPosition(event);
                  return (
                    <button
                      key={event.id}
                      onClick={() => handleEventClick(day)}
                      className={cn(
                        "absolute left-0.5 right-0.5 overflow-hidden rounded border-l-2 px-1 py-0.5 text-left transition-opacity hover:opacity-90",
                        getBlockColor(event.type)
                      )}
                      style={{ top: pos.top, height: pos.height, minHeight: "1.25rem" }}
                      title={event.title}
                    >
                      <p className="truncate text-[10px] font-medium sm:text-xs">
                        {event.title}
                      </p>
                      <p className="truncate text-[9px] opacity-75 sm:text-[10px]">
                        {format(new Date(event.startTime), "h:mm a")}
                      </p>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
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
