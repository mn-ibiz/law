# Story 17.1: Caseload & Revenue Reports

Status: ready-for-dev

## Story

As an Admin,
I want caseload and revenue reports with charts, filters, and CSV export,
so that I can analyze firm performance across cases and revenue streams.

## Acceptance Criteria (ACs)

1. **Reports Page with Type Selection:** A dedicated reports page exists at `/(dashboard)/reports` with a report type selector (tabs or sidebar) allowing navigation between Caseload, Revenue, and other report categories.
2. **Caseload Report - Cases by Status:** Bar chart (Recharts `BarChart`) showing case counts grouped by status (Open, In Progress, Hearing, Resolved, Closed, Archived).
3. **Caseload Report - Cases by Practice Area:** Pie chart (Recharts `PieChart`) showing distribution of cases across practice areas.
4. **Caseload Report - Cases by Attorney:** Table (using `@tanstack/react-table`) listing each attorney with their case counts, sortable by name and count.
5. **Caseload Report - Opened vs Closed by Month:** Line chart (Recharts `LineChart`) showing cases opened and cases closed per month over the selected date range, with two distinct series.
6. **Caseload Report - Average Case Duration:** Metric card or table showing average case duration (days from Open to Closed/Resolved) overall and broken down by practice area.
7. **Revenue Report - Revenue by Month:** Line chart showing total revenue (payments received) per month over the selected date range.
8. **Revenue Report - Revenue by Attorney:** Bar chart showing revenue attributed to each attorney (based on cases they led).
9. **Revenue Report - Revenue by Practice Area:** Pie chart showing revenue distribution across practice areas.
10. **Revenue Report - Revenue by Billing Type:** Table showing revenue broken down by billing type (Hourly, Flat Fee, Contingency, Retainer, Pro Bono).
11. **Revenue Report - Year-over-Year Comparison:** Line or grouped bar chart comparing revenue for the current selected period against the same period in the prior year.
12. **Filters:** All reports support filtering by: date range with presets (This Month, This Quarter, This Year, Last Year, Custom range picker), attorney (multi-select), practice area (multi-select), and branch (multi-select).
13. **KES Formatting:** All monetary values displayed with KES prefix and thousands comma separators (e.g., KES 1,250,000).
14. **CSV Export:** Every report view has a "Export CSV" button that downloads the current filtered dataset as a CSV file with appropriate headers.

## Tasks / Subtasks

- [ ] **Task 1: Create reports page layout and navigation** (AC 1)
  - Create `src/app/(dashboard)/reports/page.tsx` with tab-based navigation for report categories
  - Create `src/app/(dashboard)/reports/layout.tsx` with shared report shell
  - Add "Reports" to sidebar navigation under Analytics group with Lucide `BarChart3` icon

- [ ] **Task 2: Build report filter component** (AC 12)
  - Create `src/components/reports/report-filters.tsx` with date range picker (presets + custom), attorney multi-select, practice area multi-select, branch multi-select
  - Use `react-hook-form` + Zod for filter state management
  - Create filter state hook `src/lib/hooks/use-report-filters.ts` with URL search params sync

- [ ] **Task 3: Implement KES currency formatter utility** (AC 13)
  - Create or extend `src/lib/utils/format.ts` with `formatKES(amount: number): string` returning `KES 1,234,567`
  - Ensure consistent usage across all report components

- [ ] **Task 4: Build CSV export utility** (AC 14)
  - Create `src/lib/utils/csv-export.ts` with `exportToCSV(data: Record<string, unknown>[], filename: string, columns: ColumnDef[])` function
  - Generate CSV with BOM for Excel compatibility, proper escaping, and KES formatting
  - Trigger browser download via Blob URL

- [ ] **Task 5: Implement caseload report queries** (AC 2, 3, 4, 5, 6)
  - Create `src/lib/queries/reports/caseload.ts` with server-side query functions:
    - `getCasesByStatus(filters)` - grouped counts by status
    - `getCasesByPracticeArea(filters)` - grouped counts by practice area
    - `getCasesByAttorney(filters)` - attorney case count table
    - `getCasesOpenedClosedByMonth(filters)` - monthly opened/closed series
    - `getAverageCaseDuration(filters)` - average duration overall and by practice area
  - Use Drizzle ORM `sql` template for aggregation queries

- [ ] **Task 6: Build caseload report components** (AC 2, 3, 4, 5, 6)
  - Create `src/components/reports/caseload/cases-by-status-chart.tsx` (Recharts BarChart)
  - Create `src/components/reports/caseload/cases-by-practice-area-chart.tsx` (Recharts PieChart)
  - Create `src/components/reports/caseload/cases-by-attorney-table.tsx` (@tanstack/react-table DataTable)
  - Create `src/components/reports/caseload/opened-closed-chart.tsx` (Recharts LineChart)
  - Create `src/components/reports/caseload/average-duration.tsx` (metric card/table)
  - Each component receives filtered data as props and includes responsive container

