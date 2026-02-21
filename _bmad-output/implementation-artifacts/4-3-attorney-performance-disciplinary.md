# Story 4.3: Attorney Performance Metrics & Disciplinary Tracking

Status: ready-for-dev

## Story

As an Admin,
I want performance metrics and disciplinary proceeding tracking per attorney,
so that I can evaluate performance and track regulatory issues.

## Acceptance Criteria (ACs)

1. Performance tab on attorney detail page displaying: cases won/settled count, average case duration (days), billing efficiency (billed vs collected percentage), utilization rate (billable hours / available hours)
2. Revenue generated per attorney: total revenue from payments on the attorney's cases, with period filter (month, quarter, year)
3. Cases by status breakdown: visual chart or table showing how many cases the attorney has in each status (Open, In Progress, Hearing, Resolved, Closed)
4. Disciplinary Tribunal tracking: log any proceedings before the Advocates Disciplinary Tribunal with fields: date, case reference, status (Pending/Resolved/Dismissed), outcome, notes
5. Alert/warning displayed on attorney detail page when there are active (Pending) disciplinary proceedings
6. Performance insights enabling firm-wide comparison: ability to view metrics across all attorneys for benchmarking

## Tasks / Subtasks

- [ ] Create `src/lib/queries/attorney-performance.ts` — Query functions: `getAttorneyPerformanceMetrics(attorneyId, dateRange?)` returning cases won/settled, avg case duration, billing efficiency, utilization rate; `getAttorneyRevenue(attorneyId, period)` returning total revenue; `getAttorneyCasesByStatus(attorneyId)` returning status breakdown counts (AC1, AC2, AC3)
- [ ] Implement `casesWonSettled` metric: count cases where attorney is lead/assigned AND status is "Resolved" or "Closed" AND outcome is "won" or "settled" (AC1)
- [ ] Implement `averageCaseDuration` metric: calculate average days between case createdAt and resolvedAt/closedAt for completed cases assigned to this attorney (AC1)
- [ ] Implement `billingEfficiency` metric: (total payments received / total invoiced amount) * 100 for cases where this attorney is lead (AC1)
- [ ] Implement `utilizationRate` metric: (total billable hours / available hours) * 100 where available hours = working days in period * 8 hours (AC1)
- [ ] Implement `revenueGenerated` metric: SUM of payments.amount on invoices linked to cases where this attorney is lead or assigned, with date range filter (AC2)
- [ ] Implement `casesByStatus` query: COUNT cases grouped by status for the specified attorney (AC3)
- [ ] Create `src/lib/validators/disciplinary.ts` — Zod schema: `createDisciplinaryRecordSchema` with fields: date, caseReference (text), status (Pending/Resolved/Dismissed enum), outcome (text, optional), notes (textarea, optional) (AC4)
- [ ] Create `src/lib/actions/disciplinary.ts` — Server actions: `addDisciplinaryRecord(attorneyId, data)`, `updateDisciplinaryRecord(recordId, data)`, `deleteDisciplinaryRecord(recordId)` — admin only, with audit logging (AC4)
- [ ] Create `src/lib/queries/disciplinary.ts` — Query functions: `getAttorneyDisciplinaryRecords(attorneyId)`, `getActiveDisciplinaryProceedings(attorneyId)` returning count of Pending records, `getAllActiveDisciplinaryProceedings()` for firm-wide view (AC4, AC5)
- [ ] Create `src/components/attorneys/performance-tab.tsx` — Performance tab component: stat cards row (cases won/settled, avg duration, billing efficiency %, utilization rate %), revenue section with period selector (This Month/Quarter/Year), cases by status chart or table (AC1, AC2, AC3)
- [ ] Create `src/components/attorneys/case-status-breakdown.tsx` — Visual breakdown of attorney's cases by status using Recharts BarChart or a styled table with status badges and counts (AC3)
- [ ] Create `src/components/attorneys/disciplinary-tab.tsx` — Disciplinary proceedings section: table listing all proceedings (date, case reference, status badge, outcome, notes), "Add Proceeding" button for admins; status badges color-coded (Pending=red, Resolved=green, Dismissed=gray) (AC4)
- [ ] Create `src/components/forms/disciplinary-form.tsx` — Disciplinary record form: date (date picker), case reference (text input), status (dropdown: Pending/Resolved/Dismissed), outcome (text, visible when Resolved), notes (textarea) (AC4)
- [ ] Create `src/components/attorneys/disciplinary-alert.tsx` — Warning banner component displayed at top of attorney detail page when `getActiveDisciplinaryProceedings()` returns count > 0; red/amber alert with icon, text "Active Disciplinary Proceedings: X pending", and link to disciplinary tab (AC5)
- [ ] Create `src/app/(dashboard)/attorneys/performance/page.tsx` — Firm-wide performance comparison page: table of all attorneys with key metrics columns (cases handled, hours billed, revenue, utilization rate, billing efficiency), sortable, filterable by department/title/period; enables benchmarking across the firm (AC6)
- [ ] Create `src/lib/queries/attorney-firm-performance.ts` — Query to aggregate performance metrics for all attorneys in a single query for the comparison page (AC6)
- [ ] Update `src/components/attorneys/attorney-detail-tabs.tsx` — Add "Performance" tab and "Disciplinary" tab to the attorney detail page (AC1, AC4)
- [ ] Update attorney detail page header to show disciplinary alert banner when applicable (AC5)

