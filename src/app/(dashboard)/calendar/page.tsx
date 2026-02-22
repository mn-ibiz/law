import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getCalendarEvents, getDeadlines } from "@/lib/queries/calendar";
import { CalendarView } from "@/components/calendar/calendar-view";

export default async function CalendarPage() {
  await requireAdminOrAttorney();
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [events, deadlineList] = await Promise.all([
    getCalendarEvents(start, end),
    getDeadlines(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">Court dates, deadlines, and events.</p>
      </div>
      <CalendarView events={events} deadlines={deadlineList} />
    </div>
  );
}