- [ ] **Task 7: Implement revenue report queries** (AC 7, 8, 9, 10, 11)
  - Create `src/lib/queries/reports/revenue.ts` with server-side query functions:
    - `getRevenueByMonth(filters)` - monthly revenue totals
    - `getRevenueByAttorney(filters)` - per-attorney revenue
    - `getRevenueByPracticeArea(filters)` - per-practice-area revenue
    - `getRevenueByBillingType(filters)` - per-billing-type revenue table
    - `getRevenueYoY(filters)` - year-over-year comparison data
  - Join payments to invoices to cases for attribution

- [ ] **Task 8: Build revenue report components** (AC 7, 8, 9, 10, 11)
  - Create `src/components/reports/revenue/revenue-by-month-chart.tsx` (Recharts LineChart)
  - Create `src/components/reports/revenue/revenue-by-attorney-chart.tsx` (Recharts BarChart)
  - Create `src/components/reports/revenue/revenue-by-practice-area-chart.tsx` (Recharts PieChart)
  - Create `src/components/reports/revenue/revenue-by-billing-type-table.tsx` (DataTable)
  - Create `src/components/reports/revenue/yoy-comparison-chart.tsx` (Recharts grouped BarChart or LineChart)

- [ ] **Task 9: Assemble caseload and revenue report pages** (AC 1-14)
  - Create `src/app/(dashboard)/reports/caseload/page.tsx` composing filter + caseload charts + export
  - Create `src/app/(dashboard)/reports/revenue/page.tsx` composing filter + revenue charts + export
  - Server components fetch data, pass to client chart components
  - Add loading skeletons for each chart/table section

- [ ] **Task 10: Add print-friendly styles** (AC 14)
  - Add `@media print` CSS rules in report pages for clean chart/table printing
  - Hide sidebar, filters, and export buttons in print view

## Dev Notes

- **Recharts:** All charts must be wrapped in `<ResponsiveContainer>` for proper resizing. Use `width="100%"` and a fixed `height` (e.g., 350px). Charts are client components (`"use client"`).
- **Data Fetching Pattern:** Report pages should be Server Components that call query functions directly. Chart components receive data as props and are client components for Recharts interactivity.
- **Date Range:** Default to "This Month" preset. Store filter state in URL search params so reports are bookmarkable/shareable.
- **CSV Export:** Use client-side generation from the already-fetched data. No separate API endpoint needed.
- **Performance:** For large datasets, consider adding indexes on `cases.status`, `cases.practice_area_id`, `cases.created_at`, `payments.payment_date`. Use `sql` raw queries with GROUP BY for aggregations rather than fetching all rows.
- **KES Formatting:** Use `Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' })` or a manual formatter to produce `KES 1,234,567`.
- **Empty States:** Each chart/table component should handle empty data gracefully with a message like "No data for the selected filters."
- **Branch Filtering:** When branch filter is applied, all queries must include a WHERE clause joining to the case's branch. Admin sees all branches by default.

### Project Structure Notes

**New files to create:**
- `src/app/(dashboard)/reports/layout.tsx`
- `src/app/(dashboard)/reports/page.tsx` (redirect or report type selector)
- `src/app/(dashboard)/reports/caseload/page.tsx`
- `src/app/(dashboard)/reports/revenue/page.tsx`
- `src/components/reports/report-filters.tsx`
- `src/components/reports/caseload/cases-by-status-chart.tsx`
- `src/components/reports/caseload/cases-by-practice-area-chart.tsx`
- `src/components/reports/caseload/cases-by-attorney-table.tsx`
- `src/components/reports/caseload/opened-closed-chart.tsx`
- `src/components/reports/caseload/average-duration.tsx`
- `src/components/reports/revenue/revenue-by-month-chart.tsx`
- `src/components/reports/revenue/revenue-by-attorney-chart.tsx`
- `src/components/reports/revenue/revenue-by-practice-area-chart.tsx`
- `src/components/reports/revenue/revenue-by-billing-type-table.tsx`
- `src/components/reports/revenue/yoy-comparison-chart.tsx`
- `src/lib/queries/reports/caseload.ts`
- `src/lib/queries/reports/revenue.ts`
- `src/lib/utils/csv-export.ts`
- `src/lib/utils/format.ts` (or extend existing)
- `src/lib/hooks/use-report-filters.ts`

**Files to modify:**
- Sidebar navigation component (add Reports link)
- RBAC middleware (ensure Admin-only access to reports)

### References

- [Source: a.md -- Law Firm Registry Implementation Plan]
- [Source: epics.md -- Epic 17: Reports & Analytics, Story 17.1]
- Recharts documentation: https://recharts.org/
- @tanstack/react-table documentation: https://tanstack.com/table

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
