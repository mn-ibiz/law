import { requireOrg } from "@/lib/auth/get-session";
import { getCases } from "@/lib/queries/cases";
import { EventForm } from "@/components/forms/event-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Event",
  description: "Create a new calendar event",
};

export default async function NewEventPage() {
  const { organizationId } = await requireOrg();
  const caseResult = await getCases(organizationId, { limit: 200 });

  const cases = caseResult.data.map((c) => ({
    id: c.id,
    caseNumber: c.caseNumber,
    title: c.title,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Event</h1>
        <p className="text-muted-foreground">Create a new calendar event or court date.</p>
      </div>
      <EventForm cases={cases} />
    </div>
  );
}
