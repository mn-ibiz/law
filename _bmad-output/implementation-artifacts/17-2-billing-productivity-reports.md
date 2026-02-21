# Story 17.2: Billing & Productivity Reports

Status: ready-for-dev

## Story

As an Admin,
I want billing aging and productivity reports,
so that I manage cash flow and attorney utilization effectively.

## Acceptance Criteria (ACs)

1. **Billing & AR - Aging Summary:** Table or chart showing outstanding invoice amounts grouped into aging buckets: Current (0-30 days), 30-60 days, 60-90 days, and 90+ days overdue.
2. **Billing & AR - Outstanding by Client:** Table listing clients with their total outstanding balance, sortable by amount and client name, with drill-down to individual invoices.
3. **Billing & AR - Collection Rate:** Percentage metric showing total collected vs. total invoiced for the selected period, displayed as a prominent KPI card.
4. **Billing & AR - Average Days to Payment:** Metric showing the mean number of days between invoice date and payment date for fully paid invoices in the period.
5. **Billing & AR - Write-off Summary:** Table showing credit notes/write-offs by reason (Billing Error, Discount, Partial Write-off, Full Write-off, Other) with totals.
6. **Productivity - Hours by Attorney:** Bar chart (Recharts) showing total hours logged per attorney for the selected period.
7. **Productivity - Billable vs Non-Billable Ratio:** Stacked bar chart showing billable and non-billable hours per attorney side by side.
8. **Productivity - Utilization Rate:** Per-attorney metric showing billable hours divided by available hours (configurable, default 8 hrs/day x working days), displayed as a percentage with color coding (green >= 70%, yellow 50-70%, red < 50%).
9. **Productivity - Hours by Practice Area:** Bar or pie chart showing time entry hours grouped by practice area.
10. **Productivity - Hours by Case:** Table showing hours logged per case, sortable by hours and case number, filterable.
11. **Filters:** Date range (with presets: This Month, This Quarter, This Year, Last Year, Custom), attorney, case, client filters supported across all report views.
12. **CSV Export:** Every report/table has a CSV export button that downloads current filtered data.
13. **Print-Friendly CSS:** Reports render cleanly when printed via browser print (hide nav, expand tables, size charts).

## Tasks / Subtasks

- [ ] **Task 1: Implement billing/AR report queries** (AC 1, 2, 3, 4, 5)
  - Create `src/lib/queries/reports/billing.ts` with:
    - `getAgingSummary(filters)` - outstanding invoices grouped by aging bucket based on due_date vs today
    - `getOutstandingByClient(filters)` - per-client outstanding totals from unpaid/partial invoices
    - `getCollectionRate(filters)` - sum(payments) / sum(invoice_totals) for the period
    - `getAvgDaysToPayment(filters)` - AVG(payment_date - invoice_date) for fully paid invoices
    - `getWriteOffSummary(filters)` - credit notes grouped by reason with amounts

- [ ] **Task 2: Build billing/AR report components** (AC 1, 2, 3, 4, 5)
  - Create `src/components/reports/billing/aging-summary.tsx` - table with Current/30/60/90+ columns and colored totals (Recharts optional horizontal stacked bar)
  - Create `src/components/reports/billing/outstanding-by-client.tsx` - DataTable with client name, outstanding amount (KES), invoice count, with row click to expand/drill-down
  - Create `src/components/reports/billing/collection-rate-card.tsx` - shadcn Card with large percentage, collected vs invoiced sub-text
  - Create `src/components/reports/billing/avg-days-to-payment-card.tsx` - shadcn Card with metric
  - Create `src/components/reports/billing/write-off-summary.tsx` - table grouped by reason

- [ ] **Task 3: Implement productivity report queries** (AC 6, 7, 8, 9, 10)
  - Create `src/lib/queries/reports/productivity.ts` with:
    - `getHoursByAttorney(filters)` - SUM(duration) grouped by attorney
    - `getBillableVsNonBillable(filters)` - SUM(duration) grouped by attorney and billable flag
    - `getUtilizationRate(filters)` - billable hours / available hours per attorney (available = working days in range x configurable daily hours)
    - `getHoursByPracticeArea(filters)` - SUM(duration) grouped by practice area
    - `getHoursByCase(filters)` - SUM(duration) grouped by case

