# Story 6.2: Case Detail Page with Tabbed Layout

Status: ready-for-dev

## Story

As an Admin/Attorney,
I want a comprehensive case detail page,
so that all case aspects are accessible in one place.

## Acceptance Criteria (ACs)

1. **Case header** — displays: case number, title, status badge (colored), priority badge, client name (linked to client detail), lead attorney name (linked to attorney detail); status transition buttons (showing valid next states only).
2. **Overview tab** — shows: all case details (type, practice area, billing type, court info, court case number, judge, opposing counsel, opposing party, estimated value in KES, description), assigned attorneys list with roles, court information section, key dates (date opened, date filed, SoL date), SoL countdown with color-coded warnings.
3. **SoL countdown warnings** — color-coded: green when >90 days remaining, yellow at 60-90 days, orange at 30-60 days, red at <30 days, flashing/pulsing animation at <7 days; displays "X days remaining" or "OVERDUE" text.
4. **Timeline tab** — chronological list of all auto-generated and manual timeline events; each entry shows: event type icon, description, user who triggered it, timestamp; scrollable with load-more pagination.
5. **Documents tab** — list of documents linked to this case; upload button; filter by document category; each document shows: title, category badge, status, uploaded by, date, download link.
6. **Billing tab** — shows: unbilled time entries total (KES), unbilled expenses total (KES), list of invoices for this case; "Create Invoice" button that pre-fills case and client.
7. **Notes tab** — list of case notes; "Add Note" button; each note has a private/shared toggle (private = attorney-only, shared = visible in client portal); display author, date, content; edit/delete own notes.
8. **Tasks tab** — list of tasks assigned to this case; shows status, priority, assignee, due date; link to task management.
9. **Parties tab** — lists all case parties: client (with contact info link), opposing party, opposing counsel, witnesses, experts; CRUD for parties with name, role, contact info, notes.

## Tasks / Subtasks

- [ ] **Build case detail page layout** (AC 1)
  - [ ] `src/app/(dashboard)/cases/[id]/page.tsx` — server component loading full case data with relations
  - [ ] Case header component with case number, title, status/priority badges
  - [ ] Client and lead attorney name as clickable links
  - [ ] Status transition buttons integrated from Story 6.1
- [ ] **Build case detail tabs container** (AC 2-9)
  - [ ] `src/components/cases/case-detail-tabs.tsx` — shadcn Tabs component with all tab panels
  - [ ] Tabs: Overview, Timeline, Documents, Billing, Notes, Tasks, Parties
- [ ] **Build Overview tab** (AC 2, 3)
  - [ ] `src/components/cases/overview-tab.tsx`
  - [ ] Case details grid layout (2-3 columns on desktop, 1 on mobile)
  - [ ] Assigned attorneys list with role badges (Lead, Assigned, Supervising, Of Counsel)
  - [ ] Court information section (court type, station, court file number, judge, virtual court link)
  - [ ] Key dates section (opened, filed, SoL)
  - [ ] SoL countdown component
- [ ] **Build SoL countdown component** (AC 3)
  - [ ] `src/components/cases/sol-countdown.tsx`
  - [ ] Calculate days remaining from SoL date
  - [ ] Color mapping: green (>90d), yellow (60-90d), orange (30-60d), red (<30d)
  - [ ] Flashing/pulsing CSS animation for <7 days
  - [ ] "OVERDUE" text with red background for past dates
  - [ ] Display "X days remaining" with appropriate icon
- [ ] **Build Timeline tab** (AC 4)
  - [ ] `src/components/cases/timeline-tab.tsx`
  - [ ] Vertical timeline layout with event type icons
  - [ ] Each entry: icon, description, user avatar + name, relative timestamp
  - [ ] Load more pagination (fetch 20 at a time)
  - [ ] "Add Manual Entry" button with form dialog (description, optional type)
  - [ ] Query: `src/lib/queries/cases.ts` — getCaseTimeline(caseId, offset, limit)
- [ ] **Build Documents tab** (AC 5)
  - [ ] `src/components/cases/documents-tab.tsx`
  - [ ] DataTable of documents with columns: title, category, status, uploaded by, date, actions
  - [ ] Category filter dropdown
  - [ ] Upload button (opens document upload dialog linked to this case)
  - [ ] Download and preview actions per document
