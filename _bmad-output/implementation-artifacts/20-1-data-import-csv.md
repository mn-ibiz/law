# Story 20.1: Data Import (CSV)

Status: ready-for-dev

## Story

As an Admin,
I want to import data from CSV files for clients, cases, and time entries,
so that existing records can be migrated into the system efficiently.

## Acceptance Criteria (ACs)

1. **Import Page:** A dedicated import page at `/(dashboard)/settings/import` accessible only to Admin users.
2. **CSV Upload:** File upload accepting CSV files with a 10MB file size limit. Drag-and-drop and file picker support.
3. **Entity Type Selection:** Admin selects the import type before uploading: Clients, Cases, or Time Entries. Each type has a predefined expected column structure.
4. **Column Mapping UI:** After upload, display the first 5 rows of the CSV and provide a column mapping interface where the admin maps CSV column headers to system fields. Auto-detect mappings for exact header matches.
5. **Data Preview and Validation:** Before confirming import, display a preview table showing mapped data with validation results. Show errors per row (e.g., missing required fields, invalid email format, invalid date). Valid rows shown in green, error rows in red with specific error messages.
6. **Duplicate Detection:** During preview, flag potential duplicates by matching on name/email (for clients), case number (for cases), or case+date+attorney (for time entries). Show duplicate flag with option to skip or overwrite.
7. **Import Execution:** On confirmation, import valid rows into the database. Show a progress indicator during import. Skip or flag error rows as configured.
8. **Import Log:** After import, display a summary: total rows processed, successfully imported count, skipped count, error count. Detailed error log downloadable as CSV.
9. **Rollback Option:** Each import batch is tagged with a batch ID. Admin can view recent import batches and trigger a rollback that deletes all records from a specific import batch.
10. **File Size Limit:** CSV files exceeding 10MB are rejected with a clear error message before upload.
11. **Audit Logging:** Import actions (upload, execute, rollback) are recorded in the audit log with batch ID and row counts.

## Tasks / Subtasks

- [ ] **Task 1: Create import page and layout** (AC 1, 3)
  - Create `src/app/(dashboard)/settings/import/page.tsx` with entity type selector (tabs or radio: Clients, Cases, Time Entries)
  - Admin-only route protection
  - Add "Import" link to settings navigation

- [ ] **Task 2: Build CSV upload component** (AC 2, 10)
  - Create `src/components/import/csv-upload.tsx`
  - Drag-and-drop zone using shadcn or custom dropzone
  - File picker fallback
  - Validate: file type (.csv), file size (max 10MB)
  - Parse CSV on client side using `papaparse` library (or similar)
  - Return parsed headers and rows to parent

- [ ] **Task 3: Build column mapping UI** (AC 4)
  - Create `src/components/import/column-mapper.tsx`
  - Display CSV headers alongside system field dropdowns
  - System fields per entity type:
    - **Clients:** name (required), email (required), phone, type (Individual/Organization), national_id, kra_pin, county, address, status
    - **Cases:** title (required), case_number, client_name/email (for lookup), practice_area, status, billing_type, priority, court, description
    - **Time Entries:** case_number (required, for lookup), attorney_email (required, for lookup), date (required), duration_hours (required), description (required), billable (boolean)
  - Auto-match CSV headers to system fields by exact or fuzzy name match
  - Unmapped columns shown as "Ignore"