- [ ] **Task 4: Build productivity report components** (AC 6, 7, 8, 9, 10)
  - Create `src/components/reports/productivity/hours-by-attorney-chart.tsx` (Recharts BarChart)
  - Create `src/components/reports/productivity/billable-ratio-chart.tsx` (Recharts stacked BarChart with two series)
  - Create `src/components/reports/productivity/utilization-rate-table.tsx` - table with attorney name, billable hrs, available hrs, utilization %, color-coded badge
  - Create `src/components/reports/productivity/hours-by-practice-area-chart.tsx` (Recharts BarChart or PieChart)
  - Create `src/components/reports/productivity/hours-by-case-table.tsx` (DataTable sortable)

- [ ] **Task 5: Assemble billing report page** (AC 1-5, 11, 12, 13)
  - Create `src/app/(dashboard)/reports/billing/page.tsx` composing filter bar, aging summary, outstanding by client, collection rate, avg days, write-off summary
  - Server Component fetching data, passing to client chart/table components
  - Include CSV export buttons per section
  - Add loading skeletons

- [ ] **Task 6: Assemble productivity report page** (AC 6-10, 11, 12, 13)
  - Create `src/app/(dashboard)/reports/productivity/page.tsx` composing filter bar, hours charts, utilization table
  - Server Component pattern with client chart components
  - Include CSV export buttons per section
  - Add loading skeletons

- [ ] **Task 7: Add print-friendly styles** (AC 13)
  - Add `@media print` CSS to billing and productivity report pages
  - Ensure charts render at reasonable sizes, tables don't break across pages poorly
  - Hide navigation, filters, and action buttons in print view

- [ ] **Task 8: Wire up report navigation** (AC 1)
  - Add Billing and Productivity tabs/links to reports layout navigation
  - Ensure breadcrumbs show Reports > Billing or Reports > Productivity

## Dev Notes

- **Aging Calculation:** Aging buckets are calculated from `invoice.due_date` compared to the current date. Use `CASE WHEN` in SQL or compute in application layer. Invoices with status Paid or Void are excluded.
- **Utilization Rate:** Available hours default to 8 hours/day times the number of business days (Mon-Fri) in the selected date range. Consider making the daily hours configurable via firm_settings (Story 18.1).
- **Collection Rate Formula:** `(SUM of payments received in period) / (SUM of invoice totals issued in period) * 100`. This may exceed 100% if payments for older invoices arrive in the current period.
- **Stacked Bar Chart:** Use Recharts `<BarChart>` with two `<Bar>` components stacked (`stackId="a"`) for billable vs non-billable.
- **Drill-Down:** Outstanding by client table rows should be clickable, navigating to a filtered invoice list for that client, or expanding inline to show individual invoices.
- **Performance:** Billing queries may be slow on large datasets. Add indexes on `invoices.due_date`, `invoices.status`, `payments.payment_date`, `time_entries.attorney_id`, `time_entries.billable`.
- **Reuse:** The report filters component from Story 17.1 should be reused here. Extend it with case and client filter options as needed.

### Project Structure Notes

**New files to create:**
- `src/app/(dashboard)/reports/billing/page.tsx`
- `src/app/(dashboard)/reports/productivity/page.tsx`
- `src/components/reports/billing/aging-summary.tsx`
- `src/components/reports/billing/outstanding-by-client.tsx`
- `src/components/reports/billing/collection-rate-card.tsx`
- `src/components/reports/billing/avg-days-to-payment-card.tsx`
- `src/components/reports/billing/write-off-summary.tsx`
- `src/components/reports/productivity/hours-by-attorney-chart.tsx`
- `src/components/reports/productivity/billable-ratio-chart.tsx`
- `src/components/reports/productivity/utilization-rate-table.tsx`
- `src/components/reports/productivity/hours-by-practice-area-chart.tsx`
- `src/components/reports/productivity/hours-by-case-table.tsx`
- `src/lib/queries/reports/billing.ts`
- `src/lib/queries/reports/productivity.ts`

**Files to modify:**
- `src/app/(dashboard)/reports/layout.tsx` (add billing and productivity nav tabs)
- Report filters component (extend with case/client filters if not already present)

### References

- [Source: a.md -- Law Firm Registry Implementation Plan]
- [Source: epics.md -- Epic 17: Reports & Analytics, Story 17.2]
- Recharts BarChart stacked: https://recharts.org/en-US/api/BarChart
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
