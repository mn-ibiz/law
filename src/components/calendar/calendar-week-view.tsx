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
const HOUR_HEIGHT_REM = 3.5;

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

  function handleDayClick(day: Date) {
    setSelectedDay(day);
    setSheetOpen(true);
  }

  function getEventPosition(event: CalendarEvent) {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    const startMinutes = (getHours(start) - START_HOUR) * 60 + getMinutes(start);
    const durationMinutes = Math.max(differenceInMinutes(end, start), 30);
    const totalMinutes = TOTAL_HOURS * 60;

    const topPercent = Math.max(0, (startMinutes / totalMinutes) * 100);
    const heightPercent = Math.min((durationMinutes / totalMinutes) * 100, 100 - topPercent);

    return { top: `${topPercent}%`, height: `${Math.max(heightPercent, 2.5)}%` };
  }

  const selectedDayKey = selectedDay ? format(selectedDay, "yyyy-MM-dd") : null;
  const selectedDayEvents = selectedDayKey
    ? [...(eventsByDay.get(selectedDayKey)?.allDay ?? []), ...(eventsByDay.get(selectedDayKey)?.timed ?? [])]
    : [];

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

  return (
    <>
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {/* Header: day labels + all-day events */}
        <div className="grid grid-cols-[4rem_repeat(7,1fr)] border-b bg-muted/30">
          <div className="border-r border-border/50 p-2" />
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const bucket = eventsByDay.get(key);
            const allDayEvents = bucket?.allDay ?? [];
            const today = isToday(day);

            return (
              <div
                key={key}
                className={cn(
                  "border-l border-border/50 p-2 text-center",
                  today && "bg-primary/[0.04]"
                )}
              >
                <button
                  onClick={() => handleDayClick(day)}
                  className="w-full hover:bg-accent/30 rounded-lg py-1.5 transition-colors"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {format(day, "EEE")}
                  </div>
                  <div
                    className={cn(
                      "mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                      today && "bg-red-500 text-white font-bold"
                    )}
                  >
                    {format(day, "d")}
                  </div>
                </button>
                {allDayEvents.length > 0 && (
                  <div className="mt-1.5 space-y-0.5 px-0.5">
                    {allDayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[10px] font-medium truncate",
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
        <div className="grid grid-cols-[4rem_repeat(7,1fr)] overflow-auto max-h-[650px]">
          {/* Hour labels column */}
          <div className="relative border-r border-border/50">
            {hours.map((hour) => (
              <div
                key={hour}
                className="flex items-start justify-end pr-3 text-[11px] font-medium text-muted-foreground"
                style={{ height: `${HOUR_HEIGHT_REM}rem` }}
              >
                <span className="-mt-1.5">{format(new Date(2000, 0, 1, hour), "h a")}</span>
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
                  "relative border-l border-border/50",
                  today && "bg-primary/[0.02]"
                )}
                style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT_REM}rem` }}
              >
                {/* Hour grid lines */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 border-t border-border/30"
                    style={{ top: `${((hour - START_HOUR) / TOTAL_HOURS) * 100}%` }}
                  />
                ))}

                {/* Event blocks */}
                {timedEvents.map((event) => {
                  const pos = getEventPosition(event);
                  return (
                    <button
                      key={event.id}
                      onClick={() => handleDayClick(day)}
                      className={cn(
                        "absolute left-1 right-1 overflow-hidden rounded-md border-l-[3px] px-1.5 py-1 text-left transition-opacity hover:opacity-90 shadow-sm",
                        getBlockColor(event.type)
                      )}
                      style={{ top: pos.top, height: pos.height, minHeight: "1.75rem" }}
                      title={`${event.title}${event.location ? ` - ${event.location}` : ""}`}
                    >
                      <p className="truncate text-[11px] font-semibold leading-tight">
                        {event.title}
                      </p>
                      <p className="truncate text-[10px] opacity-75 leading-tight font-medium">
                        {format(new Date(event.startTime), "h:mm a")}
                        {event.location ? ` · ${event.location}` : ""}
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
