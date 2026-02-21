# Story 3.1: Role-Based Dashboards with KPI Stat Cards

Status: ready-for-dev

## Story

As an Admin/Attorney/Client,
I want role-specific dashboards with key metrics,
so that I can understand my workload at a glance.

## Acceptance Criteria (ACs)

1. Admin dashboard displays stat cards: Active Cases count, Total Clients count, Revenue This Month (KES), Outstanding Invoices amount (KES), Active Attorneys count, Overdue Deadlines count
2. Attorney dashboard displays stat cards: My Active Cases count, Hours This Week, Billable Hours This Month, Upcoming Deadlines count, Unread Messages count
3. Client portal dashboard displays stat cards: Open Cases count, Pending Documents count, Outstanding Balance (KES)
4. All stat cards use shadcn Card component with icon, label, and value
5. All KES monetary values formatted with commas (e.g., KES 1,250,000)
6. Dashboard layout uses responsive grid: 3 columns on desktop, 2 on tablet, 1 on mobile
7. Loading skeletons displayed while data loads

## Tasks / Subtasks

- [ ] Create `src/lib/queries/dashboard.ts` — Server-side query functions: `getAdminDashboardStats()`, `getAttorneyDashboardStats(userId)`, `getClientDashboardStats(userId)` that aggregate counts and sums from the database (AC1, AC2, AC3)
- [ ] Implement `getAdminDashboardStats()`: count active cases (status in Open/In Progress/Hearing), count total clients (active), sum revenue this month (payments received), sum outstanding invoices (unpaid/partial), count active attorneys, count overdue deadlines (past due date, not completed) (AC1)
- [ ] Implement `getAttorneyDashboardStats(userId)`: count attorney's active assigned cases, sum hours logged this week (Mon-Sun), sum billable hours this month, count upcoming deadlines on assigned cases (next 7 days), count unread messages for this user (AC2)
- [ ] Implement `getClientDashboardStats(userId)`: count client's open cases, count pending/unverified documents requiring client attention, sum outstanding invoice balance (AC3)
- [ ] Create `src/components/shared/stat-card.tsx` — Reusable stat card component using shadcn Card: accepts icon (Lucide), label (string), value (string/number), optional trend indicator, optional formatting (currency/number) (AC4)
- [ ] Create `src/lib/utils/format.ts` — Utility functions: `formatKES(amount: number): string` that formats as "KES 1,250,000" with comma separators, `formatNumber(n: number): string` for count formatting (AC5)
- [ ] Create `src/app/(dashboard)/dashboard/page.tsx` — Main dashboard page that reads session, determines role, renders appropriate dashboard component (AC1, AC2)
- [ ] Create `src/components/dashboard/admin-dashboard.tsx` — Admin dashboard component rendering 6 stat cards in a responsive grid, fetching data from server query (AC1, AC6)
- [ ] Create `src/components/dashboard/attorney-dashboard.tsx` — Attorney dashboard component rendering 5 stat cards in a responsive grid (AC2, AC6)
- [ ] Create `src/app/(portal)/portal/page.tsx` — Client portal dashboard page rendering 3 stat cards plus additional widgets (AC3, AC6)
- [ ] Create `src/components/dashboard/client-dashboard.tsx` — Client dashboard component rendering 3 stat cards in a responsive grid (AC3, AC6)
- [ ] Implement responsive grid layout using Tailwind: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4` (AC6)
- [ ] Create `src/components/dashboard/dashboard-skeleton.tsx` — Skeleton loading states for stat cards (pulsing card placeholders matching stat card dimensions) (AC7)
- [ ] Add Suspense boundaries around dashboard stat cards with skeleton fallbacks (AC7)

## Dev Notes

### Architecture & Constraints
- Dashboard pages are Server Components that fetch data directly using query functions
- Query functions use Drizzle ORM to aggregate data (COUNT, SUM) in single optimized queries where possible
- The main dashboard page (`/dashboard`) checks the session role and renders the appropriate dashboard variant
- Client dashboard lives at `/portal` (separate route group)
- All monetary values are stored as `decimal`/`numeric` in the database and formatted as KES on display
- Use `Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' })` or a custom formatter

### KES Formatting
```typescript
export function formatKES(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
```

### Stat Card Icons (Lucide)
- Admin: Briefcase (cases), Users (clients), DollarSign/Banknote (revenue), FileWarning (invoices), UserCheck (attorneys), AlertTriangle (deadlines)
- Attorney: Briefcase (cases), Clock (hours), Timer (billable), Calendar (deadlines), MessageSquare (messages)
- Client: Briefcase (cases), FileText (documents), CreditCard (balance)

### Query Optimization
- Use a single query per stat where possible, not N+1
- For the admin "revenue this month" stat, query payments table with date filter
- For outstanding invoices, SUM the balance due (total - amount_paid) where status is not Paid/Void
- Consider using `sql` template for complex aggregations in Drizzle

### Project Structure Notes

Files to create:
- `src/app/(dashboard)/dashboard/page.tsx` — Main dashboard page
- `src/app/(portal)/portal/page.tsx` — Client portal dashboard page
- `src/lib/queries/dashboard.ts` — Dashboard data query functions
- `src/lib/utils/format.ts` — KES and number formatting utilities
- `src/components/shared/stat-card.tsx` — Reusable stat card component
- `src/components/dashboard/admin-dashboard.tsx` — Admin dashboard
- `src/components/dashboard/attorney-dashboard.tsx` — Attorney dashboard
- `src/components/dashboard/client-dashboard.tsx` — Client dashboard
- `src/components/dashboard/dashboard-skeleton.tsx` — Loading skeletons

Files to modify:
- None

### References

- [Source: a.md — Module 2: Dashboard (Admin/Attorney/Client widget specs)]
- [Source: epics.md — Epic 3, Story 3.1]
- [Source: a.md — Implementation Phases, Phase 2, step 1]
