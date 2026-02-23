"use client";

import { useRouter } from "next/navigation";
import { format, addMonths, subMonths, addWeeks, subWeeks } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";

type ViewType = "month" | "week" | "list";

interface CalendarToolbarProps {
  currentDate: Date;
  view: ViewType;
}

function buildUrl(date: Date, view: ViewType): string {
  const month = format(date, "yyyy-MM");
  return `/calendar?view=${view}&month=${month}`;
}

export function CalendarToolbar({ currentDate, view }: CalendarToolbarProps) {
  const router = useRouter();

  function navigatePrev() {
    const prev = view === "week" ? subWeeks(currentDate, 1) : subMonths(currentDate, 1);
    router.push(buildUrl(prev, view));
  }

  function navigateNext() {
    const next = view === "week" ? addWeeks(currentDate, 1) : addMonths(currentDate, 1);
    router.push(buildUrl(next, view));
  }

  function navigateToday() {
    router.push(buildUrl(new Date(), view));
  }

  function switchView(newView: ViewType) {
    router.push(buildUrl(currentDate, newView));
  }

  const label =
    view === "week"
      ? `Week of ${format(currentDate, "MMM d, yyyy")}`
      : format(currentDate, "MMMM yyyy");

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon-sm" onClick={navigatePrev} aria-label="Previous">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon-sm" onClick={navigateNext} aria-label="Next">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={navigateToday}>
          Today
        </Button>
        <h2 className="ml-2 text-lg font-semibold">{label}</h2>
      </div>

      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-md bg-muted p-0.5">
          {(["month", "week", "list"] as const).map((v) => (
            <button
              key={v}
              onClick={() => switchView(v)}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                view === v
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        <Button size="sm" asChild>
          <Link href="/calendar/new">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Event
          </Link>
        </Button>
      </div>
    </div>
  );
}
