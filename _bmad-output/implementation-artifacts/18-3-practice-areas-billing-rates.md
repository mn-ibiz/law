# Story 18.3: Practice Areas, Billing Rates & Reference Data

Status: ready-for-dev

## Story

As an Admin,
I want to manage practice areas, billing rates, and reference data,
so that firm operations are configurable and rates can be adjusted over time.

## Acceptance Criteria (ACs)

1. **Practice Area CRUD:** Admin can create, read, update, and deactivate practice areas. Each practice area has: name (required, unique), description (optional), and active/inactive status toggle.
2. **Practice Area List:** DataTable showing all practice areas with columns: name, description (truncated), status badge (Active/Inactive), case count. Search by name. Filter by status.
3. **Practice Area Deactivation:** Deactivating a practice area does not delete it (soft delete). Existing cases linked to deactivated practice areas are unaffected. Deactivated practice areas do not appear in dropdowns for new cases/attorneys.
4. **Billing Rate Management - Firm-Wide Default:** A configurable firm-wide default hourly rate (KES) that applies when no attorney-specific or practice-area-specific rate is set.
5. **Billing Rate Management - Attorney-Specific Overrides:** Per-attorney hourly rate (KES) that overrides the firm-wide default for that attorney. Managed from the attorney profile or billing rates settings page.
6. **Billing Rate Management - Practice Area-Specific Rates:** Per-practice-area hourly rate (KES) that can be set as a default for cases in that practice area.
7. **Billing Rate Management - Rate Effective Dates:** Each rate entry has an effective date, enabling historical tracking. When a rate changes, a new record is created with the new effective date, preserving the old rate for historical billing accuracy.
8. **Rate Hierarchy:** When calculating the billable rate for a time entry, the system uses: attorney-specific rate (highest priority) > practice area rate > firm-wide default rate. This hierarchy is documented and consistent.
9. **Court Station Management:** Admin can add, edit, and deactivate court stations (supplementing the seeded data from Story 1.3). Court station form: name, court type (from enum), county, address, is_active.
10. **Audit Logging:** All changes to practice areas, billing rates, and court stations are recorded in the audit log.

## Tasks / Subtasks

- [ ] **Task 1: Build practice area CRUD page** (AC 1, 2, 3, 10)
  - Create `src/app/(dashboard)/settings/practice-areas/page.tsx` with DataTable listing practice areas
  - Columns: name, description (truncated to 100 chars), status badge, case count (from joined query)
  - Search by name, filter by active/inactive status
  - Add/Edit via shadcn Dialog with react-hook-form + Zod
  - Deactivate via toggle with confirmation dialog
  - Server actions create audit log entries on every mutation

- [ ] **Task 2: Create practice area validators and actions** (AC 1, 3, 10)
  - Create `src/lib/validators/practice-area.ts` with Zod schema: name (required, min 2), description (optional), isActive (boolean)
  - Create `src/lib/actions/practice-areas.ts` with:
    - `createPracticeArea(data)` - insert with unique name check
    - `updatePracticeArea(id, data)` - update fields
    - `togglePracticeAreaStatus(id)` - soft toggle active/inactive
  - All actions call `createAuditLog()`

- [ ] **Task 3: Create practice area queries** (AC 2)
  - Create `src/lib/queries/practice-areas.ts` with:
    - `getPracticeAreas(filters)` - list with search, status filter, case count join
    - `getActivePracticeAreas()` - active only, for dropdowns across the app
    - `getPracticeAreaById(id)` - single record for edit

- [ ] **Task 4: Build billing rates management page** (AC 4, 5, 6, 7, 8)
  - Create `src/app/(dashboard)/settings/billing-rates/page.tsx` with sections:
    - **Firm-Wide Default Rate:** Single input field for default hourly rate (KES) with save button
    - **Attorney Rate Overrides:** Table showing attorneys with their override rate and effective date. Add/Edit rate dialog.
    - **Practice Area Rates:** Table showing practice areas with their default rate and effective date. Add/Edit rate dialog.
  - Display rate hierarchy documentation/help text

- [ ] **Task 5: Create billing rate validators and actions** (AC 4, 5, 6, 7, 10)
  - Create `src/lib/validators/billing-rate.ts` with Zod schemas:
    - `firmRateSchema`: rate (positive number in KES)
    - `attorneyRateSchema`: attorneyId, rate, effectiveDate
    - `practiceAreaRateSchema`: practiceAreaId, rate, effectiveDate
  - Create `src/lib/actions/billing-rates.ts` with:
    - `updateFirmDefaultRate(rate)` - stores in firm_settings
    - `setAttorneyRate(attorneyId, rate, effectiveDate)` - creates new billing_rates record (does NOT update old, preserving history)
    - `setPracticeAreaRate(practiceAreaId, rate, effectiveDate)` - creates new billing_rates record
  - All actions call `createAuditLog()`

