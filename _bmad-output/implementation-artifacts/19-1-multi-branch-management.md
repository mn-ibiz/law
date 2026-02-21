# Story 19.1: Multi-Branch Office Management

Status: ready-for-dev

## Story

As an Admin,
I want to manage multiple office branches with user assignments, branch-specific settings, and cross-branch visibility,
so that the firm operates effectively across locations.

## Acceptance Criteria (ACs)

1. **Branch Management Page:** A page at `/(dashboard)/settings/branches` listing all branches in a DataTable with columns: name, address, phone, email, is_main (badge), user count, case count.
2. **Add/Edit Branch Form:** Form with fields: name (required), address, phone, email, is_main (boolean, only one branch can be main), contact person. Create and edit via dialog or dedicated page.
3. **Branch User Assignments:** Assign users to a primary branch. Each user belongs to one primary branch (set during user creation, editable). The `branch_users` table tracks user-branch relationships.
4. **Branch Case Assignment:** Cases are assigned to a branch (set during case creation, editable). Cases page and reports can be filtered by branch.
5. **Branch-Specific Settings:** Each branch can have its own: bank account(s), petty cash float amount, default county. These are stored as branch-level configurations.
6. **Branch-Aware Data Filtering:** Admin has a branch selector in the header that filters all data views (cases, clients, invoices, etc.) to the selected branch. "All Branches" option shows consolidated view. Attorney sees own branch by default. Partners have cross-branch visibility.
7. **Branch Selector in Header:** Dropdown in the main header (visible to Admin and Partners) allowing quick branch switching. Selected branch persists in session/cookie.
8. **Inter-Branch File Transfer Log:** Ability to log file transfers between branches. Form fields: case (required), from branch, to branch, reason/notes, date. Transfer log visible on case detail timeline.
9. **Consolidated Reports:** Firm-wide reports aggregate data from all branches. Branch filter on report pages shows branch-specific views.
10. **Audit Logging:** All branch management actions (create, edit, user assignment, file transfers) are recorded in the audit log.

## Tasks / Subtasks

- [ ] **Task 1: Create branch management page** (AC 1, 2, 10)
  - Create `src/app/(dashboard)/settings/branches/page.tsx` with DataTable
  - Columns: name, address, phone, email, is_main badge, user count (joined), case count (joined)
  - Add/Edit branch via shadcn Dialog with react-hook-form + Zod
  - Enforce only one `is_main` branch (if setting new main, unset previous)
  - Server actions with audit logging

- [ ] **Task 2: Create branch validators and server actions** (AC 2, 10)
  - Create `src/lib/validators/branch.ts` with Zod schema: name (required), address, phone, email, isMain (boolean)
  - Create `src/lib/actions/branches.ts` with:
    - `createBranch(data)` - insert, handle is_main uniqueness
    - `updateBranch(id, data)` - update, handle is_main logic
    - `deleteBranch(id)` - soft delete only if no assigned users/cases (or reassign first)
  - All actions call `createAuditLog()`

- [ ] **Task 3: Create branch queries** (AC 1)
  - Create `src/lib/queries/branches.ts` with:
    - `getBranches()` - all branches with user count and case count
    - `getBranchById(id)` - single branch details
    - `getBranchUsers(branchId)` - users assigned to a branch
    - `getBranchCases(branchId)` - cases assigned to a branch

- [ ] **Task 4: Implement branch user assignment** (AC 3, 10)
  - Add branch assignment to user creation form (Story 18.2)
  - Create `src/lib/actions/branch-users.ts` with:
    - `assignUserToBranch(userId, branchId)` - upsert into branch_users
    - `removeUserFromBranch(userId, branchId)` - remove from branch_users
  - Branch assignment editable from user edit form and branch detail page
  - Audit log on assignment changes

- [ ] **Task 5: Implement branch-specific settings** (AC 5)
  - Add branch-level settings storage (branch_id column in relevant config tables or a `branch_settings` key-value table similar to firm_settings)
  - Branch settings form sections: bank accounts (link existing bank accounts to branch), petty cash float (KES amount), default county (dropdown)
  - Create `src/components/settings/branch-settings-form.tsx`

- [ ] **Task 6: Build branch selector header component** (AC 6, 7)
  - Create `src/components/layout/branch-selector.tsx`
  - Dropdown showing all branches + "All Branches" option
  - Visible only to Admin and Partner roles
  - Selected branch stored in cookie (persistent across page loads) or in URL search params
  - Selection triggers data re-fetch for the current page

