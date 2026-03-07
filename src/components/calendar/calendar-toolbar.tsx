"use client";

import { useRouter } from "next/navigation";
import { format, addMonths, subMonths, addWeeks, subWeeks } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from "lucide-react";
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
      {/* Left: Title + Navigation */}
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold tracking-tight min-w-[200px]">{label}</h2>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={navigatePrev} aria-label="Previous">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={navigateNext} aria-label="Next">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" className="h-8 font-medium" onClick={navigateToday}>
          Today
        </Button>
      </div>

      {/* Right: View toggle + Add */}
      <div className="flex items-center gap-3">
        <div className="inline-flex h-9 items-center rounded-lg border bg-muted/50 p-1">
          {(["month", "week", "list"] as const).map((v) => (
            <button
              key={v}
              onClick={() => switchView(v)}
              className={`rounded-md px-3.5 py-1 text-sm font-medium transition-all ${
                view === v
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        <Button size="sm" className="h-9 gap-1.5" asChild>
          <Link href="/calendar/new">
            <Plus className="h-4 w-4" />
            New Event
          </Link>
        </Button>
      </div>
    </div>
  );
}
