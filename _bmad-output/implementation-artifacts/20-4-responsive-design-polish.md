# Story 20.4: Responsive Design Polish & UX

Status: ready-for-dev

## Story

As a user,
I want a polished, responsive interface with proper loading states, error handling, and empty states,
so that the system works well on any device and provides clear feedback at all times.

## Acceptance Criteria (ACs)

1. **DataTables Responsive:** All DataTable instances use horizontal scroll on mobile viewports, or switch to a card/list layout for narrow screens. Column prioritization ensures key columns are visible first.
2. **Mobile Sidebar:** On mobile (< 768px), the sidebar collapses entirely and is accessible via a hamburger menu button that opens a Sheet (slide-over) overlay. Sheet closes on navigation.
3. **Touch-Friendly Targets:** All interactive elements (buttons, links, form controls, table rows) have a minimum 44px tap target size on mobile for accessibility.
4. **Responsive Forms:** Forms use single-column layout on mobile and multi-column (2-3 column grid) on desktop. Labels stack above inputs on mobile.
5. **Dashboard Cards Responsive:** Dashboard KPI cards use a responsive grid: 3 columns on desktop (> 1024px), 2 columns on tablet (768-1024px), 1 column on mobile (< 768px).
6. **Calendar Responsive:** Calendar view simplifies on mobile: month view shows dots/badges instead of full text, day view is default on mobile, swipe gestures for navigation if feasible.
7. **Loading Skeletons:** Every data-fetching page has skeleton loading components that match the layout of the final content: skeleton cards for dashboard, skeleton rows for tables, skeleton sections for detail pages. Using shadcn Skeleton component.
8. **Error Boundaries:** Per route-group error boundaries (`error.tsx` files) catch React errors and display user-friendly error messages with a "Try Again" button. Different error UIs for 404, 403, and generic errors.
9. **Empty States:** All list pages display a friendly empty state when no data exists: illustration or icon, descriptive message (e.g., "No cases yet"), and a call-to-action button (e.g., "Create your first case"). Empty states are contextual to the entity type.
10. **Toast Notifications:** All server action results (success and error) trigger toast notifications using shadcn Toast/Sonner. Success: green with check icon. Error: red with X icon. Include brief descriptive message.
11. **Form Submission States:** All form submit buttons show a disabled state with a spinner icon during submission. Prevents double-submission. Button text changes (e.g., "Saving..." or "Creating...").

## Tasks / Subtasks

- [ ] **Task 1: Audit and fix DataTable responsiveness** (AC 1)
  - Review all DataTable instances across the application
  - Add horizontal scroll wrapper (`overflow-x-auto`) on mobile
  - Implement column visibility: hide non-essential columns on small screens using @tanstack/react-table column visibility API
  - Consider creating a `<ResponsiveDataTable>` wrapper component that handles mobile layout switching
  - Test on 320px, 375px, 768px, 1024px, 1440px breakpoints

- [ ] **Task 2: Implement mobile sidebar with Sheet** (AC 2)
  - Create `src/components/layout/mobile-sidebar.tsx` using shadcn Sheet component
  - Hamburger menu button (Lucide `Menu` icon) visible on mobile (< 768px)
  - Sheet slides from left, contains full sidebar navigation
  - Close on: outside click, navigation item click, close button
  - Hide desktop sidebar on mobile, show hamburger instead
  - Animate open/close transitions

- [ ] **Task 3: Verify and fix touch target sizes** (AC 3)
  - Audit all buttons, links, and interactive elements
  - Set minimum height/width of 44px on mobile for all tap targets
  - Add padding to small icons/links to meet 44px target
  - Create utility CSS class `touch-target` or Tailwind plugin: `min-h-[44px] min-w-[44px]`
  - Test with mobile device or Chrome DevTools touch simulation

- [ ] **Task 4: Make all forms responsive** (AC 4)
  - Audit all form layouts across the application
  - Apply responsive grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
  - Labels stack above inputs on all screen sizes (already standard with shadcn forms)
  - Full-width inputs on mobile
  - Multi-step forms: steps stack vertically on mobile
  - File upload zones: full width on mobile