- [ ] **Task 7: Implement branch-aware data filtering** (AC 6)
  - Create `src/lib/utils/branch-filter.ts` with:
    - `getBranchFilter(session)` - returns the active branch filter based on user role and selected branch
    - Utility to inject branch WHERE clause into Drizzle queries
  - Update key query functions across the app to accept optional `branchId` parameter:
    - Cases list, clients list, invoices list, time entries, etc.
  - Attorney users auto-filter to their primary branch unless they have cross-branch permission

- [ ] **Task 8: Implement inter-branch file transfer log** (AC 8, 10)
  - Create `src/components/branches/file-transfer-form.tsx` - dialog form: case (required, searchable), from branch, to branch, reason, date
  - Create `src/lib/actions/branch-transfers.ts` with `logBranchTransfer(data)` action
  - Store in a `branch_transfers` table or use case timeline events
  - Display transfer entries on case detail timeline
  - Audit log on each transfer

- [ ] **Task 9: Ensure consolidated reports support** (AC 9)
  - Verify all report queries from Epic 17 accept optional branch filter
  - "All Branches" (default for Admin) shows aggregated data
  - Branch selector on report pages filters all charts/tables to selected branch
  - Branch column added to relevant report tables when viewing "All Branches"

- [ ] **Task 10: Add branches to settings navigation** (AC 1)
  - Update settings layout to include "Branches" link
  - Add branch count badge if useful

## Dev Notes

- **Branch Model:** The `branches` table has: `id, name, address, phone, email, is_main (boolean), is_active, created_at, updated_at`. The `branch_users` junction table links users to branches: `user_id, branch_id, is_primary`.
- **Single Main Branch:** Only one branch can be `is_main = true`. When creating or editing a branch with `is_main`, the action must unset `is_main` on the current main branch. Use a transaction to ensure atomicity.
- **Branch-Aware Queries Pattern:** The recommended pattern is to create a utility function that takes the current session and returns a Drizzle `where` clause for branch filtering. This is then applied across all list queries:
  ```typescript
  function getBranchWhere(session: Session) {
    if (session.user.role === 'admin' && session.activeBranch === 'all') return undefined;
    if (session.user.role === 'admin') return eq(cases.branchId, session.activeBranch);
    return eq(cases.branchId, session.user.branchId);
  }
  ```
- **Cookie-Based Branch Selection:** Store the admin's selected branch in an HTTP-only cookie (`active-branch`). Read it in Server Components via `cookies()`. This avoids passing branch context through every component.
- **Cross-Branch Visibility:** Partners (a title/role level on attorneys) should see data across branches, similar to Admin. The RBAC check for branch access should consider both role and attorney title.
- **Inter-Branch Transfer:** In Kenyan law firms, physical file transfers between branches are common. The transfer log provides accountability for file movement. Each transfer should also create a case timeline event for the case being transferred.
- **Performance:** Adding branch filter to all queries means all major tables should have an index on `branch_id`.

### Project Structure Notes

**New files to create:**
- `src/app/(dashboard)/settings/branches/page.tsx`
- `src/components/settings/branch-settings-form.tsx`
- `src/components/layout/branch-selector.tsx`
- `src/components/branches/file-transfer-form.tsx`
- `src/lib/validators/branch.ts`
- `src/lib/actions/branches.ts`
- `src/lib/actions/branch-users.ts`
- `src/lib/actions/branch-transfers.ts`
- `src/lib/queries/branches.ts`
- `src/lib/utils/branch-filter.ts`

**Files to modify:**
- `src/app/(dashboard)/settings/layout.tsx` (add Branches nav item)
- Header/shell layout component (add branch selector dropdown)
- Case creation form (add branch field)
- User creation form (add branch assignment, from Story 18.2)
- All list queries across the app (add optional branch filter)
- Report queries from Epic 17 (verify branch filter support)
- Case detail timeline (display branch transfer events)

### References

- [Source: a.md -- Law Firm Registry Implementation Plan]
- [Source: epics.md -- Epic 19: Multi-Branch & Customization, Story 19.1]
- [Source: epics.md -- Epic 18: Settings & Configuration] (settings context)
- [Source: epics.md -- Epic 2: Authentication & Authorization, Story 2.3] (header branch selector)
- [Source: epics.md -- Epic 12: Trust Accounts & Financial Operations, Story 12.2] (petty cash per branch)

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
