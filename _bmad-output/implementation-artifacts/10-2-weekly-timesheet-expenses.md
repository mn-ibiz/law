# Story 10.2: Weekly Timesheet & Expense Logging

Status: ready-for-dev

## Story

As an Attorney,
I want a weekly timesheet and expense logging with receipts,
so that hours and costs are tracked for billing.

## Acceptance Criteria (ACs)

1. Weekly timesheet view: grid layout with rows = cases, columns = Monday through Sunday
2. Cell click to add or edit a time entry for that case/day combination
3. Week navigation: previous/next week buttons, date range display, "This Week" quick-jump
4. Row totals (total hours per case for the week), column totals (total hours per day), and grand total for the entire week
5. Billable vs non-billable breakdown visible in the timesheet summary
6. Expense list page with DataTable: filter by date range, case, category, attorney, and billable status
7. Expense form: case (required), date (defaults today), category (Filing Fee/Court Cost/Travel/Copy/Postage/Expert Witness/Process Server/Commissioner for Oaths Fee/Search Fee/Stamp Duty/Other), description (required), amount in KES, vendor name, receipt file upload, billable checkbox
8. Edit and delete own expenses (not allowed once marked as invoiced)
9. Expenses marked as "Invoiced" automatically when included in a fee note

## Tasks / Subtasks

- [ ] **Task 1: Zod validation schemas for expenses** (AC 7)
  - [ ] Create `src/lib/validators/expenses.ts`
  - [ ] `expenseSchema`: case ID (required), date, category enum (Filing Fee, Court Cost, Travel, Copy, Postage, Expert Witness, Process Server, Commissioner for Oaths Fee, Search Fee, Stamp Duty, Other), description (required), amount (positive number, KES), vendor (optional string), receipt file (optional, max 10MB, PDF/JPG/PNG), billable (boolean, default true)

- [ ] **Task 2: Server actions for expenses** (AC 7, 8, 9)
  - [ ] Create `src/lib/actions/expenses.ts`
  - [ ] `createExpense(formData)` — validate, upload receipt to storage if present, insert record, audit log
  - [ ] `updateExpense(id, formData)` — check ownership, check not invoiced, validate, update, audit log
  - [ ] `deleteExpense(id)` — check ownership, check not invoiced, soft-delete, audit log
  - [ ] `markExpensesInvoiced(expenseIds, invoiceId)` — called from billing flow (Story 11.1), marks expenses as invoiced

- [ ] **Task 3: Data queries for expenses** (AC 6)
  - [ ] Create `src/lib/queries/expenses.ts`
  - [ ] `getExpenses(filters)` — paginated, filterable by date range, case, category, attorney, billable
  - [ ] `getExpensesByCase(caseId)` — for case billing tab
  - [ ] `getUnbilledExpenses(caseId)` — expenses not yet invoiced (used in Story 11.1)
  - [ ] `getExpenseSummary(filters)` — totals by category for reporting

- [ ] **Task 4: Weekly timesheet data query** (AC 1, 3, 4, 5)
  - [ ] Add to `src/lib/queries/time-entries.ts`:
  - [ ] `getWeeklyTimesheet(attorneyId, weekStartDate)` — returns time entries grouped by case and day
  - [ ] Structure: `{ cases: [{ caseId, caseNumber, caseTitle, entries: { mon: hours, tue: hours, ..., sun: hours }, total: hours }], dailyTotals: { mon: hours, ..., sun: hours }, grandTotal: hours, billableTotal: hours, nonBillableTotal: hours }`

- [ ] **Task 5: Weekly timesheet page** (AC 1, 2, 3, 4, 5)
  - [ ] Create `src/app/(dashboard)/time-tracking/timesheet/page.tsx`
  - [ ] Week navigation header: left arrow, date range "Mon DD - Sun DD, YYYY", right arrow, "This Week" button
  - [ ] Grid component: rows = cases attorney has logged time on, columns = Mon-Sun
  - [ ] Each cell shows hours logged (e.g., "2.5"); click to open time entry form pre-filled with case + date
  - [ ] Empty cells show "+" icon on hover; click to create new entry for that case/day
  - [ ] Row totals column on the right, day totals row at the bottom
  - [ ] Grand total with billable/non-billable breakdown
  - [ ] "Add Case" row to add a new case to the timesheet grid
  - [ ] Link from main time tracking page

