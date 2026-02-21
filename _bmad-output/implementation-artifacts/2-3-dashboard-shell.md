# Story 2.3: Dashboard Shell & Navigation Layout

Status: ready-for-dev

## Story

As a user,
I want a professional layout with sidebar, header, and responsive nav,
so that I can navigate efficiently.

## Acceptance Criteria (ACs)

1. Dashboard layout with collapsible sidebar (expand/collapse toggle)
2. Navigation organized into groups: Main, Management, Work, Finance, Communication, Analytics, System
3. Each navigation item has: Lucide icon, label, active state highlighting, badge count support
4. Header contains: firm logo, search trigger (Cmd+K shortcut hint), notification bell icon, user avatar with dropdown menu
5. Mobile navigation: hamburger menu button that opens sidebar in a Sheet (slide-over) overlay
6. Portal layout with simplified navigation for client users (Dashboard, My Cases, My Documents, My Invoices, Messages, My Profile)
7. Breadcrumbs component for page hierarchy display
8. Sidebar collapsed/expanded state persisted in localStorage
9. Branch selector dropdown in sidebar for admin users (multi-branch support)
10. Loading skeletons displayed while page content loads

## Tasks / Subtasks

- [ ] Create `src/app/(dashboard)/layout.tsx` — Dashboard layout wrapping all dashboard routes with Sidebar + Header + main content area (AC1)
- [ ] Create `src/components/layout/sidebar.tsx` — Collapsible sidebar component with expand/collapse toggle button, nav groups, and collapse animation (AC1, AC2)
- [ ] Create `src/components/layout/sidebar-nav.ts` — Navigation configuration defining all nav groups and items with icons: Main (Dashboard), Management (Attorneys, Clients, Branches), Work (Cases, Calendar, Deadlines, Tasks, Bring-Ups, Documents), Finance (Time Tracking, Expenses, Billing, Trust Accounts, Petty Cash, Requisitions), Communication (Messages, Notifications), Analytics (Reports), System (Settings) (AC2)
- [ ] Implement nav items with Lucide icon, label text, active state (highlighted background/text based on current pathname), and optional badge count (e.g., unread messages, overdue items) (AC3)
- [ ] Create `src/components/layout/header.tsx` — Top header bar with: firm logo (left), search trigger button showing "Search... Cmd+K" (center/left), notification bell icon with unread count badge (right), user avatar with dropdown menu (right) (AC4)
- [ ] Create `src/components/layout/user-nav.tsx` — User avatar dropdown menu with: user name, email, role badge, "My Profile" link, "Settings" link (admin only), theme toggle placeholder, "Sign Out" action (AC4)
- [ ] Create `src/components/layout/mobile-nav.tsx` — Mobile hamburger menu button (visible on small screens) that triggers a shadcn Sheet component sliding in from the left with the full sidebar navigation (AC5)
- [ ] Create `src/app/(portal)/layout.tsx` — Portal layout for client users with simplified sidebar containing: Dashboard, My Cases, My Documents, My Invoices, Messages, My Profile (AC6)
- [ ] Create `src/components/layout/portal-sidebar.tsx` — Simplified portal sidebar with client-specific navigation items and firm branding (AC6)
- [ ] Create `src/components/shared/breadcrumbs.tsx` — Breadcrumbs component that renders based on the current pathname segments (e.g., Dashboard > Cases > Case #2026-0001) (AC7)
- [ ] Implement sidebar state persistence: store collapsed/expanded boolean in localStorage, read on mount, toggle updates storage (AC8)
- [ ] Create `src/components/layout/branch-selector.tsx` — Branch selector dropdown shown in sidebar for admin users, allows switching between branches (reads from branches table) (AC9)
- [ ] Create `src/components/shared/page-skeleton.tsx` — Loading skeleton component for page-level loading states (stat card skeletons, table row skeletons, chart skeletons) (AC10)
- [ ] Create `src/app/(dashboard)/loading.tsx` — Dashboard loading state using skeleton components (AC10)
- [ ] Create `src/app/(portal)/loading.tsx` — Portal loading state using skeleton components (AC10)
- [ ] Implement responsive design: sidebar hidden on mobile (< md breakpoint), hamburger menu visible; sidebar visible on desktop (>= md), full-width content on mobile (AC5)
- [ ] Style sidebar with consistent spacing, group labels (muted text), hover states, and active item highlighting using Tailwind CSS (AC2, AC3)
- [ ] Add keyboard shortcut listener for Cmd+K / Ctrl+K on the search trigger (placeholder — actual search built in Story 3.3) (AC4)

## Dev Notes

### Architecture & Constraints
- The dashboard layout uses a two-column design: fixed sidebar (left) + scrollable main content (right)
- Sidebar width: expanded ~256px, collapsed ~64px (icons only)
- Header is sticky at the top of the main content area
- Use shadcn/ui Sheet component for mobile navigation overlay
- Use shadcn/ui DropdownMenu for user avatar menu
- Use shadcn/ui Button, Badge, Avatar, Separator, ScrollArea components
- The sidebar should use `usePathname()` from next/navigation to determine active nav item
- Branch selector only appears when user role is admin (check session)

### Navigation Groups
```
Main:
  - Dashboard (LayoutDashboard icon) -> /dashboard

Management:
  - Attorneys (Users icon) -> /attorneys
  - Clients (UserCheck icon) -> /clients
  - Branches (Building2 icon) -> /branches [admin only]

Work:
  - Cases (Briefcase icon) -> /cases
  - Calendar (Calendar icon) -> /calendar
  - Deadlines (Clock icon) -> /deadlines
  - Tasks (CheckSquare icon) -> /tasks
  - Bring-Ups (Bell icon) -> /bring-ups
  - Documents (FileText icon) -> /documents

Finance:
  - Time Tracking (Timer icon) -> /time-tracking
  - Expenses (Receipt icon) -> /expenses
  - Billing (CreditCard icon) -> /billing
  - Trust Accounts (Landmark icon) -> /trust-accounts
  - Petty Cash (Wallet icon) -> /petty-cash
  - Requisitions (ClipboardList icon) -> /requisitions

Communication:
  - Messages (MessageSquare icon) -> /messages [badge: unread count]
  - Notifications (Bell icon) -> /notifications

Analytics:
  - Reports (BarChart3 icon) -> /reports

System:
  - Settings (Settings icon) -> /settings
```

### Portal Navigation
```
- Dashboard (LayoutDashboard icon) -> /portal
- My Cases (Briefcase icon) -> /portal/cases
- My Documents (FileText icon) -> /portal/documents
- My Invoices (CreditCard icon) -> /portal/invoices
- Messages (MessageSquare icon) -> /portal/messages
- My Profile (User icon) -> /portal/profile
```

### Sidebar Collapse Persistence
```typescript
// Use a custom hook
const [collapsed, setCollapsed] = useState(() => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  }
  return false;
});

useEffect(() => {
  localStorage.setItem('sidebar-collapsed', String(collapsed));
}, [collapsed]);
```

### Project Structure Notes

Files to create:
- `src/app/(dashboard)/layout.tsx` — Dashboard layout
- `src/app/(dashboard)/loading.tsx` — Dashboard loading state
- `src/app/(portal)/layout.tsx` — Portal layout
- `src/app/(portal)/loading.tsx` — Portal loading state
- `src/components/layout/sidebar.tsx` — Collapsible sidebar
- `src/components/layout/sidebar-nav.ts` — Nav configuration
- `src/components/layout/header.tsx` — Top header bar
- `src/components/layout/user-nav.tsx` — User avatar dropdown
- `src/components/layout/mobile-nav.tsx` — Mobile navigation Sheet
- `src/components/layout/portal-sidebar.tsx` — Client portal sidebar
- `src/components/layout/branch-selector.tsx` — Branch selector (admin)
- `src/components/shared/breadcrumbs.tsx` — Breadcrumbs component
- `src/components/shared/page-skeleton.tsx` — Loading skeleton components

Files to modify:
- None (uses auth from Story 2.1)

### References

- [Source: a.md — Project Structure: components/layout/]
- [Source: a.md — Module 2: Dashboard (widget descriptions)]
- [Source: a.md — Module 11: Client Portal (portal navigation)]
- [Source: epics.md — Epic 2, Story 2.3]
