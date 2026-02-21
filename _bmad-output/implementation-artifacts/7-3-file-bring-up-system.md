# Story 7.3: File Bring-Up System

Status: ready-for-dev

## Story

As an Attorney/Admin,
I want bring-up reminders to revisit files on specific dates,
so that follow-ups are never missed.

## Acceptance Criteria (ACs)

1. **Create bring-up from multiple entry points** — bring-ups can be created from: case detail page (button), dedicated bring-ups page ("New Bring-Up" button), case list quick action (context menu or action button per row).
2. **Bring-up form** — captures: case (required, searchable dropdown), bring-up date (required), assigned to (attorney/staff dropdown), reason/notes (textarea), priority (Low / Medium / High / Urgent), recurring toggle with frequency (Daily / Weekly / Monthly), notification method (multi-select: Email / SMS / In-App).
3. **Status workflow** — bring-up transitions through: Pending -> Reviewed -> Deferred (prompts for new date) -> Completed; status change logged.
4. **Bring-ups list page with tabs** — dedicated page with tab views: Today's Bring-Ups, Upcoming (next 7 days), Overdue, All; each tab shows a filtered DataTable.
5. **Filter by attorney, priority, status, date** — all tabs support filtering by assigned attorney, priority level, status, and date range.
6. **Overdue highlighting** — bring-ups past their due date and still Pending are highlighted in red (red background, red text, or red left border).
7. **Bulk actions** — select multiple bring-ups and perform bulk operations: mark as reviewed, mark as completed, reassign, defer to new date.
8. **Dashboard widget "Today's Bring-Ups"** — widget on the dashboard showing count of bring-ups due today and a quick list; count shown as a badge in the sidebar navigation.
9. **Recurring bring-ups** — when a recurring bring-up is completed, the system automatically creates the next occurrence based on the configured frequency (daily/weekly/monthly).
10. **Notifications per configured method** — send notifications via the method(s) selected on the bring-up: email, SMS (via Africa's Talking API), and/or in-app notification.

## Tasks / Subtasks

- [ ] **Create Zod schemas for bring-ups** (AC 2, 3)
  - [ ] `src/lib/validators/bring-up.ts` — createBringUpSchema, updateBringUpSchema, deferBringUpSchema
  - [ ] Validation: date must be today or future (for new), case required, priority enum, recurring frequency enum
- [ ] **Build bring-up server actions** (AC 1, 3, 9, 10)
  - [ ] `src/lib/actions/bring-ups.ts` — createBringUp, updateBringUpStatus, deferBringUp, completeBringUp, bulkUpdateBringUps
  - [ ] createBringUp: create record, schedule notification based on method
  - [ ] updateBringUpStatus: validate transition (Pending -> Reviewed -> Completed; Pending/Reviewed -> Deferred)
  - [ ] completeBringUp: mark as completed; if recurring, auto-create next occurrence with calculated date
  - [ ] deferBringUp: set status to Deferred, update date to new date, create new Pending bring-up for new date
  - [ ] bulkUpdateBringUps: handle bulk mark reviewed, completed, reassign, defer
  - [ ] Audit log on all operations
- [ ] **Build recurring bring-up logic** (AC 9)
  - [ ] In completeBringUp action: check if recurring is true
  - [ ] Calculate next date: daily (+1 day), weekly (+7 days), monthly (+1 month using date-fns addMonths)
  - [ ] Create new bring-up with same case, assignee, notes, priority, recurring settings
  - [ ] New bring-up starts in Pending status
- [ ] **Build bring-up queries** (AC 4, 5, 6, 8)
  - [ ] `src/lib/queries/bring-ups.ts` — getTodaysBringUps, getUpcomingBringUps, getOverdueBringUps, getAllBringUps, getBringUpsByCase, getBringUpCount
  - [ ] Today's: date = today, status = Pending or Reviewed
  - [ ] Upcoming: date within next 7 days, status = Pending
  - [ ] Overdue: date < today, status = Pending
  - [ ] All: filterable by attorney, priority, status, date range
  - [ ] getBringUpCount: count of today's bring-ups for dashboard badge
- [ ] **Build bring-ups list page** (AC 4, 5, 6, 7)
  - [ ] `src/app/(dashboard)/bring-ups/page.tsx` — page with tab navigation
  - [ ] Tabs: Today's, Upcoming, Overdue, All
  - [ ] DataTable per tab with columns: case number (linked), case title, assigned to, date, priority badge, status badge, actions
  - [ ] Overdue rows: red left border or red background tint
  - [ ] Filter bar: attorney dropdown, priority dropdown, status dropdown, date range picker
  - [ ] Bulk selection checkboxes + bulk action toolbar (Mark Reviewed, Mark Completed, Reassign, Defer)
- [ ] **Build bring-up form component** (AC 2)
  - [ ] `src/components/forms/bring-up-form.tsx` — react-hook-form
  - [ ] Case searchable dropdown (required)
  - [ ] Date picker (required)
  - [ ] Assigned to dropdown (attorney/staff)
  - [ ] Reason/notes textarea
  - [ ] Priority selector (Low/Medium/High/Urgent)
  - [ ] Recurring toggle + frequency selector (Daily/Weekly/Monthly) — shown conditionally
  - [ ] Notification method multi-select (Email, SMS, In-App)
- [ ] **Build bring-up status actions UI** (AC 3)
  - [ ] `src/components/bring-ups/bring-up-actions.tsx` — action buttons per bring-up
  - [ ] "Mark Reviewed" button (Pending -> Reviewed)
  - [ ] "Complete" button (Reviewed -> Completed)
  - [ ] "Defer" button with date picker dialog (any non-completed -> Deferred)
  - [ ] Status transition confirmation
- [ ] **Build dashboard widget** (AC 8)
  - [ ] `src/components/dashboard/todays-bring-ups-widget.tsx` — card showing today's bring-ups count and quick list
  - [ ] Display: count badge, first 5 bring-ups with case number and reason
  - [ ] "View All" link to bring-ups page
  - [ ] Add to attorney and admin dashboards
- [ ] **Add bring-up count badge to sidebar** (AC 8)
  - [ ] Update sidebar nav to show count badge next to "Bring-Ups" nav item
  - [ ] Badge shows count of today's + overdue bring-ups
  - [ ] Fetched via server component or API
- [ ] **Integrate bring-up creation into case detail** (AC 1)
  - [ ] Add "Create Bring-Up" button on case detail page
  - [ ] Pre-fills case field in the bring-up form dialog
- [ ] **Integrate bring-up creation into case list** (AC 1)
  - [ ] Add "Set Bring-Up" as a quick action in case list row actions dropdown
  - [ ] Opens bring-up form dialog pre-filled with selected case
- [ ] **Implement notification dispatch** (AC 10)
  - [ ] On bring-up due date: dispatch notifications based on configured methods
  - [ ] In-App: create notification record via createNotification()
  - [ ] Email: call email service (placeholder or integration from Epic 15)
  - [ ] SMS: call SMS service (placeholder or integration from Epic 14.3)
  - [ ] This requires a trigger mechanism (cron job, scheduled task, or check on page load)

## Dev Notes

### Architecture Patterns
- Bring-ups are a core Kenyan law firm workflow; this is the most-used feature in systems like WakiliCMS
- Notification dispatch for bring-ups requires a scheduled job or similar mechanism; for MVP, notifications can be created when the bring-ups page is loaded or via a Next.js API route called by a cron service
- The bring-up form is reusable across all entry points (case detail, bring-ups page, case list); pass optional pre-filled values as props
- Recurring bring-up creation is a side effect of the complete action; it should be transactional with the completion
- Overdue detection: compare bring-up date to current date server-side; highlight in the UI

### Status Transition Map
```typescript
const BRING_UP_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['reviewed', 'deferred', 'completed'],
  reviewed: ['completed', 'deferred'],
  deferred: ['pending'], // creates new bring-up at new date
  completed: [], // terminal
};
```

### Notification Trigger Strategy
For the MVP, bring-up notifications can be triggered by:
1. A Next.js API route `/api/cron/bring-ups` that checks for due bring-ups and creates notifications
2. This route can be called by Vercel Cron Jobs (vercel.json) or an external cron service
3. On-premise: Windows Task Scheduler can call the API route

### Libraries
- shadcn/ui: Tabs, Table, Dialog, DatePicker (Calendar + Popover), Select, Checkbox, Badge, Card, Button
- @tanstack/react-table for DataTable with row selection (bulk actions)
- `date-fns` — addDays, addWeeks, addMonths for recurring date calculation; isBefore, isToday for status
- Lucide icons: Bell (bring-up), AlertTriangle (overdue), CheckCircle (completed), Clock (pending)

### Project Structure Notes

Files to create:
- `src/app/(dashboard)/bring-ups/page.tsx` — bring-ups list page with tabs
- `src/components/forms/bring-up-form.tsx` — bring-up form
- `src/components/bring-ups/bring-up-actions.tsx` — status action buttons
- `src/components/dashboard/todays-bring-ups-widget.tsx` — dashboard widget
- `src/lib/validators/bring-up.ts` — Zod schemas
- `src/lib/actions/bring-ups.ts` — server actions
- `src/lib/queries/bring-ups.ts` — data queries
- `src/app/api/cron/bring-ups/route.ts` — cron endpoint for notification dispatch (optional for MVP)

Files to modify:
- `src/app/(dashboard)/dashboard/page.tsx` — add Today's Bring-Ups widget
- `src/app/(dashboard)/cases/[id]/page.tsx` — add "Create Bring-Up" button
- `src/app/(dashboard)/cases/page.tsx` — add "Set Bring-Up" to case list row actions
- `src/components/layout/sidebar.tsx` — add Bring-Ups nav item with count badge under Work group

### References

- [Source: a.md - Module 17: File Bring-Up System] — concept explanation, form fields, features, status workflow
- [Source: epics.md - Epic 7, Story 7.3] — acceptance criteria
- [Source: a.md - Best Practices from WakiliCMS] — "File bring-up system -- the single most used feature in Kenyan law firms"
- [Source: a.md - Feature Gap Analysis #3] — File Bring-Up System as MUST-HAVE

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
