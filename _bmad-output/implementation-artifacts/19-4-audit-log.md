# Story 19.4: Audit Log

Status: ready-for-dev

## Story

As an Admin,
I want a comprehensive, append-only audit log of all system actions,
so that all user activity is traceable for security, compliance, and accountability.

## Acceptance Criteria (ACs)

1. **Audit Log Page:** A page at `/(dashboard)/settings/audit-log` accessible only to Admin users, displaying the audit log in a DataTable.
2. **Log Columns:** Each log entry shows: timestamp (precise to second), user (name and email), action type (Create, Update, Delete, Login, Export, Download), entity type (e.g., Case, Client, Invoice, User), entity ID (linkable to the entity), and a summary/details column.
3. **Detail View - JSON Diff:** Clicking an audit log entry opens a detail view showing old values vs new values as a JSON diff. For "Create" actions, show new values only. For "Delete" actions, show old values only. For "Update" actions, show a side-by-side or inline diff highlighting changed fields.
4. **Filters:** Audit log supports filtering by: date range (with presets), user (searchable dropdown), action type (multi-select), and entity type (multi-select).
5. **Search:** Full-text search across audit log details/descriptions.
6. **Pagination:** Paginated display with 50 entries per page, with total count and page navigation.
7. **Append-Only / Non-Deletable:** Audit log records cannot be deleted or edited by any user, including Admins. The UI has no delete or edit buttons. Server actions enforce immutability. Database-level constraints (no DELETE permission on audit_log table if feasible).
8. **CSV Export:** Admin can export audit log entries as CSV, filtered by date range. Export itself creates an audit log entry.
9. **IP Address Capture:** Each audit log entry records the IP address of the user performing the action, captured from request headers (`x-forwarded-for` or `x-real-ip`).
10. **createAuditLog() Utility:** A reusable utility function `createAuditLog()` is used in all server actions across the application to record audit entries consistently.

## Tasks / Subtasks

- [ ] **Task 1: Create/verify audit_log table schema** (AC 2, 7, 9)
  - Verify `src/lib/db/schema/audit-log.ts` defines the audit_log table with columns:
    - `id` (UUID, primary key)
    - `timestamp` (timestamptz, default now())
    - `user_id` (UUID, FK to users, nullable for system actions)
    - `user_email` (varchar, denormalized for readability even if user is deleted)
    - `user_name` (varchar, denormalized)
    - `action` (pgEnum: 'create', 'update', 'delete', 'login', 'logout', 'export', 'download')
    - `entity_type` (varchar, e.g., 'case', 'client', 'user', 'invoice')
    - `entity_id` (varchar, the ID of the affected entity)
    - `old_values` (JSONB, nullable, old state for updates/deletes)
    - `new_values` (JSONB, nullable, new state for creates/updates)
    - `description` (text, human-readable summary)
    - `ip_address` (varchar, nullable)
    - `metadata` (JSONB, nullable, additional context)
  - Ensure NO cascade delete on user FK (audit records must survive user deletion)
  - Add indexes on: `timestamp`, `user_id`, `entity_type`, `action`