## Dev Notes

### Architecture & Constraints
- Performance metrics are computed on-the-fly from existing data (cases, time_entries, invoices, payments) — no separate metrics table needed
- All performance queries should be optimized with appropriate joins and aggregations at the database level
- Billing efficiency may be 0 if no invoices exist; handle division by zero gracefully
- Utilization rate assumes 8 working hours per day, 5 days per week; available hours = working_days_in_period * 8
- Disciplinary records are stored in a new `disciplinary_records` table (or reuse a general notes/records pattern); if not in the original schema, add it to the attorneys domain
- The disciplinary alert is a critical compliance feature — it must be prominently visible on the attorney detail page
- Only admins should be able to create/edit disciplinary records; attorneys can view their own

### Metrics Calculations
```typescript
// Billing Efficiency
const billingEfficiency = totalInvoiced > 0
  ? (totalCollected / totalInvoiced) * 100
  : 0;

// Utilization Rate (for a date range)
const workingDays = getWorkingDaysInRange(startDate, endDate);
const availableHours = workingDays * 8;
const utilizationRate = availableHours > 0
  ? (totalBillableHours / availableHours) * 100
  : 0;

// Average Case Duration (in days)
const avgDuration = completedCases.length > 0
  ? completedCases.reduce((sum, c) => sum + daysBetween(c.createdAt, c.closedAt), 0) / completedCases.length
  : 0;
```

### Disciplinary Record Schema Addition
If `disciplinary_records` is not in the original 40+ table schema, create it:
```typescript
export const disciplinaryRecords = pgTable('disciplinary_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  attorneyId: uuid('attorney_id').notNull().references(() => attorneys.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  caseReference: text('case_reference').notNull(),
  status: pgEnum('disciplinary_status', ['pending', 'resolved', 'dismissed'])('status').notNull().default('pending'),
  outcome: text('outcome'),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### Performance Comparison Table (Firm-Wide)
| Attorney | Cases Handled | Won/Settled | Avg Duration | Hours Billed | Revenue (KES) | Utilization | Billing Eff. |
|----------|--------------|-------------|--------------|-------------|---------------|-------------|-------------|
| Jane W.  | 45           | 32          | 120 days     | 1,200       | 3,500,000     | 78%         | 92%         |

### Project Structure Notes

Files to create:
- `src/lib/queries/attorney-performance.ts` — Performance metric queries
- `src/lib/queries/attorney-firm-performance.ts` — Firm-wide comparison queries
- `src/lib/queries/disciplinary.ts` — Disciplinary record queries
- `src/lib/validators/disciplinary.ts` — Zod schemas for disciplinary records
- `src/lib/actions/disciplinary.ts` — Server actions for disciplinary CRUD
- `src/components/attorneys/performance-tab.tsx` — Performance tab component
- `src/components/attorneys/case-status-breakdown.tsx` — Case status chart/table
- `src/components/attorneys/disciplinary-tab.tsx` — Disciplinary proceedings tab
- `src/components/attorneys/disciplinary-alert.tsx` — Active proceedings alert banner
- `src/components/forms/disciplinary-form.tsx` — Disciplinary record form
- `src/app/(dashboard)/attorneys/performance/page.tsx` — Firm-wide comparison page

Files to modify:
- `src/components/attorneys/attorney-detail-tabs.tsx` — Add Performance and Disciplinary tabs
- `src/app/(dashboard)/attorneys/[id]/page.tsx` — Add disciplinary alert banner
- `src/lib/db/schema/attorneys.ts` — Add disciplinaryRecords table if not present

### References

- [Source: a.md — Module 3: Attorney Management — Performance metrics]
- [Source: a.md — Attorney Detail Page Sections: Performance Tab]
- [Source: a.md — Kenya Legal Requirements: Advocates Disciplinary Tribunal]
- [Source: epics.md — Epic 4, Story 4.3]
