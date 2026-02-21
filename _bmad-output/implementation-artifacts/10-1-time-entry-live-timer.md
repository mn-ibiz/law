# Story 10.1: Time Entry CRUD & Live Timer Widget

Status: ready-for-dev

## Story

As an Attorney,
I want to log time manually and with a live timer,
so that billable work is accurately captured.

## Acceptance Criteria (ACs)

1. Time tracking page with DataTable: search, filter by date range, attorney, case, billing type (billable/non-billable), and invoiced status
2. Manual time entry form with fields: case (required, searchable), date (defaults today), duration (HH:MM input or decimal hours), description (required), billable/non-billable radio, hourly rate (auto-populated from attorney profile or case rate), total amount auto-calculated (duration x rate)
3. Live Timer Widget: floating bottom-right corner, always visible across all dashboard pages
4. Timer expandable UI: timer display (HH:MM:SS), case dropdown (searchable), description text field
5. Timer controls: Start, Pause, Resume, Stop, Discard buttons
6. Timer visual states: Green = running, Yellow = paused, Gray = stopped
7. Timer state persisted in localStorage to survive page refreshes and navigation
8. On Stop: auto-create a time entry with calculated duration, pre-fill case and description from timer context
9. Time rounding: nearest 6 minutes (0.1 hour increment)
10. Edit and delete own time entries (restricted if entry is already invoiced)
11. Bulk time entry form for entering multiple entries at once

## Tasks / Subtasks

- [ ] **Task 1: Zod validation schemas for time entries** (AC 2, 11)
  - [ ] Create `src/lib/validators/time-entries.ts`
  - [ ] `timeEntrySchema`: case ID (required), date, duration (supports HH:MM string and decimal number), description (required, min 5 chars), billing type enum (billable/non-billable), hourly rate (positive number), notes
  - [ ] `bulkTimeEntrySchema`: array of time entry schemas with max 20 entries
  - [ ] Duration parsing utility: convert "1:30" to 1.5 decimal hours and vice versa

- [ ] **Task 2: Server actions for time entry CRUD** (AC 2, 8, 9, 10)
  - [ ] Create `src/lib/actions/time-entries.ts`
  - [ ] `createTimeEntry(data)` — validate, apply 6-min rounding, calculate total (duration x rate), insert record, audit log
  - [ ] `updateTimeEntry(id, data)` — check ownership, check not invoiced, validate, update, audit log
  - [ ] `deleteTimeEntry(id)` — check ownership, check not invoiced, soft-delete, audit log
  - [ ] `createBulkTimeEntries(entries)` — validate array, insert all, audit log
  - [ ] `createTimeEntryFromTimer(data)` — called on timer stop, rounds duration, auto-creates entry

- [ ] **Task 3: Data queries for time entries** (AC 1)
  - [ ] Create `src/lib/queries/time-entries.ts`
  - [ ] `getTimeEntries(filters)` — paginated, filterable by date range, attorney, case, billable/non-billable, invoiced status; searchable by description
  - [ ] `getTimeEntriesByCase(caseId)` — for case billing tab
  - [ ] `getTimeEntriesByAttorney(attorneyId, dateRange)` — for attorney detail and weekly view
  - [ ] `getUnbilledTimeEntries(caseId)` — entries not yet linked to an invoice (used in Story 11.1)
  - [ ] `getWeeklyTimeSummary(attorneyId, weekStart)` — aggregated by case per day

- [ ] **Task 4: Duration utility functions** (AC 9)
  - [ ] Create or add to `src/lib/utils/time.ts`
  - [ ] `roundToNearestSixMinutes(decimalHours): number` — round to nearest 0.1
  - [ ] `parseHHMM(input: string): number` — "1:30" -> 1.5
  - [ ] `formatDecimalToHHMM(decimal: number): string` — 1.5 -> "1:30"
  - [ ] `formatSecondsToHHMMSS(seconds: number): string` — for timer display
  - [ ] `calculateTotal(duration: number, rate: number): number` — returns KES amount

- [ ] **Task 5: Time entries list page with DataTable** (AC 1)
  - [ ] Create `src/app/(dashboard)/time-tracking/page.tsx` as Server Component
  - [ ] DataTable columns: date, case (link), description (truncated), duration (HH:MM), rate (KES), total (KES), billable badge, invoiced badge, actions
  - [ ] Filter bar: date range picker, attorney dropdown (admin sees all), case dropdown, billable/non-billable toggle, invoiced toggle
  - [ ] Summary row or card: total hours, total billable hours, total KES amount for current filter
  - [ ] "New Time Entry" button and "Bulk Entry" button

