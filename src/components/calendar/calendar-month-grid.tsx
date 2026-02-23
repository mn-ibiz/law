"use client";

import { useState, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
} from "date-fns";
import { cn } from "@/lib/utils";
import { getDotColor, getBlockColor } from "./event-type-colors";
import { CalendarDaySheet } from "./calendar-day-sheet";
import type { SerializedCalendarEvent } from "./calendar-types";
import { deserializeEvents, type CalendarEvent } from "./calendar-types";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface CalendarMonthGridProps {
  events: SerializedCalendarEvent[];
  currentMonth: Date;
}

export function CalendarMonthGrid({ events: serializedEvents, currentMonth }: CalendarMonthGridProps) {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const events = useMemo(() => deserializeEvents(serializedEvents), [serializedEvents]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  // Start the grid on Monday
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  /** Build a map from date string to events for O(1) lookup */
  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const key = format(new Date(event.startTime), "yyyy-MM-dd");
      const existing = map.get(key);
      if (existing) {
        existing.push(event);
      } else {
        map.set(key, [event]);
      }
    }
    return map;
  }, [events]);

  function handleDayClick(day: Date) {
    setSelectedDay(day);
    setSheetOpen(true);
  }

  const selectedDayEvents = selectedDay
    ? eventsByDay.get(format(selectedDay, "yyyy-MM-dd")) ?? []
    : [];

  return (
    <>
      <div className="rounded-lg border bg-card shadow-sm">
        {/* Day header row */}
        <div className="grid grid-cols-7 border-b">
          {DAY_LABELS.map((label) => (
            <div
              key={label}
              className="px-1 py-2 text-center text-xs font-medium text-muted-foreground sm:px-3"
            >
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{label.charAt(0)}</span>
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const key = format(day, "yyyy-MM-dd");
            const dayEvents = eventsByDay.get(key) ?? [];
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);
            const MAX_DOTS = 3;
            const visibleEvents = dayEvents.slice(0, MAX_DOTS);
            const overflow = dayEvents.length - MAX_DOTS;

            return (
              <button
                key={key}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "relative flex min-h-[4rem] flex-col items-start p-1 text-left transition-colors hover:bg-muted/50 sm:min-h-[5rem] sm:p-2",
                  // Border between cells
                  idx % 7 !== 0 && "border-l",
                  idx >= 7 && "border-t",
                  // Muted for out-of-month days
                  !inMonth && "bg-muted/30"
                )}
              >
                {/* Day number */}
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium sm:text-sm",
                    !inMonth && "text-muted-foreground/50",
                    today && "bg-primary text-primary-foreground font-bold",
                    selectedDay && isSameDay(day, selectedDay) && !today && "bg-accent"
                  )}
                >
                  {format(day, "d")}
                </span>

                {/* Event dots */}
                <div className="mt-0.5 flex flex-wrap gap-0.5 sm:mt-1 sm:gap-1">
                  {visibleEvents.map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        "h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5",
                        getDotColor(event.type)
                      )}
                      title={event.title}
                    />
                  ))}
                </div>

                {/* Overflow indicator */}
                {overflow > 0 && (
                  <span className="mt-0.5 text-[10px] text-muted-foreground">
                    +{overflow} more
                  </span>
                )}

                {/* Event titles (visible on larger screens) */}
                <div className="hidden w-full sm:block">
                  {dayEvents.slice(0, 2).map((event) => {
                    const blockColor = getBlockColor(event.type);
                    return (
                      <div
                        key={event.id}
                        className={cn(
                          "mt-0.5 flex items-center gap-1 truncate rounded border-l-2 px-1.5 py-0.5 text-[11px] font-medium leading-tight",
                          blockColor
                        )}
                      >
                        <span className="truncate">{event.title}</span>
                      </div>
                    );
                  })}
                  {dayEvents.length > 2 && (
                    <span className="mt-0.5 block text-[10px] text-muted-foreground px-1">
                      +{dayEvents.length - 2} more
                    </span>
                  )}
                </div>
              </button>
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