- [ ] **Task 6: Create billing rate query and resolution utility** (AC 7, 8)
  - Create `src/lib/queries/billing-rates.ts` with:
    - `getAttorneyRates()` - latest rate per attorney with history
    - `getPracticeAreaRates()` - latest rate per practice area with history
    - `getRateHistory(entityType, entityId)` - all historical rates for an entity
  - Create `src/lib/utils/resolve-billing-rate.ts` with:
    - `resolveBillingRate(attorneyId, practiceAreaId, date)` - returns the applicable rate following the hierarchy: attorney rate (effective on date) > practice area rate > firm default

- [ ] **Task 7: Build court station management page** (AC 9, 10)
  - Create `src/app/(dashboard)/settings/court-stations/page.tsx` with DataTable
  - Columns: name, court type, county, is_active status
  - Add/Edit via Dialog with fields: name, court type (enum dropdown), county (47 counties dropdown), address, is_active
  - Deactivate toggle (does not delete seeded data)
  - Search by name, filter by court type, county, status

- [ ] **Task 8: Create court station validators and actions** (AC 9, 10)
  - Create `src/lib/validators/court-station.ts` with Zod schema
  - Create `src/lib/actions/court-stations.ts` with CRUD actions
  - All mutations create audit log entries

- [ ] **Task 9: Add settings sub-navigation** (AC 1, 4, 9)
  - Update `src/app/(dashboard)/settings/layout.tsx` to include links to:
    - Practice Areas (`/settings/practice-areas`)
    - Billing Rates (`/settings/billing-rates`)
    - Court Stations (`/settings/court-stations`)

- [ ] **Task 10: Update dropdowns across the app** (AC 3)
  - Ensure all practice area dropdowns (case creation, attorney profile, reports) use `getActivePracticeAreas()` to exclude inactive
  - Ensure court station dropdowns use active-only query

## Dev Notes

- **Rate Effective Dates (Historical Tracking):** The billing_rates table should store: `id, entity_type (attorney|practice_area|firm), entity_id, rate, effective_date, created_at, created_by`. When querying the current rate, find the record with the latest `effective_date <= today`. Old records are never updated or deleted. This enables accurate historical billing (e.g., time entries from last month use last month's rate).
- **Rate Hierarchy Implementation:** The `resolveBillingRate()` function is critical and must be used consistently wherever billable amounts are calculated (time entry creation, fee note generation). The hierarchy is:
  1. Attorney-specific rate effective on the time entry date
  2. Practice area rate effective on the time entry date
  3. Firm-wide default rate
- **KES Formatting:** All rate inputs should accept numeric values and display with KES formatting. Use controlled inputs with formatting on blur.
- **Soft Delete Pattern:** Practice areas and court stations use soft delete (is_active flag). This preserves referential integrity with existing cases. Only active items appear in creation/selection dropdowns.
- **Seeded Data:** Court stations are initially seeded (Story 1.3). This management page supplements the seeded data. Seeded records should be editable but not deletable. Consider adding an `is_seeded` flag or simply relying on the soft delete pattern.
- **Practice Area Case Count:** The case count column in the practice areas table requires a LEFT JOIN with cases table, grouped by practice area. This is a read-only computed column, not stored.

### Project Structure Notes

**New files to create:**
- `src/app/(dashboard)/settings/practice-areas/page.tsx`
- `src/app/(dashboard)/settings/billing-rates/page.tsx`
- `src/app/(dashboard)/settings/court-stations/page.tsx`
- `src/lib/validators/practice-area.ts`
- `src/lib/validators/billing-rate.ts`
- `src/lib/validators/court-station.ts`
- `src/lib/actions/practice-areas.ts`
- `src/lib/actions/billing-rates.ts`
- `src/lib/actions/court-stations.ts`
- `src/lib/queries/practice-areas.ts`
- `src/lib/queries/billing-rates.ts`
- `src/lib/utils/resolve-billing-rate.ts`

**Files to modify:**
- `src/app/(dashboard)/settings/layout.tsx` (add nav items)
- Case creation form (use `getActivePracticeAreas()`)
- Attorney profile form (use `getActivePracticeAreas()`)
- Time entry creation (use `resolveBillingRate()`)
- Fee note generation (use `resolveBillingRate()`)

### References

- [Source: a.md -- Law Firm Registry Implementation Plan]
- [Source: epics.md -- Epic 18: Settings & Configuration, Story 18.3]
- [Source: epics.md -- Epic 1: Project Foundation, Story 1.3] (seeded court stations and practice areas)
- [Source: epics.md -- Epic 10: Time & Expense Tracking] (rate usage in time entries)
- [Source: epics.md -- Epic 11: Billing & Fee Notes] (rate usage in fee note generation)

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
