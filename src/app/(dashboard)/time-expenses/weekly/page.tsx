import { requireRole } from "@/lib/auth/get-session";
import { WeeklyTimesheet } from "@/components/time-expenses/weekly-timesheet";
import { Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weekly Timesheet",
  description: "Enter time in a weekly grid view",
};

export default async function WeeklyTimesheetPage() {
  await requireRole("admin", "attorney");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Clock className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Weekly Timesheet</h1>
          <p className="text-sm text-muted-foreground">
            Enter time across cases for the week.
          </p>
        </div>
      </div>

      <WeeklyTimesheet />
    </div>
  );
}
