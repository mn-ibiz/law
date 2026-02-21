# Story 8.1: Calendar Views with Court Calendar

Status: ready-for-dev

## Story

As an Admin/Attorney,
I want calendar views with a separate court calendar,
so that I see my schedule and never miss court dates.

## Acceptance Criteria (ACs)

1. **Month, Week, and Day views** — calendar page supports three view modes: Month (grid of days with event dots/badges), Week (7-day columns with time slots), Day (single day with hourly time slots); view toggle prominently displayed.
2. **Separate Court Calendar toggle** — a toggle/switch to show "All Events" or "Court Events Only"; when in court calendar mode, only court-related events (hearings, mentions, rulings, judgments) are displayed.
3. **Color coding by event type** — consistent color scheme: Court dates = Red, Meetings = Blue, Deadlines = Orange, Depositions = Purple, Other = Gray; color legend displayed on the calendar page.
4. **Click date to create event** — clicking an empty time slot or date cell opens the event creation form pre-filled with the selected date/time.
5. **Event popup on click** — clicking an existing event shows a popup/dialog with: title, type badge, time, case link (if associated), attendees list; "Edit" and "Delete" buttons on the popup.
6. **Filter by attorney, case, event type, branch** — filter bar above the calendar; filters apply to all views; filtered state persisted in URL search params.
7. **Mini calendar for navigation** — small month calendar in the sidebar or above the main calendar for quick date navigation; clicking a date scrolls/navigates the main calendar.
8. **Attorney event visibility** — attorneys see their own events plus events on their assigned cases; admins see all events with optional filters by attorney.

## Tasks / Subtasks

- [ ] **Build calendar page layout** (AC 1, 2, 6, 7)
  - [ ] `src/app/(dashboard)/calendar/page.tsx` — server component loading initial events
  - [ ] View toggle: Month / Week / Day (shadcn ToggleGroup or Tabs)
  - [ ] Court Calendar toggle switch
  - [ ] Filter bar: attorney dropdown, case searchable dropdown, event type multi-select, branch dropdown
  - [ ] Mini calendar in sidebar area
- [ ] **Build month view component** (AC 1, 3, 4, 5)
  - [ ] `src/components/calendar/month-view.tsx` — 6-week grid layout
  - [ ] Each day cell: date number, event indicators (colored dots or short bars)
  - [ ] Click empty area to create event on that date
  - [ ] Click event to show popup
  - [ ] Current day highlighted
  - [ ] Days outside current month dimmed
- [ ] **Build week view component** (AC 1, 3, 4, 5)
  - [ ] `src/components/calendar/week-view.tsx` — 7 columns with hourly rows
  - [ ] Events displayed as colored blocks spanning their time range
  - [ ] All-day events shown in a top section
  - [ ] Click empty time slot to create event at that time
  - [ ] Click event block to show popup
  - [ ] Scrollable time column (6 AM to 9 PM visible by default)
- [ ] **Build day view component** (AC 1, 3, 4, 5)
  - [ ] `src/components/calendar/day-view.tsx` — single column with hourly rows
  - [ ] Events as colored blocks with full title visible
  - [ ] All-day events at top
  - [ ] Click empty slot to create event
  - [ ] Click event for popup
- [ ] **Build event popup component** (AC 5)
  - [ ] `src/components/calendar/event-popup.tsx` — popover or dialog on event click
  - [ ] Shows: title, type badge (colored), time range, location/virtual link, case link, attendees with avatars
  - [ ] "Edit" button opens event edit form
  - [ ] "Delete" button with confirmation
  - [ ] Close on click outside
- [ ] **Build mini calendar component** (AC 7)
  - [ ] `src/components/calendar/mini-calendar.tsx` — small month grid
  - [ ] Click date to navigate main calendar to that date
  - [ ] Month/year navigation arrows
  - [ ] Dots on dates that have events
  - [ ] Current date highlighted
- [ ] **Build event color coding system** (AC 3)
  - [ ] `src/lib/utils/calendar-colors.ts` — color mapping constant
  - [ ] Map event types to Tailwind CSS classes: Court=red-500, Meeting=blue-500, Deadline=orange-500, Deposition=purple-500, Other=gray-400
  - [ ] Color legend component
- [ ] **Build calendar event queries** (AC 1, 2, 6, 8)
  - [ ] `src/lib/queries/calendar.ts` — getEvents(filters: CalendarFilters)
  - [ ] Filters: dateRange (start, end), attorneyId, caseId, eventType[], branchId, courtOnly (boolean)
  - [ ] For attorneys: filter to own events + assigned case events
  - [ ] For admins: all events with optional filters
  - [ ] Optimize query for date range (index on start_date)
