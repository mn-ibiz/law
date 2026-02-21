# Story 20.2: Data Export & Backup

Status: ready-for-dev

## Story

As an Admin,
I want to export data as CSV and maintain database backups,
so that data is portable, auditable, and protected against loss.

## Acceptance Criteria (ACs)

1. **Export Buttons on List Pages:** CSV export buttons are available on the following list pages: Clients, Cases, Time Entries, Invoices/Fee Notes, Trust Transactions. Each exports the currently filtered and displayed data.
2. **Clients CSV Export:** Exports client data with columns: name, email, phone, type, national_id (masked), kra_pin, county, address, status, created_at.
3. **Cases CSV Export:** Exports case data with columns: case_number, title, client_name, status, practice_area, lead_attorney, billing_type, priority, court, created_at, closed_at.
4. **Time Entries CSV Export:** Exports time entries with date range filter. Columns: date, case_number, case_title, attorney_name, duration_hours, description, billable, hourly_rate, total_amount.
5. **Invoices CSV Export:** Exports invoice/fee note data with columns: invoice_number, client_name, case_number, date, due_date, subtotal, vat, total, amount_paid, balance, status.
6. **Trust Transactions CSV Export:** Exports trust account transactions with columns: date, account_name, client_name, case_number, type, amount, running_balance, description, reference.
7. **Filter-Respecting Exports:** All exports respect the current filters applied on the list page (date range, status, attorney, client, etc.). The exported filename includes the date and any active filter summary.
8. **Database Backup Guide:** A comprehensive backup guide is documented in the project README covering:
   - Neon PostgreSQL connection details and pg_dump commands
   - Automated backup schedule recommendations
   - Backup verification steps (restore to test database)
   - Point-in-time recovery capabilities of Neon
9. **Audit Logging:** Every export action is recorded in the audit log with: entity type exported, filter parameters, row count, user.

## Tasks / Subtasks

- [ ] **Task 1: Create shared export infrastructure** (AC 1, 7, 9)
  - Extend `src/lib/utils/csv-export.ts` (from Story 17.1) with:
    - `exportEntityCSV(entityType, data, columns, filters)` - generates and triggers CSV download
    - Filename format: `{entityType}-export-{YYYY-MM-DD}-{filterSummary}.csv`
    - UTF-8 BOM for Excel compatibility
    - KES formatting for monetary columns
    - Date formatting per firm settings (DD/MM/YYYY default)
  - Create `src/lib/actions/export.ts` with:
    - `logExport(entityType, filterParams, rowCount)` - creates audit log entry for the export

- [ ] **Task 2: Implement client export** (AC 2, 7, 9)
  - Create `src/lib/queries/export/clients.ts` with `getClientsForExport(filters)` query
  - Mask sensitive fields: national_id shows only last 4 digits (e.g., ****5678), kra_pin partially masked
  - Add "Export CSV" button to clients list page
  - Button reads current filters, calls query, generates CSV, logs export

- [ ] **Task 3: Implement case export** (AC 3, 7, 9)
  - Create `src/lib/queries/export/cases.ts` with `getCasesForExport(filters)` query
  - Join with clients, attorneys, practice areas, courts for display names
  - Add "Export CSV" button to cases list page

- [ ] **Task 4: Implement time entries export** (AC 4, 7, 9)
  - Create `src/lib/queries/export/time-entries.ts` with `getTimeEntriesForExport(filters)` query
  - Must support date range filter (required for time entries export)
  - Calculate total_amount = duration_hours * hourly_rate
  - Join with cases and attorneys for display names
  - Add "Export CSV" button to time entries list page

- [ ] **Task 5: Implement invoice export** (AC 5, 7, 9)
  - Create `src/lib/queries/export/invoices.ts` with `getInvoicesForExport(filters)` query
  - Include calculated fields: balance = total - amount_paid
  - Join with clients and cases for display names
  - Add "Export CSV" button to invoices/fee notes list page

- [ ] **Task 6: Implement trust transactions export** (AC 6, 7, 9)
  - Create `src/lib/queries/export/trust-transactions.ts` with `getTrustTransactionsForExport(filters)` query
  - Include running balance computation
  - Join with trust accounts, clients, cases
  - Add "Export CSV" button to trust transactions ledger page