- [ ] **Task 6: Timesheet cell interaction** (AC 2)
  - [ ] Create `src/components/shared/timesheet-cell.tsx` as Client Component
  - [ ] Click on populated cell: open time entry edit form in Dialog
  - [ ] Click on empty cell: open new time entry form pre-filled with case ID and date
  - [ ] Display hours with color: green for billable, gray for non-billable
  - [ ] If multiple entries exist for same case/day, show total and list on click

- [ ] **Task 7: Expense list page with DataTable** (AC 6)
  - [ ] Create `src/app/(dashboard)/expenses/page.tsx` as Server Component
  - [ ] DataTable columns: date, case (link), category badge, description (truncated), amount (KES formatted), vendor, billable badge, invoiced badge, receipt icon (link to download), actions
  - [ ] Filter bar: date range picker, case dropdown, category dropdown, attorney dropdown (admin only), billable toggle
  - [ ] Summary cards: total expenses, billable total, non-billable total for current filter
  - [ ] "New Expense" button

- [ ] **Task 8: Expense form with receipt upload** (AC 7)
  - [ ] Create `src/components/forms/expense-form.tsx`
  - [ ] Case searchable combobox (required)
  - [ ] Date picker defaulting to today
  - [ ] Category dropdown with Kenya-specific options
  - [ ] Description textarea (required)
  - [ ] Amount input with KES prefix
  - [ ] Vendor name text input
  - [ ] Receipt file upload (drag-and-drop, PDF/JPG/PNG, max 10MB)
  - [ ] Billable checkbox (default checked)
  - [ ] Receipt preview thumbnail if uploaded
  - [ ] Form rendered in Sheet/Dialog

- [ ] **Task 9: Expense receipt storage** (AC 7)
  - [ ] Use storage abstraction from Story 9.1 (`src/lib/storage/`)
  - [ ] Store receipts with key pattern: `receipts/{expenseId}/{filename}`
  - [ ] Receipt URL stored in expense record

- [ ] **Task 10: Navigation updates** (AC 1, 6)
  - [ ] Add "Timesheet" sub-nav under Time Tracking section
  - [ ] Ensure "Expenses" nav item links to expenses page

## Dev Notes

- The weekly timesheet grid is the centerpiece of this story; it should feel spreadsheet-like with quick cell interactions
- For the timesheet grid, use a standard HTML `<table>` with sticky headers rather than @tanstack/react-table, since it is a fixed 7-column grid rather than a data table
- Week start is Monday (standard in Kenya business); use `date-fns` `startOfWeek` with `{ weekStartsOn: 1 }`
- The timesheet should work purely from time entries — it is a different view of the same data, not a separate data model
- Expense categories are Kenya-specific: Filing Fee, Court Cost, Travel, Copy, Postage, Expert Witness, Process Server, Commissioner for Oaths Fee, Search Fee, Stamp Duty, Other
- All amounts in KES with proper formatting using `Intl.NumberFormat`
- Receipt uploads use the same storage abstraction built in Story 9.1
- The "Invoiced" flag on expenses will be set by the billing flow in Epic 11; this story just needs to respect it (disable edit/delete when invoiced)
- Admin can view all attorneys' expenses; attorneys see only their own by default
- Consider adding an expense total summary card at the top of the expense list page showing totals for the current filter

### Project Structure Notes

Files to create:
- `src/lib/validators/expenses.ts` — Zod schemas
- `src/lib/actions/expenses.ts` — server actions
- `src/lib/queries/expenses.ts` — data queries
- `src/app/(dashboard)/time-tracking/timesheet/page.tsx` — weekly timesheet page
- `src/app/(dashboard)/expenses/page.tsx` — expenses list page
- `src/components/forms/expense-form.tsx` — expense create/edit form
- `src/components/shared/timesheet-cell.tsx` — interactive timesheet cell

Files to modify:
- `src/lib/queries/time-entries.ts` — add `getWeeklyTimesheet` query
- `src/app/(dashboard)/layout.tsx` — add Timesheet and Expenses nav items
- `src/app/(dashboard)/time-tracking/page.tsx` — add link to timesheet view

### References

- [Source: a.md - Module 8: Time & Expense Tracking — Weekly timesheet, expense fields]
- [Source: epics.md - Epic 10, Story 10.2]
- [Source: a.md - Module 18: Financial Management — Kenya expense categories]

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
