"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { createBatchTimeEntries } from "@/lib/actions/time-expenses";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

interface TimesheetRow {
  caseId: string;
  caseName: string;
  hours: number[];
}

export function WeeklyTimesheet() {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [rows, setRows] = useState<TimesheetRow[]>([]);
  const [newCaseId, setNewCaseId] = useState("");
  const [newCaseName, setNewCaseName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const weekDates = DAYS.map((_, i) => addDays(weekStart, i));

  function addRow() {
    if (!newCaseId.trim()) return;
    if (rows.some((r) => r.caseId === newCaseId)) return;
    setRows([...rows, { caseId: newCaseId, caseName: newCaseName || newCaseId, hours: [0, 0, 0, 0, 0, 0, 0] }]);
    setNewCaseId("");
    setNewCaseName("");
  }

  function updateHours(rowIdx: number, dayIdx: number, value: number) {
    setRows((prev) => {
      const updated = [...prev];
      updated[rowIdx] = {
        ...updated[rowIdx],
        hours: updated[rowIdx].hours.map((h, i) => (i === dayIdx ? value : h)),
      };
      return updated;
    });
  }

  function removeRow(rowIdx: number) {
    setRows((prev) => prev.filter((_, i) => i !== rowIdx));
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      const entries = rows.flatMap((row) =>
        row.hours.map((h, dayIdx) => ({
          caseId: row.caseId,
          date: formatDate(weekDates[dayIdx]),
          hours: h,
          description: `Weekly timesheet - ${row.caseName}`,
          isBillable: true,
        }))
      ).filter((e) => e.hours > 0);

      if (entries.length === 0) {
        setMessage("No hours to save");
        return;
      }

      const result = await createBatchTimeEntries({ entries });
      if (result && "error" in result) {
        setMessage(result.error as string);
      } else {
        setMessage(`Saved ${entries.length} entries`);
        // Reset hours after save
        setRows((prev) => prev.map((r) => ({ ...r, hours: [0, 0, 0, 0, 0, 0, 0] })));
      }
    } finally {
      setSaving(false);
    }
  }

  const dayTotals = DAYS.map((_, dayIdx) =>
    rows.reduce((sum, row) => sum + (row.hours[dayIdx] || 0), 0)
  );
  const grandTotal = dayTotals.reduce((a, b) => a + b, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Timesheet</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setWeekStart(addDays(weekStart, -7))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[200px] text-center text-sm font-medium">
              {formatDate(weekStart)} — {formatDate(addDays(weekStart, 6))}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setWeekStart(addDays(weekStart, 7))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-2 pr-4 text-left font-medium">Case</th>
                {DAYS.map((day, i) => (
                  <th key={day} className="pb-2 px-1 text-center font-medium min-w-[80px]">
                    <div>{day}</div>
                    <div className="text-xs text-muted-foreground">
                      {weekDates[i].toLocaleDateString("en", { month: "short", day: "numeric" })}
                    </div>
                  </th>
                ))}
                <th className="pb-2 pl-2 text-center font-medium">Total</th>
                <th className="pb-2 pl-2 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => {
                const rowTotal = row.hours.reduce((a, b) => a + b, 0);
                return (
                  <tr key={row.caseId} className="border-b">
                    <td className="py-2 pr-4 font-medium truncate max-w-[200px]">
                      {row.caseName}
                    </td>
                    {DAYS.map((_, dayIdx) => (
                      <td key={dayIdx} className="py-2 px-1">
                        <Input
                          type="number"
                          step="0.25"
                          min="0"
                          max="24"
                          value={row.hours[dayIdx] || ""}
                          onChange={(e) =>
                            updateHours(rowIdx, dayIdx, parseFloat(e.target.value) || 0)
                          }
                          className="h-8 w-full text-center"
                        />
                      </td>
                    ))}
                    <td className="py-2 pl-2 text-center font-semibold">
                      {rowTotal.toFixed(2)}
                    </td>
                    <td className="py-2 pl-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeRow(rowIdx)}
                      >
                        &times;
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {/* Totals row */}
              <tr className="font-semibold">
                <td className="py-2 pr-4">Daily Total</td>
                {dayTotals.map((total, i) => (
                  <td key={i} className="py-2 px-1 text-center">
                    {total.toFixed(2)}
                  </td>
                ))}
                <td className="py-2 pl-2 text-center">{grandTotal.toFixed(2)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Add case row */}
        <div className="mt-4 flex gap-2">
          <Input
            placeholder="Case ID (UUID)"
            value={newCaseId}
            onChange={(e) => setNewCaseId(e.target.value)}
            className="max-w-xs"
          />
          <Input
            placeholder="Case name (label)"
            value={newCaseName}
            onChange={(e) => setNewCaseName(e.target.value)}
            className="max-w-xs"
          />
          <Button variant="outline" onClick={addRow}>
            Add Case Row
          </Button>
        </div>

        <div className="mt-4 flex items-center justify-between">
          {message && (
            <p className={`text-sm ${message.includes("error") || message.includes("No") ? "text-destructive" : "text-green-600"}`}>
              {message}
            </p>
          )}
          <Button onClick={handleSave} disabled={saving || rows.length === 0} className="ml-auto">
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Week"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
