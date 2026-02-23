import { requireRole } from "@/lib/auth/get-session";
import { auth } from "@/lib/auth/auth";
import { generateIcalToken } from "@/lib/utils/ical";
import { Calendar } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendar Sync",
  description: "Subscribe to your calendar via iCal",
};

export default async function CalendarSyncPage() {
  await requireRole("admin", "attorney");
  const session = await auth();
  const userId = session!.user!.id;
  const token = generateIcalToken(userId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar Sync</h1>
          <p className="text-sm text-muted-foreground">
            Subscribe to your events and deadlines in external calendar apps.
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="font-semibold">iCal Subscription URL</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Copy this URL and add it as a calendar subscription in Google Calendar, Apple Calendar, or Outlook.
        </p>
        <div className="mt-4 flex gap-2">
          <code className="flex-1 rounded-lg border bg-muted/50 px-4 py-2.5 text-sm break-all">
            {`/api/calendar/ical/${userId}?token=${token}`}
          </code>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          This URL is private and unique to your account. Do not share it.
        </p>
      </div>
    </div>
  );
}