- [ ] **Task 5: Fix dashboard card responsiveness** (AC 5)
  - Update dashboard layout grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`
  - Verify Admin, Attorney, and Client dashboard card grids
  - Cards should not overflow on narrow screens
  - Chart containers use `<ResponsiveContainer>` from Recharts

- [ ] **Task 6: Simplify calendar on mobile** (AC 6)
  - Add responsive behavior to calendar components
  - Mobile (< 768px): default to day or agenda view instead of month
  - Month view on mobile: show colored dots/indicators instead of full event text
  - Ensure date navigation arrows are touch-friendly
  - Swipe gesture for day/week navigation (optional, use `react-swipeable` if needed)

- [ ] **Task 7: Create skeleton loading components** (AC 7)
  - Create `src/components/ui/skeletons/` directory with reusable skeleton components:
    - `dashboard-skeleton.tsx` - grid of skeleton cards matching dashboard layout
    - `data-table-skeleton.tsx` - skeleton rows matching table columns (configurable row/column count)
    - `detail-page-skeleton.tsx` - skeleton matching entity detail page layout (header, tabs, content)
    - `form-skeleton.tsx` - skeleton matching form layout
    - `chart-skeleton.tsx` - skeleton matching chart container dimensions
  - Use shadcn `<Skeleton>` primitive with `animate-pulse`
  - Apply skeletons in `loading.tsx` files for each route:
    - `src/app/(dashboard)/loading.tsx`
    - `src/app/(dashboard)/cases/loading.tsx`
    - `src/app/(dashboard)/clients/loading.tsx`
    - (and all other major routes)

- [ ] **Task 8: Implement error boundaries** (AC 8)
  - Create `src/app/(dashboard)/error.tsx` as the dashboard route group error boundary
  - Create `src/app/(portal)/error.tsx` as the portal route group error boundary
  - Create `src/app/(auth)/error.tsx` as the auth route group error boundary
  - Error UI includes:
    - Error icon (Lucide `AlertTriangle`)
    - User-friendly message (not raw error text)
    - "Try Again" button that calls `reset()` function
    - "Go Home" link
  - Create `src/app/not-found.tsx` for 404 errors (custom design)
  - Create or verify `src/components/403.tsx` for unauthorized access (linked from middleware)
  - Different messaging for 404 ("Page not found"), 403 ("Access denied"), generic ("Something went wrong")

- [ ] **Task 9: Add empty states to all list pages** (AC 9)
  - Create `src/components/ui/empty-state.tsx` - reusable empty state component
  - Props: icon (Lucide icon), title, description, actionLabel, actionHref
  - Add empty states to all list pages:
    - Cases: "No cases yet" + "Create your first case" button
    - Clients: "No clients yet" + "Add your first client" button
    - Documents: "No documents uploaded" + "Upload a document" button
    - Invoices: "No invoices created" + "Create a fee note" button
    - Time Entries: "No time entries logged" + "Log your first entry" button
    - (and all other list pages)
  - Empty states shown when data query returns zero results AND no filters are active
  - When filters are active but no results: "No results for your filters" + "Clear filters" button

- [ ] **Task 10: Implement toast notifications and form submission states** (AC 10, 11)
  - Verify `sonner` or shadcn `Toast` is configured at the root layout
  - Audit all server actions and ensure they return structured results: `{ success: boolean, message: string, data? }`
  - Wrap all form submit handlers to show:
    - Loading: disable button, show spinner (Lucide `Loader2` with `animate-spin`), change text to "Saving..."
    - Success: toast with green check and message
    - Error: toast with red X and error message
  - Create `src/components/ui/submit-button.tsx` - reusable submit button with loading state
  - Props: `isLoading`, `loadingText`, `children` (default label)
  - Prevent double-submission by disabling during pending state

## Dev Notes

- **Responsive Breakpoints:** Follow Tailwind CSS defaults: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px). Primary focus: mobile (< 768px), tablet (768-1024px), desktop (> 1024px).
- **Mobile-First Approach:** Tailwind encourages mobile-first CSS. Base styles target mobile, with `md:`, `lg:` prefixes for larger screens. Audit existing styles to ensure this pattern.
- **DataTable Responsive Strategy:** @tanstack/react-table supports column visibility toggling. On mobile, hide columns like "created_at", "branch", and secondary fields. Keep primary identifier and status visible. The `useMediaQuery` hook can detect screen size for conditional column rendering.
- **Skeleton Dimensions:** Skeletons should closely match the dimensions of the real content to avoid layout shift (CLS). Use fixed heights for cards, table rows, etc.
- **Error Boundary Pattern:** Next.js App Router error boundaries (`error.tsx`) catch errors in the route segment and its children. They receive `error` and `reset` props. The `reset` function attempts to re-render the segment.
- **Toast Library:** `sonner` is the recommended toast library for shadcn/ui. It's lightweight and provides clean animations. Configure in root layout with `<Toaster />`.
- **Performance Testing:** After responsive polish, test Lighthouse scores on mobile. Target: Performance > 80, Accessibility > 90, Best Practices > 90.
- **Empty State Illustrations:** Use Lucide icons (e.g., `FileText` for documents, `Scale` for cases, `Users` for clients) as lightweight illustrations. Full SVG illustrations are optional but enhance UX.

### Project Structure Notes

**New files to create:**
- `src/components/layout/mobile-sidebar.tsx`
- `src/components/ui/skeletons/dashboard-skeleton.tsx`
- `src/components/ui/skeletons/data-table-skeleton.tsx`
- `src/components/ui/skeletons/detail-page-skeleton.tsx`
- `src/components/ui/skeletons/form-skeleton.tsx`
- `src/components/ui/skeletons/chart-skeleton.tsx`
- `src/components/ui/empty-state.tsx`
- `src/components/ui/submit-button.tsx`
- `src/app/(dashboard)/error.tsx`
- `src/app/(dashboard)/loading.tsx`
- `src/app/(portal)/error.tsx`
- `src/app/(portal)/loading.tsx`
- `src/app/(auth)/error.tsx`
- `src/app/not-found.tsx`
- Various `loading.tsx` files per route segment
- Various empty state integrations on list pages

**Files to modify:**
- Dashboard layout (responsive sidebar toggle)
- All DataTable components (responsive column visibility)
- All form components (responsive grid layout)
- Dashboard page (responsive card grid)
- Calendar components (mobile simplification)
- All server action call sites (toast integration)
- Root layout (ensure `<Toaster />` is present)
- All list page components (add empty state when data is empty)

### References

- [Source: a.md -- Law Firm Registry Implementation Plan]
- [Source: epics.md -- Epic 20: Data Management, Compliance & Polish, Story 20.4]
- Tailwind CSS responsive design: https://tailwindcss.com/docs/responsive-design
- shadcn/ui Skeleton component
- shadcn/ui Sheet component (for mobile sidebar)
- sonner toast library: https://sonner.emilkowal.dev/
- Next.js App Router error handling: https://nextjs.org/docs/app/building-your-application/routing/error-handling
- WCAG 2.1 touch target guidelines (2.5.5 Target Size)

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