- [ ] **Implement Court Calendar toggle** (AC 2)
  - [ ] Toggle component that filters events to court-related types only
  - [ ] Court event types: 'court_date', 'hearing', 'mention', 'ruling', 'judgment'
  - [ ] Visual indicator when court calendar is active (header color change or banner)
- [ ] **Build filter bar** (AC 6)
  - [ ] `src/components/calendar/calendar-filters.tsx`
  - [ ] Attorney dropdown (admin only, hidden for attorney role)
  - [ ] Case searchable dropdown
  - [ ] Event type multi-select checkboxes
  - [ ] Branch dropdown (if multi-branch enabled)
  - [ ] Persist filter state in URL search params for shareability
- [ ] **Implement date navigation** (AC 1, 7)
  - [ ] Today button to jump to current date
  - [ ] Previous/Next arrows for navigating by month/week/day
  - [ ] Date range display in header (e.g., "February 2026" for month, "Feb 16-22, 2026" for week)
- [ ] **Add loading skeletons** (AC 1)
  - [ ] Skeleton for calendar grid (month, week, day views)
  - [ ] Empty state for calendar with no events

## Dev Notes

### Architecture Patterns
- The calendar is primarily a Client Component due to heavy interactivity (view switching, clicking, filtering); initial events are loaded server-side and passed as props
- Event data for the current view range should be fetched; as the user navigates to different date ranges, fetch new events via server action or API route
- Consider using a custom calendar implementation rather than a heavy library like FullCalendar to keep bundle size small and maintain full control over styling with Tailwind
- The Week and Day views require precise time-slot positioning; calculate top offset and height based on event start/end times
- Court Calendar toggle is essentially a pre-applied filter; it can coexist with other filters

### Calendar Grid Implementation
For the Month view, generate a 6x7 grid:
```typescript
// Generate calendar grid for a month
function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startDate = startOfWeek(firstDay); // Sunday
  const days = [];
  for (let i = 0; i < 42; i++) {
    days.push(addDays(startDate, i));
  }
  return days;
}
```

### Event Type Color Map
```typescript
const EVENT_COLORS: Record<string, string> = {
  court_date: 'bg-red-500 text-white',
  hearing: 'bg-red-500 text-white',
  mention: 'bg-red-400 text-white',
  ruling: 'bg-red-600 text-white',
  judgment: 'bg-red-700 text-white',
  meeting: 'bg-blue-500 text-white',
  deadline: 'bg-orange-500 text-white',
  deposition: 'bg-purple-500 text-white',
  filing: 'bg-yellow-500 text-black',
  sol: 'bg-orange-600 text-white',
  conference: 'bg-teal-500 text-white',
  other: 'bg-gray-400 text-white',
};
```

### Libraries
- shadcn/ui: Popover, Dialog, Calendar (for mini-calendar and date pickers), ToggleGroup, Select, Checkbox, Badge
- `date-fns` — extensive use for date calculations: startOfMonth, endOfMonth, startOfWeek, addDays, format, isSameDay, isSameMonth, etc.
- Lucide icons: Calendar, ChevronLeft, ChevronRight, Plus, Filter

### Project Structure Notes

Files to create:
- `src/app/(dashboard)/calendar/page.tsx` — calendar page
- `src/components/calendar/month-view.tsx` — month grid view
- `src/components/calendar/week-view.tsx` — week time-slot view
- `src/components/calendar/day-view.tsx` — day time-slot view
- `src/components/calendar/event-popup.tsx` — event detail popup
- `src/components/calendar/mini-calendar.tsx` — navigation mini-calendar
- `src/components/calendar/calendar-filters.tsx` — filter bar
- `src/lib/utils/calendar-colors.ts` — color mapping
- `src/lib/queries/calendar.ts` — calendar event queries

Files to modify:
- `src/components/layout/sidebar.tsx` — add Calendar nav item under Work group

### References

- [Source: a.md - Module 7: Calendar & Deadlines] — calendar views, event types, color coding, SoL warnings
- [Source: a.md - Module 16: Kenya Court & E-Filing Integration] — separate court calendar, court date types
- [Source: epics.md - Epic 8, Story 8.1] — acceptance criteria
- [Source: a.md - Feature Gap Analysis #10] — Court Calendar Separate from General Calendar as MUST-HAVE
- [Source: a.md - Best Practices from WakiliCMS] — "Separate court calendar from general calendar -- attorneys need to see court dates at a glance"

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
