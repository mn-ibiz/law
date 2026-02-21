# Story 13.1: Client Portal Layout & Dashboard

Status: ready-for-dev

## Story

As a Client,
I want a dedicated portal with overview dashboard,
so that I can access my information easily.

## Acceptance Criteria (ACs)

1. Portal layout is served at the `/(portal)` route group with a simplified sidebar containing: Dashboard, My Cases, My Documents, My Invoices, Messages, My Profile.
2. Portal header displays: firm logo, client name, notification bell icon (with unread count badge), and a logout button.
3. Portal has a professional design that is visually distinct from the internal staff dashboard (different color scheme or layout treatment).
4. Portal dashboard displays stat cards: open cases count, pending documents count, and outstanding balance (KES formatted with commas).
5. Portal dashboard displays a case list showing all of the client's cases with status and last update date.
6. Portal dashboard displays the 5 most recent documents shared with the client.
7. Portal dashboard displays outstanding invoices with amount and due date.
8. Portal dashboard displays the 3 most recent messages from attorney(s).
9. Route protection enforces client-only access; Admin and Attorney roles are redirected away from `/(portal)` routes.
10. Role-based redirect sends Client users to `/portal` on login, while Admin/Attorney users are redirected to `/dashboard`.
11. All stat cards use shadcn Card components with icon, label, and value. KES amounts use comma formatting.
12. Dashboard layout is a responsive grid (3 columns desktop, 2 columns tablet, 1 column mobile).
13. Loading skeletons are displayed while dashboard data is being fetched.

## Tasks / Subtasks

- [ ] **Task 1: Create Portal Layout Shell** (AC 1, AC 2, AC 3)
  - [ ] Create `src/app/(portal)/layout.tsx` with simplified sidebar navigation
  - [ ] Build `src/components/layout/portal-sidebar.tsx` with nav items: Dashboard, My Cases, My Documents, My Invoices, Messages, My Profile (each with Lucide icon and active state)
  - [ ] Build `src/components/layout/portal-header.tsx` with firm logo, client name display, notification bell with badge, and logout button
  - [ ] Apply distinct portal styling (separate color theme or accent colors) to differentiate from internal dashboard
  - [ ] Implement mobile responsive sidebar using shadcn Sheet component with hamburger menu trigger

- [ ] **Task 2: Implement Route Protection for Portal** (AC 9, AC 10)
  - [ ] Update RBAC middleware in `src/lib/auth/` to restrict `/(portal)/*` routes to Client role only
  - [ ] Return 403 or redirect Admin/Attorney users attempting to access portal routes
  - [ ] Verify role-based redirect logic in NextAuth callbacks: Client -> `/portal`, Admin/Attorney -> `/dashboard`
  - [ ] Test that unauthenticated users are redirected to the login page

- [ ] **Task 3: Build Portal Dashboard Page** (AC 4, AC 5, AC 6, AC 7, AC 8, AC 11, AC 12, AC 13)
  - [ ] Create `src/app/(portal)/portal/page.tsx` as the portal dashboard
  - [ ] Create `src/lib/queries/portal-dashboard.ts` with query functions:
    - `getClientOpenCasesCount(clientId)`
    - `getClientPendingDocumentsCount(clientId)`
    - `getClientOutstandingBalance(clientId)`
    - `getClientCases(clientId)`
    - `getClientRecentDocuments(clientId, limit: 5)`
    - `getClientOutstandingInvoices(clientId)`
    - `getClientRecentMessages(clientId, limit: 3)`
  - [ ] Build stat cards component using shadcn Card with Lucide icons, KES formatting utility from `src/lib/utils/`
  - [ ] Build case list widget (case number, title, status badge, last update)
  - [ ] Build recent documents widget (document name, date, download link)
  - [ ] Build outstanding invoices widget (fee note number, amount KES, due date, status badge, overdue highlighting)
  - [ ] Build recent messages widget (sender, subject, date, truncated preview)
  - [ ] Implement responsive grid layout (3/2/1 column breakpoints)
  - [ ] Add loading skeleton components for each dashboard section

- [ ] **Task 4: Server-Side Data Scoping** (AC 9)
  - [ ] Ensure all portal queries filter by the authenticated client's ID from the session
  - [ ] Add server-side checks in all query functions to prevent data leakage across clients
  - [ ] Validate session role is "Client" before executing any portal query

## Dev Notes

- **Architecture:** Use Next.js App Router Server Components for the dashboard page. All data fetching happens server-side using Drizzle ORM queries against the `cases`, `documents`, `invoices`, `messages`, and `clients` tables.
- **Auth:** Use `auth()` from NextAuth.js v5 to get the session in Server Components. The session JWT contains `user.id`, `user.role`, and `user.email`. Map `user.id` to `clients.userId` to determine the client record.
- **KES Formatting:** Use a shared utility like `formatCurrency(amount: number): string` that formats with "KES" prefix and comma separators (e.g., "KES 150,000.00"). Place in `src/lib/utils/format.ts`.
- **Styling:** Portal should use Tailwind CSS with shadcn/ui but with a visually distinct treatment (e.g., different sidebar background color, accent color, or layout width) so clients immediately recognize they are in the portal, not the admin dashboard.
- **Loading States:** Use shadcn Skeleton component in `Suspense` boundaries around each data section.
- **Middleware:** The existing RBAC middleware in `src/middleware.ts` should have a portal route group check. Pattern: `/(portal)/(.*)` requires role === "Client".

### Project Structure Notes

**Files to Create:**
- `src/app/(portal)/layout.tsx` — Portal root layout with sidebar and header
- `src/app/(portal)/portal/page.tsx` — Portal dashboard page
- `src/components/layout/portal-sidebar.tsx` — Simplified portal sidebar
- `src/components/layout/portal-header.tsx` — Portal header with firm logo, client name, bell, logout
- `src/lib/queries/portal-dashboard.ts` — Dashboard query functions scoped to client

**Files to Modify:**
- `src/middleware.ts` — Add portal route group protection
- `src/lib/auth/` (auth config) — Verify role-based redirect logic in session/JWT callbacks
- `src/lib/utils/format.ts` — Add/verify KES currency formatter

### References

- [Source: epics.md — Epic 13, Story 13.1: Client Portal Layout & Dashboard]
- [Source: a.md — Module 11: Client Portal — Portal Navigation, Features]
- [Source: a.md — Module 2: Dashboard — Client Dashboard Widgets]
- [Source: a.md — Module 1: Authentication & Authorization — RBAC Permissions Matrix]
- [Source: a.md — Project Structure — src/app/(portal)/]

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
