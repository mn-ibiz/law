import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calendarEvents, deadlines } from "@/lib/db/schema/calendar";
import { organizations } from "@/lib/db/schema/organizations";
import { sql, eq, and } from "drizzle-orm";
import { verifyIcalToken } from "@/lib/utils/ical";
import { createEvents, type EventAttributes } from "ics";
import { auth } from "@/lib/auth/auth";
import { siteConfig } from "@/lib/config/site";
import { rateLimit } from "@/lib/utils/rate-limit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const token = request.nextUrl.searchParams.get("token");

  // Verify the requesting user owns this calendar
  const session = await auth();
  if (!session?.user?.id || session.user.id !== userId || !session.user.organizationId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!token || !verifyIcalToken(userId, session.user.organizationId, token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Rate limit: 60 requests per hour per user
  const rl = await rateLimit(`ical:${userId}`, { maxRequests: 60, windowMs: 60 * 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // Fetch events from 90 days ago to 1 year forward
  const now = new Date();
  const pastDate = new Date(now);
  pastDate.setDate(pastDate.getDate() - 90);
  const futureDate = new Date(now);
  futureDate.setFullYear(futureDate.getFullYear() + 1);

  const orgId = session.user.organizationId;

  // Fetch org name, events, and deadlines in parallel
  const [orgResult, userEvents, userDeadlines] = await Promise.all([
    db
      .select({ name: organizations.name })
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1),
    db
      .select({
        id: calendarEvents.id,
        title: calendarEvents.title,
        description: calendarEvents.description,
        startTime: calendarEvents.startTime,
        endTime: calendarEvents.endTime,
        location: calendarEvents.location,
        type: calendarEvents.type,
      })
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.organizationId, orgId),
          eq(calendarEvents.createdBy, userId),
          sql`${calendarEvents.startTime} >= ${pastDate.toISOString()}::timestamptz`,
          sql`${calendarEvents.startTime} <= ${futureDate.toISOString()}::timestamptz`
        )
      ),
    db
      .select({
        id: deadlines.id,
        title: deadlines.title,
        description: deadlines.description,
        dueDate: deadlines.dueDate,
      })
      .from(deadlines)
      .where(and(eq(deadlines.organizationId, orgId), eq(deadlines.assignedTo, userId))),
  ]);
  const calName = orgResult[0]?.name ?? siteConfig.name;

  const icsEvents: EventAttributes[] = [];

  for (const evt of userEvents) {
    const start = new Date(evt.startTime);
    const end = new Date(evt.endTime);
    icsEvents.push({
      uid: evt.id,
      title: evt.title,
      description: evt.description ?? undefined,
      location: evt.location ?? undefined,
      start: [start.getFullYear(), start.getMonth() + 1, start.getDate(), start.getHours(), start.getMinutes()],
      end: [end.getFullYear(), end.getMonth() + 1, end.getDate(), end.getHours(), end.getMinutes()],
      status: "CONFIRMED",
      calName,
    });
  }

  for (const dl of userDeadlines) {
    const due = new Date(dl.dueDate);
    icsEvents.push({
      uid: dl.id,
      title: `[DEADLINE] ${dl.title}`,
      description: dl.description ?? undefined,
      start: [due.getFullYear(), due.getMonth() + 1, due.getDate()],
      duration: { hours: 0, minutes: 30 },
      status: "CONFIRMED",
      calName,
      alarms: [{ action: "display", trigger: { hours: 24, before: true }, description: "Deadline tomorrow" }],
    });
  }

  if (icsEvents.length === 0) {
    // Return empty calendar
    const emptyIcs = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      `PRODID:-//${calName}//EN`,
      "CALSCALE:GREGORIAN",
      "END:VCALENDAR",
    ].join("\r\n");

    return new NextResponse(emptyIcs, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'attachment; filename="calendar.ics"',
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  }

  const { error, value } = createEvents(icsEvents);

  if (error || !value) {
    return NextResponse.json({ error: "Failed to generate calendar" }, { status: 500 });
  }

  return new NextResponse(value, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="calendar.ics"',
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
