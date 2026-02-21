# Story 8.2: Calendar Events CRUD & Deadline Tracker

Status: ready-for-dev

## Story

As an Admin/Attorney,
I want to manage events and track deadlines with SoL warnings,
so that critical dates are captured.

## Acceptance Criteria (ACs)

1. **Event form** — captures: title (required), type (required: Court Date / Hearing / Mention / Ruling / Judgment / Deposition / Meeting / Deadline / Filing / SoL / Conference / Other), case (searchable dropdown), start date/time (required), end date/time or All Day toggle, location or virtual link, description, attendees (multi-select attorneys), recurring pattern (RRULE compatible: None / Daily / Weekly / Bi-weekly / Monthly / Custom), reminder (None / 15min / 30min / 1hr / 1day / 1week), is_court_date auto-set based on type selection.
2. **Drag-and-drop rescheduling** — events on the calendar week/day views can be dragged to a new time slot to reschedule; triggers an update action with the new start/end times.
3. **Deadline tracker page** — dedicated page with DataTable showing all deadlines; columns: title, case (linked), due date, priority badge, assigned to, status, days remaining; filter by priority, attorney, case, status, date range.
4. **Deadline form** — captures: title (required), case (required, searchable dropdown), due date (required), priority (Low / Medium / High / Urgent), assigned to (attorney dropdown), description.
5. **SoL warnings** — Statute of Limitations date tracked per case; warning thresholds: 90 days = info notification, 60 days = warning notification, 30 days = urgent notification + dashboard highlight, 7 days = critical alert + email notification, overdue = red banner on case detail page.
6. **Court Rules Engine** — auto-calculate deadlines from court dates; rules such as "file response within 14 days of hearing", "submit documents 3 days before hearing"; when a court date is scheduled, auto-create corresponding deadline events based on applicable court rules.

## Tasks / Subtasks

- [ ] **Create Zod schemas for events and deadlines** (AC 1, 4)
  - [ ] `src/lib/validators/calendar.ts` — calendarEventSchema, deadlineSchema
  - [ ] Event: title required, type enum, start datetime required, end datetime or all-day flag, URL validation for virtual link, RRULE string validation
  - [ ] Deadline: title required, case required, due date required, priority enum
- [ ] **Build event CRUD server actions** (AC 1, 2)
  - [ ] `src/lib/actions/calendar.ts` — createEvent, updateEvent, deleteEvent, rescheduleEvent
  - [ ] createEvent: validate, create event record, create event_attendees records, schedule reminder
  - [ ] Auto-set is_court_date when type is court-related
  - [ ] Create case timeline event when court date scheduled (via createTimelineEvent from Story 6.3)
  - [ ] Handle recurring events: store RRULE pattern; generate instances on query
  - [ ] rescheduleEvent: update start/end times (for drag-and-drop)
  - [ ] Audit log on all operations
- [ ] **Build event form component** (AC 1)
  - [ ] `src/components/forms/event-form.tsx` — react-hook-form
  - [ ] Title input
  - [ ] Type selector (dropdown with all event types)
  - [ ] Case searchable dropdown (optional)
  - [ ] Start date/time picker
  - [ ] End date/time picker OR All Day toggle
  - [ ] Location text input / Virtual link URL input
  - [ ] Description textarea
  - [ ] Attendees multi-select (searchable, shows attorney names with avatars)
  - [ ] Recurring pattern selector (None, Daily, Weekly, Bi-weekly, Monthly)
  - [ ] Reminder selector (None, 15min, 30min, 1hr, 1day, 1week)
  - [ ] Auto-set is_court_date indicator when court type selected
- [ ] **Implement drag-and-drop rescheduling** (AC 2)
  - [ ] Update week and day view components from Story 8.1
  - [ ] Make event blocks draggable
  - [ ] On drop: calculate new start/end based on drop position
  - [ ] Call rescheduleEvent server action
  - [ ] Optimistic update with rollback on error
  - [ ] Confirmation toast on successful reschedule
- [ ] **Build deadline CRUD server actions** (AC 4)
  - [ ] `src/lib/actions/deadlines.ts` — createDeadline, updateDeadline, completeDeadline, deleteDeadline
  - [ ] createDeadline: create record, create timeline event on associated case
  - [ ] completeDeadline: mark as done, create timeline event
  - [ ] Audit log entries
- [ ] **Build deadline tracker page** (AC 3, 4)
  - [ ] `src/app/(dashboard)/deadlines/page.tsx` — DataTable of all deadlines
  - [ ] Columns: title, case number (linked), due date, priority badge (color-coded), assigned to (avatar + name), status badge, days remaining (calculated, color-coded)
  - [ ] Filter bar: priority dropdown, attorney dropdown, case dropdown, status dropdown, date range picker
  - [ ] Sort by due date (ascending default)
  - [ ] "New Deadline" button opening deadline form dialog
  - [ ] Row actions: Edit, Complete, Delete
  - [ ] Overdue deadlines highlighted (red row background or red text)
- [ ] **Build deadline form component** (AC 4)
  - [ ] `src/components/forms/deadline-form.tsx` — react-hook-form
  - [ ] Title (required)
  - [ ] Case searchable dropdown (required)
  - [ ] Due date picker (required)
  - [ ] Priority selector (Low/Medium/High/Urgent)
  - [ ] Assigned to attorney dropdown
  - [ ] Description textarea
