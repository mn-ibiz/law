# Story 6.1: Case CRUD with Status Workflow

Status: ready-for-dev

## Story

As an Admin/Attorney,
I want to create and manage cases with defined status transitions,
so that cases progress systematically.

## Acceptance Criteria (ACs)

1. **Case list with DataTable** — searchable, filterable by status, case type, practice area, lead attorney, priority, billing type, branch; supports pagination via @tanstack/react-table.
2. **New case form** — captures: title (required), client (required, searchable dropdown), case type (required, dropdown), practice area (dropdown), lead attorney (required, searchable dropdown), additional attorneys (multi-select), billing type (Hourly / Flat Fee / Contingency / Retainer / Pro Bono) with conditional fields (hourly rate for Hourly, flat fee amount for Flat Fee, contingency percentage for Contingency), court (searchable dropdown from Kenya court hierarchy), opposing counsel, opposing party, statute of limitations date, priority (Low / Medium / High / Urgent), estimated value (KES), branch (dropdown).
3. **Auto-generated case number** — format YYYY-NNNN (e.g., 2026-0001); auto-increments per year; unique constraint enforced at DB level.
4. **Status transitions enforced** — valid transitions: Open -> In Progress -> Hearing <-> In Progress -> Resolved -> Closed -> Archived; admin override for any-to-Closed; status change buttons only show valid next states.
5. **Status change creates timeline event** — every status transition automatically creates a case_timeline entry recording: old status, new status, changed by, timestamp, optional notes.
6. **Conflict check on client selection** — when a client is selected in the case form, auto-trigger conflict check (from Story 5.3) and warn if matches are found.
7. **Case cloning** — "Duplicate" button on case detail page creates a new case with same settings (client, type, practice area, attorneys, billing type, court), new case number, blank timeline and notes.

## Tasks / Subtasks

- [ ] **Create Zod validation schemas for case operations** (AC 2, 4)
  - [ ] `src/lib/validators/case.ts` — createCaseSchema, updateCaseSchema, statusTransitionSchema
  - [ ] Conditional validation for billing type fields (hourly rate required when Hourly, etc.)
  - [ ] Status transition validation: define valid transitions map
- [ ] **Build case number generation utility** (AC 3)
  - [ ] `src/lib/utils/case-number.ts` — generateCaseNumber() function
  - [ ] Query max case number for current year, increment by 1
  - [ ] Format: `${year}-${String(nextNum).padStart(4, '0')}`
  - [ ] Handle race conditions with DB-level unique constraint
- [ ] **Build case creation server action** (AC 2, 3, 5, 6)
  - [ ] `src/lib/actions/cases.ts` — createCase
  - [ ] Validate with Zod, check auth/authorization
  - [ ] Generate case number
  - [ ] Create case record
  - [ ] Create initial case_timeline entry ("Case created")
  - [ ] Create case_assignments for lead and additional attorneys
  - [ ] Audit log entry
  - [ ] revalidatePath for cases list
- [ ] **Build case update and status transition actions** (AC 4, 5)
  - [ ] `src/lib/actions/cases.ts` — updateCase, transitionCaseStatus
  - [ ] transitionCaseStatus: validate transition against allowed transitions map
  - [ ] Create timeline event on status change
  - [ ] Audit log entry
- [ ] **Build case clone action** (AC 7)
  - [ ] `src/lib/actions/cases.ts` — cloneCase
  - [ ] Copy: client, type, practice area, billing type, court info, priority
  - [ ] Generate new case number
  - [ ] Do NOT copy: timeline, notes, documents, invoices
  - [ ] Create initial timeline entry ("Case cloned from YYYY-NNNN")
- [ ] **Build case queries** (AC 1)
  - [ ] `src/lib/queries/cases.ts` — getCases (with filters, pagination, search), getCaseById (with relations), getCaseByNumber
  - [ ] Join with clients, attorneys, practice areas for display
  - [ ] Filter logic for all filterable columns
