# Story 18.2: User Management

Status: ready-for-dev

## Story

As an Admin,
I want to manage user accounts including creation, role assignment, and deactivation,
so that staff access is properly controlled and auditable.

## Acceptance Criteria (ACs)

1. **User List Page:** A user management page at `/(dashboard)/settings/users` showing all users in a DataTable with columns: name, email, role badge (Admin/Attorney/Client with distinct colors), status (Active/Inactive badge), and last login timestamp.
2. **Search and Filter:** User list supports search by name/email and filtering by role and status.
3. **Create User:** Form to create a new user with fields: full name (required), email (required, unique, validated), temporary password (required, min 8 chars with complexity), role (required, select: Admin/Attorney/Client), phone number (optional, +254 format), branch assignment (required, dropdown from branches).
4. **Edit User:** Edit form accessible from user detail/list allowing changes to: name, email, phone, branch. Role change capability (with confirmation dialog). Password reset to a new temporary password (with confirmation).
5. **Role Change Restrictions:** Admin cannot change their own role. Confirmation dialog on role change explaining implications.
6. **Activate/Deactivate:** Toggle user status between Active and Inactive. Deactivation is a soft delete (sets status to inactive, preserves all data and audit trail). Inactive users cannot log in. Admin cannot deactivate themselves.
7. **Audit Trail Preservation:** Deactivated users' historical data (time entries, case assignments, audit log entries, created documents) remain intact and attributed to the deactivated user.
8. **Password Reset:** Admin can trigger a password reset for any user, setting a new temporary password. User should be required to change password on next login (flag in user record).
9. **Admin-Only Access:** The user management page is restricted to Admin role only via middleware and server-side checks.
10. **Audit Logging:** All user management actions (create, edit, role change, activate, deactivate, password reset) are recorded in the audit log.

## Tasks / Subtasks

- [ ] **Task 1: Create user management page** (AC 1, 2, 9)
  - Create `src/app/(dashboard)/settings/users/page.tsx` as a Server Component
  - Implement DataTable with columns: name, email, role (colored badge), status (green Active / gray Inactive badge), last_login (formatted date)
  - Add search input (name/email), role filter dropdown, status filter dropdown
  - Pagination with configurable page size
  - Ensure route is Admin-only in middleware

- [ ] **Task 2: Create user form schema and validators** (AC 3, 4, 8)
  - Create `src/lib/validators/user.ts` with Zod schemas:
    - `createUserSchema`: name (required), email (required, email format, unique check), password (min 8, uppercase+lowercase+number), role (enum), phone (optional, +254 regex), branchId (required UUID)
    - `editUserSchema`: name, email, phone, branchId (all optional for partial update)
    - `changeRoleSchema`: userId, newRole, confirmationText
    - `resetPasswordSchema`: userId, newPassword (complexity rules)

- [ ] **Task 3: Implement user CRUD server actions** (AC 3, 4, 8, 10)
  - Create `src/lib/actions/users.ts` with:
    - `createUser(data)` - validates, hashes password with bcryptjs, inserts user, creates audit log entry
    - `updateUser(userId, data)` - validates, updates user fields, creates audit log with old/new diff
    - `resetPassword(userId, newPassword)` - hashes new password, sets `must_change_password` flag, creates audit log
  - All actions verify calling user is Admin via `auth()` session check

