"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Calendar } from "lucide-react";
import { useCallback } from "react";

interface ReportFiltersProps {
  onExport?: () => void;
}

const presets = [
  { label: "This Month", value: "this-month" },
  { label: "Last Month", value: "last-month" },
  { label: "This Quarter", value: "this-quarter" },
  { label: "YTD", value: "ytd" },
  { label: "Last Year", value: "last-year" },
];

function getPresetDates(preset: string): { start: string; end: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  switch (preset) {
    case "this-month":
      return {
        start: new Date(year, month, 1).toISOString().split("T")[0],
        end: new Date(year, month + 1, 0).toISOString().split("T")[0],
      };
    case "last-month":
      return {
        start: new Date(year, month - 1, 1).toISOString().split("T")[0],
        end: new Date(year, month, 0).toISOString().split("T")[0],
      };
    case "this-quarter": {
      const qStart = Math.floor(month / 3) * 3;
      return {
        start: new Date(year, qStart, 1).toISOString().split("T")[0],
        end: new Date(year, qStart + 3, 0).toISOString().split("T")[0],
      };
    }
    case "ytd":
      return {
        start: new Date(year, 0, 1).toISOString().split("T")[0],
        end: now.toISOString().split("T")[0],
      };
    case "last-year":
      return {
        start: new Date(year - 1, 0, 1).toISOString().split("T")[0],
        end: new Date(year - 1, 11, 31).toISOString().split("T")[0],
      };
    default:
      return {
        start: new Date(year, 0, 1).toISOString().split("T")[0],
        end: now.toISOString().split("T")[0],
      };
  }
}

export function ReportFilters({ onExport }: ReportFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startDate = searchParams.get("start") ?? "";
  const endDate = searchParams.get("end") ?? "";

  const updateParams = useCallback(
    (start: string, end: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (start) params.set("start", start);
      else params.delete("start");
      if (end) params.set("end", end);
      else params.delete("end");
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Start Date</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => updateParams(e.target.value, endDate)}
            className="h-8 w-36 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">End Date</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => updateParams(startDate, e.target.value)}
            className="h-8 w-36 text-xs"
          />
        </div>
        <div className="flex gap-1">
          {presets.map((p) => (
            <Button
              key={p.value}
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                const dates = getPresetDates(p.value);
                updateParams(dates.start, dates.end);
              }}
            >
              <Calendar className="mr-1 h-3 w-3" />
              {p.label}
            </Button>
          ))}
        </div>
      </div>
      {onExport && (
        <Button variant="outline" size="sm" className="h-8" onClick={onExport}>
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Export CSV
        </Button>
      )}
    </div>
  );
}
