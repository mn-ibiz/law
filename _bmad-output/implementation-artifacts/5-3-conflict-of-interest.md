# Story 5.3: Conflict of Interest Checker

Status: ready-for-dev

## Story

As an Admin/Attorney,
I want conflict checks before taking clients or cases,
so that ethical violations are avoided.

## Acceptance Criteria (ACs)

1. **Accessible from multiple entry points** — conflict checker accessible from: client intake form (auto-triggered), client detail page (manual trigger), case creation form (auto-triggered on client selection), standalone conflict check page.
2. **Search across all relevant entities** — searches: client names (first, last, company), opposing parties, opposing counsel, case parties, company names; returns all potential matches.
3. **Results display** — each result shows: entity name, match type (client, opposing party, opposing counsel, case party, company), case reference (case number + title), conflict severity (None, Low, Medium, High).
4. **Conflict resolution actions** — three possible actions per result: "Clear" (no conflict), "Potential Conflict" (escalate to partner review), "Conflict Found" (block engagement).
5. **Resolution form with notes** — when resolving a conflict, user must provide: action taken, justification notes, resolution date; for "Potential Conflict" status, a reviewing partner must be assigned.
6. **Conflict history log** — all conflict checks are stored with: search query, results found, resolution action, resolved by, date; viewable on client detail Conflicts tab and standalone conflict log page.
7. **Fuzzy matching** — search uses ILIKE for partial matches and pg_trgm extension for similarity scoring to catch name variations and misspellings.
8. **Audit log** — all conflict check operations (search, resolution) are logged to the audit_log table.

## Tasks / Subtasks

- [ ] **Enable pg_trgm extension** (AC 7)
  - [ ] Add migration to enable `pg_trgm` extension on Neon database if not already enabled
  - [ ] Create GIN trigram indexes on: clients.first_name, clients.last_name, clients.company_name, case_parties.name, cases.opposing_counsel, cases.opposing_party
- [ ] **Create Zod schemas for conflict checking** (AC 2, 4, 5)
  - [ ] `src/lib/validators/conflict.ts` — conflictSearchSchema, conflictResolutionSchema
- [ ] **Build conflict search server action** (AC 2, 7, 8)
  - [ ] `src/lib/actions/conflicts.ts` — searchConflicts(query: string)
  - [ ] Search across clients table (first_name, last_name, company_name)
  - [ ] Search across case_parties table (name)
  - [ ] Search across cases table (opposing_counsel, opposing_party)
  - [ ] Use ILIKE for partial matching: `%query%`
  - [ ] Use pg_trgm similarity() function for fuzzy scoring
  - [ ] Combine and deduplicate results with match type and severity
  - [ ] Log search to conflict_checks table
  - [ ] Write audit log entry
- [ ] **Build conflict resolution server action** (AC 4, 5, 8)
  - [ ] `src/lib/actions/conflicts.ts` — resolveConflict(conflictCheckId, action, notes)
  - [ ] Validate resolution action: 'clear', 'potential_conflict', 'conflict_found'
  - [ ] For 'potential_conflict': require partner assignment
  - [ ] For 'conflict_found': set block flag on related client/case
  - [ ] Update conflict_checks record with resolution details
  - [ ] Write audit log entry
- [ ] **Build conflict queries** (AC 6)
  - [ ] `src/lib/queries/conflicts.ts` — getConflictsByClient, getConflictsByCase, getAllConflictChecks, getConflictCheckById
- [ ] **Build standalone conflict check page** (AC 1, 2, 3, 4)
  - [ ] `src/app/(dashboard)/conflicts/page.tsx` — search input, results display, resolution actions
  - [ ] Search input with debounced search (300ms delay)
  - [ ] Results table/list with entity name, match type badge, case reference link, severity badge
  - [ ] Action buttons per result: Clear, Potential Conflict, Conflict Found
- [ ] **Build conflict check dialog component** (AC 1, 3, 4, 5)
  - [ ] `src/components/shared/conflict-check-dialog.tsx` — reusable dialog triggered from intake form, client detail, case creation
  - [ ] Shows search results in a compact format
  - [ ] Resolution form with notes textarea, action radio buttons
- [ ] **Integrate conflict check into client intake** (AC 1)
  - [ ] Auto-trigger conflict search when client name fields are filled (on step transition or blur)
  - [ ] Show warning dialog if matches found before allowing intake submission
- [ ] **Integrate conflict check into case creation** (AC 1)
  - [ ] Auto-trigger when client is selected in case creation form
  - [ ] Block case creation if unresolved conflict exists
- [ ] **Build conflict history tab** (AC 6)
  - [ ] Add conflict check history table to client detail page Conflicts tab
  - [ ] Show: search date, query, results count, resolution, resolved by
  - [ ] Click to view full conflict check details
- [ ] **Build conflict log page** (AC 6)
  - [ ] `src/app/(dashboard)/conflicts/log/page.tsx` — DataTable of all conflict checks with filters
  - [ ] Filter by: date range, status (pending, cleared, potential, conflict found), checked by

## Dev Notes

### Architecture Patterns
- Conflict search must be fast; use database-level ILIKE and pg_trgm rather than application-level string matching
- The pg_trgm extension provides the `similarity()` function and `%` operator for trigram-based fuzzy matching
- Conflict checks should be non-blocking on intake but prominently warn; only "Conflict Found" should hard-block
- The conflict check dialog should be a reusable component importable from client intake, case creation, and standalone page
- Consider debouncing the search input to avoid excessive DB queries during typing

### pg_trgm Setup
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_clients_name_trgm ON clients USING GIN (first_name gin_trgm_ops);
CREATE INDEX idx_clients_lastname_trgm ON clients USING GIN (last_name gin_trgm_ops);
CREATE INDEX idx_clients_company_trgm ON clients USING GIN (company_name gin_trgm_ops);
```

### Libraries
- shadcn/ui components: Dialog, Input, Badge, Table, RadioGroup, Textarea, Button, Alert
- `use-debounce` or custom hook for search input debouncing
- @tanstack/react-table for conflict log DataTable

### Conflict Severity Logic
- Exact name match on active client = High
- Similar name (similarity > 0.6) on active client = Medium
- Match on opposing party/counsel in any case = High
- Partial name match (ILIKE) on case party = Low
- Match on inactive/archived client = Low

### Project Structure Notes

Files to create:
- `src/app/(dashboard)/conflicts/page.tsx` — standalone conflict check page
- `src/app/(dashboard)/conflicts/log/page.tsx` — conflict history log page
- `src/components/shared/conflict-check-dialog.tsx` — reusable conflict dialog
- `src/components/conflicts/conflict-results.tsx` — results display component
- `src/components/conflicts/conflict-resolution-form.tsx` — resolution form
- `src/lib/validators/conflict.ts` — Zod schemas
- `src/lib/actions/conflicts.ts` — server actions
- `src/lib/queries/conflicts.ts` — data access queries

Files to modify:
- `src/components/forms/client-intake-form.tsx` — integrate auto conflict check
- `src/components/forms/case-form.tsx` — integrate conflict check on client selection (when case form exists)
- `src/app/(dashboard)/clients/[id]/page.tsx` — populate Conflicts tab
- `src/components/layout/sidebar.tsx` — add Conflicts nav item under Management group
- Database migration — enable pg_trgm extension and create trigram indexes

### References

- [Source: a.md - Module 4: Client Management (CRM)] — Conflict of Interest Check section
- [Source: epics.md - Epic 5, Story 5.3] — acceptance criteria
- [Source: a.md - RBAC Permissions Matrix] — Admin and Attorney can perform conflict checks
