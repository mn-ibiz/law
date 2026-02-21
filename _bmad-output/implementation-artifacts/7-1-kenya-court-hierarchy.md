# Story 7.1: Kenya Court Hierarchy & Court Station Selection

Status: ready-for-dev

## Story

As an Admin/Attorney,
I want to select from the Kenya court hierarchy,
so that cases are linked to correct courts.

## Acceptance Criteria (ACs)

1. **Cascading dropdowns** — court selection uses a two-level cascade: first select court type (Supreme Court, Court of Appeal, High Court, ELC, ELRC, Magistrate Court, Kadhi's Court, Tribunal), then select court station (filtered by selected court type and county).
2. **Court registry/division selection** — after selecting court type and station, optionally select a registry or division (e.g., High Court Commercial Division, High Court Family Division).
3. **Pre-populated 47-county court stations** — all court stations across Kenya's 47 counties are seeded from Story 1.3 and available for selection; stations include: name, county, court type, address, phone.
4. **Court file number** — a separate field for the court's own file/case number (distinct from the firm's internal case number); free text input with common format hints.
5. **Virtual court link field** — URL field for virtual/remote court hearing links (Zoom, Teams, etc.); validated as a URL.
6. **Judge assignment tracking with history** — assign a judge/magistrate to a case; track history when judge changes (previous judge, date changed, reason); display current judge prominently on case detail.
7. **Cause list tracking** — field for the case's position/number in the court cause list; date of cause list entry; links to external cause list portal (judiciary.go.ke).
8. **Court management page (Admin)** — admin page to add, edit, and deactivate court stations; supplements the seeded data; CRUD for courts and court stations.

## Tasks / Subtasks

- [ ] **Build court selection cascading dropdown component** (AC 1, 2)
  - [ ] `src/components/shared/court-selector.tsx` — reusable cascading dropdown
  - [ ] First dropdown: court types (from pgEnum or constant)
  - [ ] Second dropdown: court stations filtered by selected court type (and optionally county)
  - [ ] Third dropdown (optional): registry/division filtered by court type
  - [ ] County filter option to narrow stations
  - [ ] Searchable dropdowns using shadcn Combobox pattern
- [ ] **Build court queries** (AC 1, 2, 3)
  - [ ] `src/lib/queries/courts.ts` — getCourtTypes, getCourtStations(courtTypeId?, countyId?), getCourtById
  - [ ] Efficient querying with indexes on court_type and county
- [ ] **Integrate court selector into case form** (AC 1, 2, 4, 5)
  - [ ] Update `src/components/forms/case-form.tsx` — replace simple court text field with cascading court selector
  - [ ] Add court file number text input
  - [ ] Add virtual court link URL input
  - [ ] Validate virtual court link as valid URL
- [ ] **Build judge assignment tracking** (AC 6)
  - [ ] `src/components/cases/judge-assignment.tsx` — current judge display with change button
  - [ ] Judge change dialog: new judge name, reason for change
  - [ ] Server action: `src/lib/actions/courts.ts` — assignJudge(caseId, judgeName, reason?)
  - [ ] Stores history in a judge_history array or related table
  - [ ] Creates timeline event: "Judge changed from [old] to [new]"
  - [ ] Display judge history table (judge name, assigned date, removed date, reason)
- [ ] **Build cause list tracking** (AC 7)
  - [ ] Add cause list fields to case form/detail: cause list number, cause list date
  - [ ] `src/components/cases/cause-list-info.tsx` — display cause list info on case detail
  - [ ] External link to judiciary.go.ke cause list portal
- [ ] **Build court management page (Admin)** (AC 8)
  - [ ] `src/app/(dashboard)/settings/courts/page.tsx` — court stations list with DataTable
  - [ ] Columns: station name, court type, county, address, status (active/inactive)
  - [ ] Filter by court type, county, status
  - [ ] "Add Court Station" button with form dialog
  - [ ] Edit and deactivate actions per station
  - [ ] Server actions: `src/lib/actions/courts.ts` — createCourtStation, updateCourtStation, deactivateCourtStation
  - [ ] Admin-only route protection
- [ ] **Create Zod schemas for court operations** (AC 4, 5, 6, 8)
  - [ ] `src/lib/validators/court.ts` — courtStationSchema, judgeAssignmentSchema, courtFilingSchema
  - [ ] Virtual court link: z.string().url().optional()
- [ ] **Update case detail overview tab** (AC 1, 4, 5, 6, 7)
  - [ ] Update `src/components/cases/overview-tab.tsx` — add court information section
  - [ ] Display: court type, station, registry/division, court file number, virtual court link, current judge, cause list info
  - [ ] Judge with change history expandable
- [ ] **Add loading and empty states** (AC 8)
  - [ ] Skeleton for court management DataTable
  - [ ] Empty state for court stations (should not occur with seed data)

## Dev Notes

### Architecture Patterns
- Court selector is a reusable component used in case creation, case editing, and potentially court filing forms
- The cascading dropdown pattern: selecting court type triggers a filtered query for stations; this can be done client-side if the full court stations dataset is small enough (<500 records), or via server action for larger datasets
- Since Kenya has ~47 counties with ~300+ court stations total, client-side filtering is reasonable; load all stations once and filter in-memory
- Judge history can be stored as a JSONB array on the case record or as a separate judge_assignments table; a separate table is cleaner for querying

### Kenya Court Types
```typescript
const COURT_TYPES = [
  { id: 'supreme', name: 'Supreme Court' },
  { id: 'appeal', name: 'Court of Appeal' },
  { id: 'high', name: 'High Court' },
  { id: 'elc', name: 'Environment & Land Court' },
  { id: 'elrc', name: 'Employment & Labour Relations Court' },
  { id: 'magistrate', name: "Magistrate's Court" },
  { id: 'kadhi', name: "Kadhi's Court" },
  { id: 'tribunal', name: 'Tribunal' },
] as const;
```

### High Court Divisions
- Commercial & Admiralty Division
- Family Division
- Constitutional & Human Rights Division
- Judicial Review Division
- Criminal Division
- Civil Division
- Anti-Corruption & Economic Crimes Division

### Libraries
- shadcn/ui: Combobox (Command + Popover pattern), Input, Dialog, Table, Badge, Button
- @tanstack/react-table for court management DataTable
- Lucide icons: Building2 (court), MapPin (station), Scale (judge)

### Project Structure Notes

Files to create:
- `src/components/shared/court-selector.tsx` — cascading court dropdown
- `src/components/cases/judge-assignment.tsx` — judge assignment component
- `src/components/cases/cause-list-info.tsx` — cause list display
- `src/app/(dashboard)/settings/courts/page.tsx` — court management page
- `src/lib/validators/court.ts` — Zod schemas
- `src/lib/actions/courts.ts` — server actions for courts
- `src/lib/queries/courts.ts` — court data queries

Files to modify:
- `src/components/forms/case-form.tsx` — integrate court selector, add court file number and virtual link fields
- `src/components/cases/overview-tab.tsx` — add court information section with judge and cause list
- `src/components/layout/sidebar.tsx` — add Courts under Settings nav (admin only)

### References

- [Source: a.md - Module 16: Kenya Court & E-Filing Integration] — court hierarchy, court management features, e-filing readiness
- [Source: epics.md - Epic 7, Story 7.1] — acceptance criteria
- [Source: a.md - Kenya Legal Requirements] — Roll of Advocates, court system structure
- [Source: a.md - Feature Gap Analysis #4] — Kenya Court Hierarchy as MUST-HAVE

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