- [ ] **Build case list page with DataTable** (AC 1)
  - [ ] `src/app/(dashboard)/cases/page.tsx` — server component
  - [ ] Column definitions: case number, title, client name (linked), status badge, type, practice area, lead attorney, priority badge, billing type, branch, created date
  - [ ] Filter bar: status, type, practice area, attorney, priority, billing type, branch
  - [ ] Search across case number, title, client name
  - [ ] "New Case" button
  - [ ] Row click navigates to case detail
- [ ] **Build new case page** (AC 2, 6)
  - [ ] `src/app/(dashboard)/cases/new/page.tsx` — renders case form
  - [ ] `src/components/forms/case-form.tsx` — react-hook-form with all fields
  - [ ] Client searchable dropdown with conflict check trigger on selection
  - [ ] Attorney searchable dropdowns (lead + additional)
  - [ ] Billing type conditional fields (show/hide based on selection)
  - [ ] Court selection from Kenya court hierarchy (cascading: court type -> station)
- [ ] **Build status transition UI** (AC 4, 5)
  - [ ] `src/components/cases/status-transition-buttons.tsx` — shows only valid next states as buttons
  - [ ] Status transition dialog with optional notes field
  - [ ] Confirmation before transition
- [ ] **Define status transition map** (AC 4)
  - [ ] `src/lib/utils/case-status.ts` — STATUS_TRANSITIONS constant defining valid from -> to[] mappings
  - [ ] Include admin override rules
  - [ ] Export status colors/labels for UI consistency
- [ ] **Add loading skeletons and empty states** (AC 1)
  - [ ] Skeleton for case list table
  - [ ] Empty state: "No cases yet -- create your first case"

## Dev Notes

### Architecture Patterns
- Case number generation must handle concurrency: use a DB sequence or SELECT MAX + 1 with a unique constraint to catch race conditions; retry on unique violation
- Status transitions are enforced both client-side (only show valid buttons) and server-side (validate in server action)
- The case form is a Client Component due to dynamic interactions (searchable dropdowns, conditional fields); it receives server-fetched data (clients, attorneys, courts, practice areas) as props
- Court selection follows a cascading pattern: first select court type (Supreme, Appeal, High, etc.), then court station (filtered by type/county) — this integrates with Story 7.1

### Status Transition Map
```typescript
const STATUS_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  open: ['in_progress'],
  in_progress: ['hearing', 'resolved'],
  hearing: ['in_progress', 'resolved'],
  resolved: ['closed'],
  closed: ['archived'],
  archived: [],
};
// Admin override: any status -> closed
```

### Libraries
- `react-hook-form` + `@hookform/resolvers/zod` for form
- `@tanstack/react-table` for DataTable
- shadcn/ui: Card, Form, Input, Select, Badge, Table, Dialog, Button, Combobox (for searchable dropdowns)
- KES formatting utility: `new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' })`

### Project Structure Notes

Files to create:
- `src/app/(dashboard)/cases/page.tsx` — case list page
- `src/app/(dashboard)/cases/new/page.tsx` — new case page
- `src/components/forms/case-form.tsx` — case creation/edit form
- `src/components/cases/status-transition-buttons.tsx` — status buttons
- `src/lib/validators/case.ts` — Zod schemas
- `src/lib/actions/cases.ts` — server actions
- `src/lib/queries/cases.ts` — data access queries
- `src/lib/utils/case-number.ts` — case number generator
- `src/lib/utils/case-status.ts` — status transitions, colors, labels

Files to modify:
- `src/components/layout/sidebar.tsx` — add Cases nav item under Work group
- `src/lib/db/schema/cases.ts` — verify schema includes all required fields

### References

- [Source: a.md - Module 5: Case/Matter Management] — form fields, status transitions, case detail tabs, auto-generated timeline events
- [Source: epics.md - Epic 6, Story 6.1] — acceptance criteria
- [Source: a.md - RBAC Permissions Matrix] — Admin: CRUD all cases, Attorney: CRUD assigned cases
- [Source: a.md - Architecture Patterns] — Server Actions mutation pattern

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