- [ ] **Implement SoL warning system** (AC 5)
  - [ ] `src/lib/utils/sol-warnings.ts` — calculateSoLWarningLevel(solDate: Date)
  - [ ] Returns: 'safe' (>90d), 'info' (60-90d), 'warning' (30-60d), 'urgent' (7-30d), 'critical' (<7d), 'overdue' (past)
  - [ ] Create notification utility: checkSoLWarnings() — queries all cases with SoL dates and creates appropriate notifications
  - [ ] Dashboard highlight: cases with SoL < 30d shown in dashboard warnings widget
  - [ ] Case detail: overdue SoL shows red banner at top of page
  - [ ] Cron endpoint: `src/app/api/cron/sol-warnings/route.ts` — check SoL dates and create/send notifications
- [ ] **Build Court Rules Engine** (AC 6)
  - [ ] `src/lib/utils/court-rules.ts` — court rule definitions and deadline calculator
  - [ ] Define rules per court type / event type:
    - Hearing scheduled -> "File response within 14 days" deadline
    - Hearing scheduled -> "Submit documents 3 days before hearing" deadline
    - Mention scheduled -> "Prepare notes 1 day before" task
    - Filing deadline -> "File by close of business" reminder
  - [ ] `src/lib/actions/court-rules.ts` — applyCourtRules(caseId, courtDate, eventType)
  - [ ] Called when a court date event is created
  - [ ] Auto-creates deadline events based on matching rules
  - [ ] Creates notifications for assigned attorneys
  - [ ] Rules configurable via admin settings (future: Epic 16)
- [ ] **Add loading skeletons and empty states** (AC 3)
  - [ ] Skeleton for deadline tracker DataTable
  - [ ] Empty state: "No deadlines yet -- create your first deadline"

## Dev Notes

### Architecture Patterns
- Calendar events and deadlines are separate entities in the database but related: a deadline can optionally appear on the calendar; a calendar event can be of type "Deadline"
- Recurring events: store the RRULE pattern on the parent event; when querying for a date range, expand the RRULE to generate individual occurrences; consider a library like `rrule` for RRULE parsing/expansion
- SoL warnings require a background check mechanism; for MVP, use a cron endpoint called daily by Vercel Cron or Windows Task Scheduler
- The Court Rules Engine is a foundational component that will be expanded in Epic 16; start with hardcoded rules and make them data-driven later
- Drag-and-drop rescheduling should update both start and end times, maintaining the same duration

### SoL Warning Thresholds
```typescript
const SOL_THRESHOLDS = [
  { days: 90, level: 'info', action: 'notification' },
  { days: 60, level: 'warning', action: 'notification' },
  { days: 30, level: 'urgent', action: 'notification+dashboard' },
  { days: 7, level: 'critical', action: 'notification+email' },
  { days: 0, level: 'overdue', action: 'banner+email+alert' },
];
```

### Court Rules (Initial Set)
```typescript
const COURT_RULES = [
  { trigger: 'hearing', action: 'create_deadline', description: 'File response', daysOffset: -14 },
  { trigger: 'hearing', action: 'create_deadline', description: 'Submit documents', daysOffset: -3 },
  { trigger: 'mention', action: 'create_task', description: 'Prepare mention notes', daysOffset: -1 },
  { trigger: 'ruling', action: 'create_deadline', description: 'File appeal (if applicable)', daysOffset: 30 },
];
```

### Libraries
- `rrule` — RRULE parsing and occurrence generation for recurring events
- `@dnd-kit/core` — drag-and-drop for event rescheduling on calendar
- `date-fns` — differenceInDays, addDays, subDays, format for date calculations
- shadcn/ui: Dialog, Form, DatePicker (Calendar + Popover), TimePicker (custom or use Input type="time"), Select, Checkbox, Badge, Table
- @tanstack/react-table for deadline tracker DataTable
- Lucide icons: Clock (deadline), AlertTriangle (warning), Calendar (event), Gavel (court)

### Project Structure Notes

Files to create:
- `src/app/(dashboard)/deadlines/page.tsx` — deadline tracker page
- `src/components/forms/event-form.tsx` — calendar event form
- `src/components/forms/deadline-form.tsx` — deadline form
- `src/lib/validators/calendar.ts` — Zod schemas for events and deadlines
- `src/lib/actions/calendar.ts` — event server actions
- `src/lib/actions/deadlines.ts` — deadline server actions
- `src/lib/actions/court-rules.ts` — court rules engine actions
- `src/lib/utils/sol-warnings.ts` — SoL warning level calculator
- `src/lib/utils/court-rules.ts` — court rule definitions
- `src/app/api/cron/sol-warnings/route.ts` — SoL check cron endpoint

Files to modify:
- `src/components/calendar/week-view.tsx` — add drag-and-drop rescheduling
- `src/components/calendar/day-view.tsx` — add drag-and-drop rescheduling
- `src/components/calendar/month-view.tsx` — integrate event creation on click
- `src/components/cases/overview-tab.tsx` — display overdue SoL red banner
- `src/app/(dashboard)/dashboard/page.tsx` — add SoL warning highlights
- `src/components/layout/sidebar.tsx` — add Deadlines nav item under Work group

### References

- [Source: a.md - Module 7: Calendar & Deadlines] — event form fields, deadline form fields, SoL warning thresholds, task management
- [Source: epics.md - Epic 8, Story 8.2] — acceptance criteria
- [Source: a.md - Module 22: Automated Workflows] — court rules engine concept, auto-calculate deadlines from court dates
- [Source: a.md - Best Practices from Clio] — "Court rules engine -- auto-calculate deadlines from court dates"

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
