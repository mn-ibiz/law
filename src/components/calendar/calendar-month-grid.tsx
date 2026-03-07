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
import { getBlockColor, getDotColor } from "./event-type-colors";
import { CalendarDaySheet } from "./calendar-day-sheet";
import type { SerializedCalendarEvent } from "./calendar-types";
import { deserializeEvents, type CalendarEvent } from "./calendar-types";
import { formatEnum } from "@/lib/utils/format-enum";
import { APP_LOCALE } from "@/lib/constants/locale";
import { MapPin, Gavel, Clock } from "lucide-react";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface CalendarMonthGridProps {
  events: SerializedCalendarEvent[];
  currentMonth: Date;
}

/** Compact event block shown inside a day cell on larger screens */
function EventBlock({ event }: { event: CalendarEvent }) {
  const blockColor = getBlockColor(event.type);
  const time = event.allDay
    ? null
    : new Date(event.startTime).toLocaleTimeString(APP_LOCALE, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

  return (
    <div
      className={cn(
        "rounded-md border-l-[3px] px-2 py-1.5 text-[11px] leading-tight shadow-sm",
        blockColor
      )}
      title={`${event.title}${time ? ` at ${time}` : ""}${event.location ? ` - ${event.location}` : ""}`}
    >
      {/* Row 1: title */}
      <div className="flex items-center gap-1">
        {event.isCourtDate && <Gavel className="h-3 w-3 shrink-0 opacity-70" />}
        <span className="truncate font-semibold">{event.title}</span>
      </div>
      {/* Row 2: time + location */}
      <div className="mt-0.5 flex items-center gap-1.5 text-[10px] opacity-75">
        {time && (
          <span className="flex items-center gap-0.5 font-medium">
            <Clock className="h-2.5 w-2.5" />
            {time}
          </span>
        )}
        {event.allDay && (
          <span className="font-medium">All day</span>
        )}
        {event.location && (
          <span className="flex items-center gap-0.5 truncate">
            <MapPin className="h-2.5 w-2.5 shrink-0" />
            <span className="truncate">{event.location}</span>
          </span>
        )}
      </div>
    </div>
  );
}

/** Tiny colored pill for mobile screens */
function EventDot({ event }: { event: CalendarEvent }) {
  return (
    <div
      className={cn("h-1.5 w-1.5 rounded-full", getDotColor(event.type))}
      title={event.title}
    />
  );
}

export function CalendarMonthGrid({ events: serializedEvents, currentMonth }: CalendarMonthGridProps) {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const events = useMemo(() => deserializeEvents(serializedEvents), [serializedEvents]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

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
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {/* Day header row */}
        <div className="grid grid-cols-7 border-b bg-muted/30">
          {DAY_LABELS.map((label, i) => (
            <div
              key={label}
              className={cn(
                "px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                i > 0 && "border-l border-border/50"
              )}
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
            const MAX_VISIBLE = 2;
            const visibleEvents = dayEvents.slice(0, MAX_VISIBLE);
            const overflow = dayEvents.length - MAX_VISIBLE;

            return (
              <button
                key={key}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "relative flex min-h-[5rem] flex-col p-1 text-left transition-colors hover:bg-accent/30 sm:min-h-[8rem] sm:p-2",
                  idx % 7 !== 0 && "border-l border-border/50",
                  idx >= 7 && "border-t border-border/50",
                  !inMonth && "bg-muted/20",
                  today && "bg-primary/[0.03]"
                )}
              >
                {/* Day number */}
                <div className="mb-1 flex justify-end">
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-sm",
                      !inMonth && "text-muted-foreground/40",
                      inMonth && "text-foreground font-medium",
                      today && "bg-red-500 text-white font-bold",
                      selectedDay && isSameDay(day, selectedDay) && !today && "bg-accent font-semibold"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                </div>

                {/* Mobile: dots */}
                <div className="flex flex-wrap gap-1 sm:hidden">
                  {dayEvents.slice(0, 4).map((event) => (
                    <EventDot key={event.id} event={event} />
                  ))}
                  {dayEvents.length > 4 && (
                    <span className="text-[9px] text-muted-foreground">+{dayEvents.length - 4}</span>
                  )}
                </div>

                {/* Desktop: rich event blocks */}
                <div className="hidden flex-1 space-y-1 overflow-hidden sm:flex sm:flex-col">
                  {visibleEvents.map((event) => (
                    <EventBlock key={event.id} event={event} />
                  ))}
                  {overflow > 0 && (
                    <span className="block px-2 text-[11px] font-semibold text-primary">
                      +{overflow} more
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