- [ ] **Task 4: Implement role change action** (AC 4, 5, 10)
  - Add `changeUserRole(userId, newRole)` to user actions
  - Server-side check: cannot change own role (compare session user ID to target userId)
  - Create audit log entry with old role and new role
  - If changing from Attorney to non-Attorney, handle any active case assignments (warn, don't auto-remove)

- [ ] **Task 5: Implement activate/deactivate action** (AC 6, 7, 10)
  - Add `toggleUserStatus(userId)` to user actions
  - Server-side check: cannot deactivate self
  - Soft delete: sets `status` to 'inactive' / 'active', does not delete any records
  - Inactive users blocked at NextAuth.js authorize callback (check status before returning user)
  - Create audit log entry

- [ ] **Task 6: Build create user dialog/modal** (AC 3)
  - Create `src/components/settings/create-user-dialog.tsx`
  - shadcn Dialog with react-hook-form, Zod validation
  - Fields: name, email, password (with show/hide toggle and generate random option), role select, phone (+254 prefix), branch select
  - Submit calls `createUser` server action
  - Success toast with "User created successfully"
  - Error handling for duplicate email

- [ ] **Task 7: Build edit user form** (AC 4, 5, 8)
  - Create `src/components/settings/edit-user-form.tsx`
  - Pre-populated form for editing user details
  - Role change section with confirmation AlertDialog: "Changing role from {old} to {new}. This will affect the user's access permissions. Are you sure?"
  - Password reset section with new password input and confirmation dialog
  - Cannot change own role warning/disabled state

- [ ] **Task 8: Build user status toggle** (AC 6)
  - Create `src/components/settings/user-status-toggle.tsx`
  - Switch or button to activate/deactivate with confirmation AlertDialog
  - "Deactivating this user will prevent them from logging in. All their data will be preserved."
  - Disabled for current user (cannot deactivate self)

- [ ] **Task 9: Update NextAuth.js to block inactive users** (AC 6)
  - Modify `src/lib/auth/auth.ts` (NextAuth config) to check user status in the `authorize` callback
  - If user status is 'inactive', return null with error message "Account deactivated. Contact administrator."
  - Also check in JWT callback to invalidate sessions of newly deactivated users

- [ ] **Task 10: Add user management queries** (AC 1, 2)
  - Create `src/lib/queries/users.ts` with:
    - `getUsers(filters)` - paginated user list with search, role filter, status filter
    - `getUserById(id)` - single user details for edit form
    - `checkEmailUnique(email, excludeUserId?)` - email uniqueness check

## Dev Notes

- **Password Handling:** Always use `bcryptjs` for hashing. Never store or log plaintext passwords. The "generate random password" feature should create a strong password (12+ chars, mixed case, numbers, symbols) that the admin can communicate to the user.
- **Must Change Password:** When an admin resets a user's password, set a `must_change_password` boolean flag on the user record. On next login, redirect to a change password page before allowing access. This is a security best practice.
- **Soft Delete Pattern:** Deactivation sets `status = 'inactive'` on the users table. Never `DELETE` user records. All foreign key references remain valid. This preserves audit trails, case histories, and time entries attributed to the user.
- **Self-Protection:** Two critical self-protection rules enforced server-side (not just UI):
  1. Admin cannot deactivate their own account
  2. Admin cannot change their own role
  These prevent accidental lockout.
- **Session Invalidation:** When a user is deactivated, their existing JWT tokens should be invalidated. Since JWTs are stateless, check user status in the JWT callback or add a `session_version` field that increments on deactivation, compared against the JWT.
- **Branch Assignment:** Every user must be assigned to a branch. This is used for branch-specific data filtering and reports.

### Project Structure Notes

**New files to create:**
- `src/app/(dashboard)/settings/users/page.tsx`
- `src/components/settings/create-user-dialog.tsx`
- `src/components/settings/edit-user-form.tsx`
- `src/components/settings/user-status-toggle.tsx`
- `src/lib/validators/user.ts`
- `src/lib/actions/users.ts`
- `src/lib/queries/users.ts`

**Files to modify:**
- `src/lib/auth/auth.ts` (add inactive user check in authorize callback)
- `src/app/(dashboard)/settings/layout.tsx` (add Users nav item)
- RBAC middleware (ensure `/settings/users` is Admin-only)

### References

- [Source: a.md -- Law Firm Registry Implementation Plan]
- [Source: epics.md -- Epic 18: Settings & Configuration, Story 18.2]
- [Source: epics.md -- Epic 2: Authentication & Authorization, Story 2.1] (NextAuth.js v5 config)
- bcryptjs documentation for password hashing
- NextAuth.js v5 authorize callback documentation

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