- [ ] **Build Billing tab** (AC 6)
  - [ ] `src/components/cases/billing-tab.tsx`
  - [ ] Summary cards: unbilled time total (KES), unbilled expenses total (KES)
  - [ ] Time entries table (recent unbilled)
  - [ ] Expenses table (recent unbilled)
  - [ ] Invoices table (all invoices for this case)
  - [ ] "Create Invoice" button linking to billing/new?caseId=X&clientId=Y
  - [ ] Queries: getUnbilledTimeByCase, getUnbilledExpensesByCase, getInvoicesByCase
- [ ] **Build Notes tab** (AC 7)
  - [ ] `src/components/cases/notes-tab.tsx`
  - [ ] Notes list with author, date, content preview
  - [ ] Private/shared badge on each note
  - [ ] "Add Note" dialog with: content textarea, private/shared toggle
  - [ ] Edit/delete actions (own notes only)
  - [ ] Server actions: createCaseNote, updateCaseNote, deleteCaseNote in `src/lib/actions/cases.ts`
- [ ] **Build Tasks tab** (AC 8)
  - [ ] `src/components/cases/tasks-tab.tsx`
  - [ ] Tasks list for this case with status badge, priority, assignee, due date
  - [ ] Quick-add task form
  - [ ] Link to full task management page filtered by this case
- [ ] **Build Parties tab** (AC 9)
  - [ ] `src/components/cases/parties-tab.tsx`
  - [ ] Sections: Client, Opposing Party, Opposing Counsel, Witnesses, Experts
  - [ ] CRUD for case_parties: add party dialog (name, role, contact info, notes)
  - [ ] Server actions: addCaseParty, updateCaseParty, removeCaseParty
- [ ] **Build case edit functionality**
  - [ ] `src/app/(dashboard)/cases/[id]/edit/page.tsx` — pre-populated case form
  - [ ] Edit button on case detail header
- [ ] **Add loading skeletons** (AC 1-9)
  - [ ] Skeleton for case header
  - [ ] Skeleton for each tab content
  - [ ] Empty states for tabs with no data

## Dev Notes

### Architecture Patterns
- The case detail page is a Server Component that fetches the case with all relations in a single query (or parallel queries)
- Each tab component receives the case data as props; tabs that need additional data (timeline with pagination, documents with filters) use client-side fetching or server actions
- The Tabs component should use URL hash or search params for tab state so that direct links to specific tabs work (e.g., /cases/123?tab=timeline)
- SoL countdown should recalculate on page load; for real-time countdown, use a client component with setInterval
- Notes privacy: private notes have `is_private: true` in the database; the client portal (Story 13.2) must filter these out server-side

### SoL Warning Thresholds
```typescript
const SOL_THRESHOLDS = {
  safe: 90,      // green
  warning: 60,   // yellow
  urgent: 30,    // orange
  critical: 7,   // red + flashing
  overdue: 0,    // red banner "OVERDUE"
};
```

### Libraries
- shadcn/ui: Tabs, Card, Badge, Avatar, Table, Dialog, Textarea, Switch (for private/shared toggle), Button, Skeleton
- `date-fns` for date calculations (differenceInDays, formatDistanceToNow)
- Lucide icons for timeline event types and tab icons

### Project Structure Notes

Files to create:
- `src/app/(dashboard)/cases/[id]/page.tsx` — case detail page
- `src/app/(dashboard)/cases/[id]/edit/page.tsx` — case edit page
- `src/components/cases/case-detail-tabs.tsx` — tabs container
- `src/components/cases/overview-tab.tsx` — overview tab
- `src/components/cases/sol-countdown.tsx` — SoL countdown widget
- `src/components/cases/timeline-tab.tsx` — timeline tab
- `src/components/cases/documents-tab.tsx` — documents tab
- `src/components/cases/billing-tab.tsx` — billing tab
- `src/components/cases/notes-tab.tsx` — notes tab
- `src/components/cases/tasks-tab.tsx` — tasks tab
- `src/components/cases/parties-tab.tsx` — parties tab

Files to modify:
- `src/lib/actions/cases.ts` — add note CRUD, party CRUD, manual timeline entry actions
- `src/lib/queries/cases.ts` — add getCaseTimeline, getCaseNotes, getCaseParties, billing summary queries

### References

- [Source: a.md - Module 5: Case/Matter Management] — case detail page tabbed layout, auto-generated timeline events, form fields
- [Source: epics.md - Epic 6, Story 6.2] — acceptance criteria
- [Source: a.md - Module 7: Calendar & Deadlines] — SoL warning thresholds (90/60/30/7 days)

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
