import { requireOrg } from "@/lib/auth/get-session";
import { getCalendarEvents, getDeadlines } from "@/lib/queries/calendar";
import { CalendarView } from "@/components/calendar/calendar-view";
import { CalendarMonthGrid } from "@/components/calendar/calendar-month-grid";
import { CalendarWeekView } from "@/components/calendar/calendar-week-view";
import { CalendarToolbar } from "@/components/calendar/calendar-toolbar";
import { serializeEvents } from "@/components/calendar/calendar-types";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  parse,
} from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendar",
  description: "Court dates, deadlines, and events",
};

type ViewType = "month" | "week" | "list";

const VALID_VIEWS = new Set<ViewType>(["month", "week", "list"]);

interface CalendarPageProps {
  searchParams: Promise<{ view?: string; month?: string }>;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const { organizationId } = await requireOrg();

  const params = await searchParams;

  const view: ViewType = VALID_VIEWS.has(params.view as ViewType)
    ? (params.view as ViewType)
    : "month";

  let currentDate: Date;
  if (params.month && /^\d{4}-\d{2}$/.test(params.month)) {
    currentDate = parse(params.month, "yyyy-MM", new Date());
    if (isNaN(currentDate.getTime())) {
      currentDate = new Date();
    }
  } else {
    currentDate = new Date();
  }

  let start: Date;
  let end: Date;

  if (view === "week") {
    start = startOfWeek(currentDate, { weekStartsOn: 1 });
    end = endOfWeek(currentDate, { weekStartsOn: 1 });
  } else {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    start = startOfWeek(monthStart, { weekStartsOn: 1 });
    end = endOfWeek(monthEnd, { weekStartsOn: 1 });
  }

  const [events, deadlineList] = await Promise.all([
    getCalendarEvents(organizationId, start, end),
    getDeadlines(organizationId),
  ]);

  const serializedEvents = serializeEvents(events);

  return (
    <div className="space-y-4">
      <CalendarToolbar currentDate={currentDate} view={view} />

      {view === "month" && (
        <CalendarMonthGrid events={serializedEvents} currentMonth={currentDate} />
      )}

      {view === "week" && (
        <CalendarWeekView events={serializedEvents} currentWeek={currentDate} />
      )}

      {view === "list" && (
        <CalendarView events={serializedEvents} deadlines={deadlineList} />
      )}
    </div>
  );
}
