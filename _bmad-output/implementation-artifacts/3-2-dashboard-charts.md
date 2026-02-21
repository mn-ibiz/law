# Story 3.2: Dashboard Charts & Data Widgets

Status: ready-for-dev

## Story

As an Admin/Attorney,
I want charts and data tables on my dashboard,
so that I can identify trends and issues.

## Acceptance Criteria (ACs)

1. Admin dashboard includes: Revenue line chart (12-month trend), Case status donut chart, Recent cases table (last 10), Upcoming deadlines list (next 10), Overdue invoices table
2. Attorney dashboard includes: My cases table (assigned cases), My deadlines list (next 7), Recent time entries table (last 5), My tasks list (open tasks)
3. All charts use Recharts library and are responsive (resize with container)
4. Empty states displayed when no data exists (e.g., "No cases yet", "No overdue invoices")
5. Clickable items navigate to their detail pages (e.g., clicking a case row navigates to /cases/[id])

## Tasks / Subtasks

- [ ] Create `src/lib/queries/dashboard-charts.ts` — Query functions for chart data: `getMonthlyRevenue()` returns 12-month revenue array, `getCaseStatusDistribution()` returns case counts by status, `getRecentCases(limit)`, `getUpcomingDeadlines(limit)`, `getOverdueInvoices()` (AC1)
- [ ] Create `src/lib/queries/dashboard-attorney.ts` — Attorney-specific query functions: `getAttorneyCases(userId)`, `getAttorneyDeadlines(userId, limit)`, `getAttorneyRecentTimeEntries(userId, limit)`, `getAttorneyTasks(userId)` (AC2)
- [ ] Create `src/components/dashboard/charts/revenue-chart.tsx` — Recharts ResponsiveContainer + LineChart showing monthly revenue over 12 months, with KES y-axis formatting, tooltips, month labels on x-axis (AC1, AC3)
- [ ] Create `src/components/dashboard/charts/case-status-chart.tsx` — Recharts ResponsiveContainer + PieChart (donut) showing cases by status (Open=blue, In Progress=amber, Hearing=purple, Resolved=green, Closed=gray), with legend and tooltips (AC1, AC3)
- [ ] Create `src/components/dashboard/widgets/recent-cases-table.tsx` — Table showing last 10 cases with columns: case number, title, client name, status badge, lead attorney, date created; rows clickable to navigate to /cases/[id] (AC1, AC5)
- [ ] Create `src/components/dashboard/widgets/upcoming-deadlines.tsx` — List showing next 10 upcoming deadlines with: title, case reference, due date (relative: "in 3 days"), priority badge, assigned attorney; items clickable to /cases/[caseId] (AC1, AC5)
- [ ] Create `src/components/dashboard/widgets/overdue-invoices-table.tsx` — Table showing overdue invoices with columns: invoice number, client name, amount (KES), due date, days overdue (red text); rows clickable to /billing/[id] (AC1, AC5)
- [ ] Create `src/components/dashboard/widgets/attorney-cases-table.tsx` — Table of attorney's assigned cases: case number, title, client, status, next deadline; rows clickable to /cases/[id] (AC2, AC5)
- [ ] Create `src/components/dashboard/widgets/attorney-deadlines.tsx` — List of attorney's next 7 deadlines with case reference, due date, priority; items clickable (AC2, AC5)
- [ ] Create `src/components/dashboard/widgets/attorney-time-entries.tsx` — Table of last 5 time entries: case, hours, description, date; rows clickable to /time-tracking (AC2, AC5)
- [ ] Create `src/components/dashboard/widgets/attorney-tasks.tsx` — List of open tasks: title, case, due date, priority, status; items clickable to /tasks/[id] (AC2, AC5)
- [ ] Create `src/components/shared/empty-state.tsx` — Reusable empty state component with icon, title, description, optional action button (e.g., "No cases yet — create your first case") (AC4)
- [ ] Add empty state rendering to all tables and lists when data arrays are empty (AC4)
- [ ] Update `src/components/dashboard/admin-dashboard.tsx` — Add chart and widget sections below stat cards in a two-column grid layout (AC1)
- [ ] Update `src/components/dashboard/attorney-dashboard.tsx` — Add widget sections below stat cards (AC2)
- [ ] Wrap chart components in client-side boundaries (Recharts requires client rendering) using `"use client"` directive (AC3)

## Dev Notes

### Architecture & Constraints
- Recharts components must be Client Components (`"use client"`) because they use browser APIs
- Data fetching should happen in Server Components; pass data as props to chart Client Components
- Use `ResponsiveContainer` from Recharts for all charts to ensure they resize
- Dashboard page is a Server Component that fetches data, then passes to client chart components
- Table widgets can use simple HTML tables or a lightweight table component (not full DataTable — that is for list pages)

### Recharts Patterns
```typescript
// Revenue Line Chart
"use client";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function RevenueChart({ data }: { data: { month: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(v) => `KES ${(v/1000).toFixed(0)}k`} />
        <Tooltip formatter={(v: number) => formatKES(v)} />
        <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

### Dashboard Layout (Admin)
```
[Stat Cards Row — 3 columns]
[Revenue Chart | Case Status Donut — 2 columns]
[Recent Cases Table — full width]
[Upcoming Deadlines | Overdue Invoices — 2 columns]
```

### Dashboard Layout (Attorney)
```
[Stat Cards Row — 3 columns (wraps to 2)]
[My Cases Table — full width]
[My Deadlines | My Tasks — 2 columns]
[Recent Time Entries — full width]
```

### Click Navigation
- Use Next.js `Link` component or `useRouter().push()` for navigation on click
- Table rows should use `<Link href={/cases/${id}}>` wrapping or `onClick` with router

### Project Structure Notes

Files to create:
- `src/lib/queries/dashboard-charts.ts` — Admin chart/widget queries
- `src/lib/queries/dashboard-attorney.ts` — Attorney widget queries
- `src/components/dashboard/charts/revenue-chart.tsx` — Revenue line chart
- `src/components/dashboard/charts/case-status-chart.tsx` — Case status donut chart
- `src/components/dashboard/widgets/recent-cases-table.tsx` — Recent cases widget
- `src/components/dashboard/widgets/upcoming-deadlines.tsx` — Deadlines widget
- `src/components/dashboard/widgets/overdue-invoices-table.tsx` — Overdue invoices widget
- `src/components/dashboard/widgets/attorney-cases-table.tsx` — Attorney cases widget
- `src/components/dashboard/widgets/attorney-deadlines.tsx` — Attorney deadlines widget
- `src/components/dashboard/widgets/attorney-time-entries.tsx` — Attorney time entries widget
- `src/components/dashboard/widgets/attorney-tasks.tsx` — Attorney tasks widget
- `src/components/shared/empty-state.tsx` — Reusable empty state component

Files to modify:
- `src/components/dashboard/admin-dashboard.tsx` — Add charts and widgets
- `src/components/dashboard/attorney-dashboard.tsx` — Add widgets

### References

- [Source: a.md — Module 2: Dashboard (Admin Dashboard Widgets 2-6, Attorney Dashboard Widgets 2-5)]
- [Source: a.md — Module 13: Reports & Analytics (chart types)]
- [Source: epics.md — Epic 3, Story 3.2]