- [ ] **Task 7: Create export button component** (AC 1)
  - Create `src/components/export/export-csv-button.tsx` - reusable button component
  - Props: entityType, fetchFn, columns, currentFilters
  - Shows loading spinner during export generation
  - Handles errors with toast notification
  - Creates audit log entry on successful export

- [ ] **Task 8: Document database backup procedures** (AC 8)
  - Add to project README a "Database Backup" section covering:
    - **Neon Connection:** How to obtain connection string from Neon dashboard
    - **pg_dump Commands:**
      ```
      pg_dump "postgresql://user:pass@host/dbname?sslmode=require" > backup_YYYY-MM-DD.sql
      pg_dump -Fc "connection_string" > backup_YYYY-MM-DD.dump (custom format, compressed)
      ```
    - **Automated Backups:** Cron job or GitHub Action example for daily backups
    - **Neon Built-in:** Neon provides automatic point-in-time recovery and branching (mention these capabilities)
    - **Restore Steps:** `pg_restore -d target_db backup.dump` or `psql target_db < backup.sql`
    - **Verification:** Restore to a test Neon branch and verify row counts
    - **Windows Server Production:** pg_dump instructions for local PostgreSQL on Windows

- [ ] **Task 9: Add export page/section to settings** (AC 1)
  - Optionally create `src/app/(dashboard)/settings/export/page.tsx` as a centralized export page with links to each entity's export (or rely on per-page export buttons)
  - Add "Export" link to settings navigation

## Dev Notes

- **Client-Side vs Server-Side CSV Generation:** For small-to-medium datasets (< 10,000 rows), generate CSV on the client side from data already fetched by Server Components. For large datasets, consider a server-side API route that streams the CSV response with `Content-Disposition: attachment` header.
- **Sensitive Data Masking:** National ID and KRA PIN are sensitive. Mask them in exports: national_id shows `****{last4}`, KRA PIN shows `A***{last3}*`. This protects PII while still allowing identification. Full unmasked export could be a separate permission.
- **Export Filename:** Include the export date and a summary of active filters for traceability. Example: `clients-export-2026-02-22-status-active.csv`.
- **KES Formatting in CSV:** For CSV, export monetary values as plain numbers (no KES prefix, no commas) to ensure they're recognized as numeric in Excel. Add a note in the header or a separate column for currency.
- **Audit Log:** Each export creates an audit entry. The metadata should include which filters were applied and how many rows were exported. This enables tracking of who exported what data and when, important for Data Protection Act compliance (Story 20.3).
- **Neon Backup:** Neon PostgreSQL provides automatic daily backups and point-in-time recovery. The documentation should mention this as the primary backup mechanism, with pg_dump as a supplementary manual backup option.
- **Production (Windows Server):** For the production Windows Server deployment with local PostgreSQL, backup procedures differ: use Windows Task Scheduler with pg_dump, backup to local storage or network share.

### Project Structure Notes

**New files to create:**
- `src/components/export/export-csv-button.tsx`
- `src/lib/queries/export/clients.ts`
- `src/lib/queries/export/cases.ts`
- `src/lib/queries/export/time-entries.ts`
- `src/lib/queries/export/invoices.ts`
- `src/lib/queries/export/trust-transactions.ts`
- `src/lib/actions/export.ts`
- Optionally: `src/app/(dashboard)/settings/export/page.tsx`

**Files to modify:**
- `src/lib/utils/csv-export.ts` (extend with entity export utilities)
- Clients list page (add export button)
- Cases list page (add export button)
- Time entries list page (add export button)
- Invoices list page (add export button)
- Trust transactions ledger page (add export button)
- `src/app/(dashboard)/settings/layout.tsx` (add Export nav item)
- Project README.md (add backup documentation section)

### References

- [Source: a.md -- Law Firm Registry Implementation Plan]
- [Source: epics.md -- Epic 20: Data Management, Compliance & Polish, Story 20.2]
- [Source: epics.md -- Epic 17: Reports & Analytics] (CSV export utility shared)
- Neon PostgreSQL backup documentation
- pg_dump PostgreSQL documentation

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