- [ ] **Task 4: Build data preview and validation** (AC 5, 6)
  - Create `src/components/import/import-preview.tsx`
  - Display mapped data in a DataTable (max 100 rows in preview, note if more exist)
  - Validate each row against Zod schema per entity type:
    - Required fields present
    - Email format valid
    - Date format valid (try multiple formats: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
    - Phone format (+254 preferred, flexible)
    - Enum values valid (status, billing_type, etc.)
  - Row status indicators: green check (valid), red X (error with message), yellow warning (duplicate detected)
  - Error summary: total valid, total errors, total duplicates
  - Duplicate detection queries for existing records

- [ ] **Task 5: Implement duplicate detection** (AC 6)
  - Create `src/lib/utils/import-duplicate-check.ts` with:
    - `checkClientDuplicates(rows)` - match by email or by name (ILIKE)
    - `checkCaseDuplicates(rows)` - match by case_number
    - `checkTimeEntryDuplicates(rows)` - match by case + attorney + date + duration
  - Return duplicate flags with matched existing record IDs
  - UI allows per-row "skip" or "overwrite" toggle for duplicates

- [ ] **Task 6: Implement import execution server actions** (AC 7, 8, 9, 11)
  - Create `src/lib/actions/import.ts` with:
    - `executeImport(entityType, rows, batchId)` - inserts valid rows, each tagged with `import_batch_id`
    - Generate UUID `batchId` for the import batch
    - Use database transaction for atomicity
    - For client imports: create client records, handle Individual/Organization
    - For case imports: lookup client by name/email, create case with auto-generated number
    - For time entry imports: lookup case by number, lookup attorney by email
    - Return: `{ imported: number, skipped: number, errors: { row: number, message: string }[] }`
    - `createAuditLog()` with action 'create', entityType 'import', batchId in metadata

- [ ] **Task 7: Build import results summary** (AC 8)
  - Create `src/components/import/import-results.tsx`
  - Display summary cards: total processed, imported (green), skipped (yellow), errors (red)
  - Error detail table with row number and error message
  - "Download Error Log" button (CSV of errors)
  - "Import More" button to restart

- [ ] **Task 8: Implement rollback functionality** (AC 9, 11)
  - Create `src/lib/actions/import-rollback.ts` with:
    - `getImportBatches()` - list recent import batches with: batchId, entityType, timestamp, row count, user
    - `rollbackImport(batchId)` - delete all records with matching `import_batch_id`
  - Add `import_batch_id` nullable column to clients, cases, time_entries tables (or use a separate import_records junction table)
  - Rollback creates audit log entry
  - UI: "Import History" section on import page with rollback button per batch (with confirmation dialog)

- [ ] **Task 9: Create import field schemas per entity type** (AC 5)
  - Create `src/lib/validators/import.ts` with Zod schemas:
    - `clientImportRowSchema` - validates a single client import row
    - `caseImportRowSchema` - validates a single case import row
    - `timeEntryImportRowSchema` - validates a single time entry import row
  - Flexible date parsing (multiple formats)
  - Optional fields have sensible defaults

- [ ] **Task 10: Add import sample CSV templates** (AC 3)
  - Create downloadable sample CSV templates for each entity type
  - Templates show expected column headers with 2-3 sample rows
  - "Download Template" button on import page per entity type
  - Store templates as static files in `/public/templates/` or generate on demand

## Dev Notes

- **CSV Parsing:** Use `papaparse` (client-side) for parsing CSV files. It handles edge cases like quoted fields, commas in values, and various line endings. Parse on the client to enable preview without server roundtrip.
- **Import Batch Tracking:** Every imported record should have an `import_batch_id` column (nullable UUID) that links it to the import batch. This enables rollback by batch. Consider using a separate `import_batches` table: `id, entity_type, filename, row_count, imported_count, error_count, user_id, created_at, status (completed/rolled_back)`.
- **Rollback Considerations:** Rollback deletes records that were imported. If those records have been modified or linked to other records (e.g., a client now has cases), rollback should warn about dependencies and either cascade or refuse.
- **Date Parsing:** Kenya commonly uses DD/MM/YYYY format. The import should try multiple date formats and normalize to ISO. Use `date-fns` `parse()` with format guessing.
- **Lookup Resolution:** For case imports, clients are matched by name or email. For time entry imports, cases are matched by case number and attorneys by email. Unresolvable lookups should be flagged as errors.
- **Performance:** For large imports (1000+ rows), consider batch inserts using Drizzle's `insert().values([...])` with chunking (100 rows per insert). Show progress to the user.
- **Security:** The 10MB file limit prevents abuse. All imported data goes through Zod validation before insertion. Sanitize text fields to prevent XSS.

### Project Structure Notes

**New files to create:**
- `src/app/(dashboard)/settings/import/page.tsx`
- `src/components/import/csv-upload.tsx`
- `src/components/import/column-mapper.tsx`
- `src/components/import/import-preview.tsx`
- `src/components/import/import-results.tsx`
- `src/lib/actions/import.ts`
- `src/lib/actions/import-rollback.ts`
- `src/lib/validators/import.ts`
- `src/lib/utils/import-duplicate-check.ts`
- `/public/templates/clients-import-template.csv`
- `/public/templates/cases-import-template.csv`
- `/public/templates/time-entries-import-template.csv`

**Files to modify:**
- `src/app/(dashboard)/settings/layout.tsx` (add Import nav item)
- Database schema: add `import_batch_id` column to clients, cases, time_entries tables (or create import_batches + import_records tables)

**Dependencies to install:**
- `papaparse` (CSV parsing library)
- `@types/papaparse` (TypeScript types)

### References

- [Source: a.md -- Law Firm Registry Implementation Plan]
- [Source: epics.md -- Epic 20: Data Management, Compliance & Polish, Story 20.1]
- papaparse documentation: https://www.papaparse.com/
- Drizzle ORM batch insert documentation

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