- [ ] **Task 6: Manual time entry form** (AC 2)
  - [ ] Create `src/components/forms/time-entry-form.tsx`
  - [ ] Case searchable combobox (required)
  - [ ] Date picker defaulting to today
  - [ ] Duration input with HH:MM mask and decimal toggle
  - [ ] Description textarea (required)
  - [ ] Billable/non-billable radio group
  - [ ] Hourly rate field auto-populated from attorney's default rate, editable
  - [ ] Total amount display (read-only, auto-calculated)
  - [ ] Form rendered in a Sheet/Dialog

- [ ] **Task 7: Live Timer Widget** (AC 3, 4, 5, 6, 7, 8)
  - [ ] Create `src/components/shared/timer-widget.tsx` as Client Component
  - [ ] Create `src/lib/hooks/useTimer.ts` custom hook
  - [ ] Hook manages: isRunning, isPaused, elapsed seconds, case ID, description
  - [ ] Persist state to `localStorage` key `law-firm-timer-state`
  - [ ] On mount: restore state from localStorage, resume counting if was running
  - [ ] Floating button (bottom-right, fixed position, z-50) showing elapsed time
  - [ ] Click to expand: shows HH:MM:SS display, case combobox, description textarea
  - [ ] Buttons: Start (green), Pause (yellow), Resume (green), Stop (triggers save), Discard (clears without saving)
  - [ ] Color coding: border/ring green=running, yellow=paused, gray=stopped
  - [ ] On Stop: call `createTimeEntryFromTimer()` with elapsed time + case + description
  - [ ] Include in `src/app/(dashboard)/layout.tsx` so it appears on all dashboard pages

- [ ] **Task 8: Bulk time entry form** (AC 11)
  - [ ] Create `src/components/forms/bulk-time-entry-form.tsx`
  - [ ] Dynamic row form: add/remove rows, each row has case, date, duration, description, billable toggle
  - [ ] Submit all rows at once via `createBulkTimeEntries`
  - [ ] Accessible from time tracking page

- [ ] **Task 9: Auto-populate hourly rate logic** (AC 2)
  - [ ] When case is selected, fetch case billing type and rate
  - [ ] If hourly: use case-specific rate if set, else attorney's default rate
  - [ ] If flat fee/contingency/pro bono: still allow time logging for tracking (rate=0 or non-billable)
  - [ ] Rate hierarchy: case rate > attorney rate > firm default rate

## Dev Notes

- The timer widget is the most critical UX component in this story; it must be rock-solid with localStorage persistence
- Timer should use `setInterval` at 1-second ticks for the display; actual elapsed time should be calculated from `startTime` timestamps (not accumulated intervals) to avoid drift
- localStorage schema suggestion: `{ isRunning: boolean, isPaused: boolean, startTimestamp: number, pausedAt: number, totalPausedMs: number, caseId: string | null, description: string }`
- All KES amounts must use the standard formatter: `new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' })`
- 6-minute rounding: `Math.round(decimalHours * 10) / 10` — this rounds 0.05 up to 0.1, 0.04 down to 0.0
- The timer widget should not interfere with page content; use `fixed` positioning with appropriate `z-index`
- Admin can view/filter all attorneys' time entries; attorneys see only their own entries by default
- Invoiced entries should have a lock icon and disabled edit/delete actions with a tooltip explaining why

### Project Structure Notes

Files to create:
- `src/lib/validators/time-entries.ts` — Zod schemas
- `src/lib/actions/time-entries.ts` — server actions
- `src/lib/queries/time-entries.ts` — data queries
- `src/lib/utils/time.ts` — duration parsing and formatting utilities
- `src/lib/hooks/useTimer.ts` — custom timer hook with localStorage
- `src/app/(dashboard)/time-tracking/page.tsx` — time entries list page
- `src/components/forms/time-entry-form.tsx` — manual entry form
- `src/components/forms/bulk-time-entry-form.tsx` — bulk entry form
- `src/components/shared/timer-widget.tsx` — floating timer widget

Files to modify:
- `src/app/(dashboard)/layout.tsx` — add `<TimerWidget />` to layout

### References

- [Source: a.md - Module 8: Time & Expense Tracking]
- [Source: epics.md - Epic 10, Story 10.1]
- [Source: a.md - Timer Widget Behavior section]
- [Source: a.md - Architecture Patterns: Server Actions for all mutations]

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