- [ ] **Task 2: Implement createAuditLog() utility** (AC 9, 10)
  - Create `src/lib/utils/audit-log.ts` with:
    ```typescript
    async function createAuditLog(params: {
      action: AuditAction;
      entityType: string;
      entityId: string;
      oldValues?: Record<string, unknown>;
      newValues?: Record<string, unknown>;
      description?: string;
    }): Promise<void>
    ```
  - Automatically captures: current user from `auth()` session (user_id, email, name), IP address from `headers()` (`x-forwarded-for` or `x-real-ip`), timestamp (database default)
  - Insert is append-only (INSERT only, never UPDATE or DELETE)
  - Function is async but fire-and-forget (don't block the main action on audit logging)
  - Handle errors gracefully (log to console but don't throw)

- [ ] **Task 3: Implement IP address capture utility** (AC 9)
  - Create `src/lib/utils/get-ip-address.ts` with:
    - `getClientIP()` - reads from Next.js `headers()`: `x-forwarded-for` (first IP), `x-real-ip`, or fallback to 'unknown'
  - Used by `createAuditLog()` automatically

- [ ] **Task 4: Create audit log queries** (AC 1, 2, 4, 5, 6)
  - Create `src/lib/queries/audit-log.ts` with:
    - `getAuditLogs(filters)` - paginated, filtered list:
      - `page` and `pageSize` (default 50)
      - `dateFrom`, `dateTo` date range filter
      - `userId` filter
      - `action` filter (array of action types)
      - `entityType` filter (array of entity types)
      - `search` full-text search across description and JSONB values
    - `getAuditLogById(id)` - single entry with full old_values/new_values
    - `getAuditLogCount(filters)` - total count for pagination
    - `getAuditLogUsers()` - distinct users who have audit entries (for user filter dropdown)

- [ ] **Task 5: Build audit log page** (AC 1, 2, 4, 5, 6)
  - Create `src/app/(dashboard)/settings/audit-log/page.tsx` as Server Component
  - DataTable with columns: timestamp (formatted DD/MM/YYYY HH:mm:ss), user name, action badge (colored: Create=green, Update=blue, Delete=red, Login=gray, Export=purple), entity type, entity ID (truncated, linkable), description (truncated)
  - Filter bar: date range picker, user dropdown, action type multi-select, entity type multi-select, search input
  - Pagination: 50 per page, page numbers, total count display
  - Ensure Admin-only access

- [ ] **Task 6: Build audit log detail view** (AC 3)
  - Create `src/components/settings/audit-log-detail.tsx` - modal or slide-over panel
  - Shows full audit entry: timestamp, user, action, entity type, entity ID, IP address, description
  - JSON Diff view:
    - For Create: show `new_values` as formatted JSON (green highlighted)
    - For Delete: show `old_values` as formatted JSON (red highlighted)
    - For Update: side-by-side or inline diff showing `old_values` vs `new_values` with changed fields highlighted
  - Use a simple diff renderer (highlight changed keys/values) or a library like `json-diff`
  - Entity ID should be a link to the entity detail page (if entity still exists)

- [ ] **Task 7: Implement CSV export** (AC 8, 10)
  - Add "Export CSV" button to audit log page
  - Export respects current filters (especially date range)
  - CSV columns: timestamp, user_name, user_email, action, entity_type, entity_id, description, ip_address
  - On export, call `createAuditLog({ action: 'export', entityType: 'audit_log', description: 'Exported audit log CSV' })`

- [ ] **Task 8: Enforce append-only immutability** (AC 7)
  - Ensure NO server actions exist for updating or deleting audit log entries
  - Audit log page UI has no edit or delete buttons
  - If using Drizzle, do not export `update` or `delete` operations for the audit_log table
  - Consider adding a PostgreSQL trigger or policy to prevent DELETE/UPDATE on audit_log table:
    ```sql
    CREATE RULE audit_log_no_delete AS ON DELETE TO audit_log DO INSTEAD NOTHING;
    CREATE RULE audit_log_no_update AS ON UPDATE TO audit_log DO INSTEAD NOTHING;
    ```
  - Document this constraint clearly

- [ ] **Task 9: Integrate createAuditLog() across existing server actions** (AC 10)
  - Audit all existing server action files and ensure `createAuditLog()` is called:
    - User CRUD actions (Story 18.2)
    - Case CRUD actions (Epic 6)
    - Client CRUD actions (Epic 5)
    - Attorney CRUD actions (Epic 4)
    - Invoice/billing actions (Epic 11)
    - Document actions (Epic 9)
    - Settings changes (Story 18.1)
    - Login/logout events (Epic 2)
  - This may be a large task; prioritize critical entities first

- [ ] **Task 10: Add audit log to settings navigation** (AC 1)
  - Update settings layout to include "Audit Log" link
  - Ensure it's visually distinct (perhaps at the bottom of settings nav with a Shield icon)

## Dev Notes

- **Append-Only is Critical:** The audit log's value depends entirely on its immutability. No user, including the database administrator, should routinely delete audit records. The PostgreSQL rules (INSTEAD NOTHING) provide database-level protection. Application-level protection ensures no Drizzle query can delete/update audit records.
- **JSON Diff Display:** For the detail view, a simple approach is:
  1. Parse `old_values` and `new_values` as JSON objects
  2. Compare keys: identify added, removed, and changed fields
  3. Render a table: Field Name | Old Value | New Value, with changed rows highlighted
  - Libraries like `deep-diff` or `fast-json-patch` can help compute diffs programmatically
- **IP Address in Serverless:** On Vercel, `x-forwarded-for` typically contains the client IP. Behind a reverse proxy (production Windows Server), ensure the proxy sets `x-real-ip` or `x-forwarded-for`. Fall back to 'unknown' if neither is available.
- **Performance:** Audit logs grow indefinitely. Ensure:
  - Indexes on `timestamp`, `user_id`, `entity_type`, `action` for filter performance
  - Pagination is always enforced (never fetch all records)
  - Date range filter is encouraged/defaulted to prevent unbounded queries
  - Consider partitioning the audit_log table by month if the firm is large
- **Denormalized User Info:** Store `user_email` and `user_name` directly in the audit log (not just `user_id`). This ensures audit entries remain readable even if the user record is modified or deactivated.
- **Fire-and-Forget Pattern:** `createAuditLog()` should not block the main server action. Use `void createAuditLog(...)` or wrap in try-catch to prevent audit logging failures from breaking business operations. However, ensure the audit insert completes (don't use `fetch` without await in edge runtime).
- **Login/Logout Audit:** For login events, call `createAuditLog()` in the NextAuth.js `signIn` event callback. For logout, in the `signOut` callback. Action type: 'login' / 'logout'.

### Project Structure Notes

**New files to create:**
- `src/app/(dashboard)/settings/audit-log/page.tsx`
- `src/components/settings/audit-log-detail.tsx`
- `src/lib/utils/audit-log.ts` (createAuditLog utility)
- `src/lib/utils/get-ip-address.ts`
- `src/lib/queries/audit-log.ts`

**Files to modify:**
- `src/lib/db/schema/audit-log.ts` (verify or create audit_log table schema)
- `src/app/(dashboard)/settings/layout.tsx` (add Audit Log nav item)
- RBAC middleware (ensure `/settings/audit-log` is Admin-only)
- All existing server action files (integrate createAuditLog calls) -- this is a cross-cutting concern
- NextAuth.js config `src/lib/auth/auth.ts` (add login/logout audit events)
- Database migration (add PostgreSQL rules for immutability)

### References

- [Source: a.md -- Law Firm Registry Implementation Plan]
- [Source: epics.md -- Epic 19: Multi-Branch & Customization, Story 19.4]
- [Source: epics.md -- Epic 1: Project Foundation, Story 1.2] (audit_log table in schema)
- PostgreSQL CREATE RULE documentation for immutability enforcement
- Next.js `headers()` API for IP address extraction
- NextAuth.js v5 events (signIn, signOut) for login audit

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
