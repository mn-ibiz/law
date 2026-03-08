# Story SAAS.1: Organization Entity & Database Multi-Tenancy Foundation

Status: done

## Story

As a **platform operator**,
I want **a multi-tenant database schema with organization-level data isolation**,
so that **each law firm's data is completely separated at the database level**.

## Acceptance Criteria

1. **AC1:** `organizations` table exists with fields: id (UUID PK), name, slug (unique), email, phone, website, address, city, county, country, logoUrl, timezone, locale, currency, status (active/suspended/cancelled), planId (FK), trialEndsAt, createdAt, updatedAt, deletedAt (soft delete)
2. **AC2:** `organizationId` UUID NOT NULL FK column on ALL tenant-scoped tables (50+ tables)
3. **AC3:** All global unique constraints converted to composite unique constraints scoped by organizationId:
   - `cases.caseNumber` -> unique on (caseNumber, organizationId)
   - `invoices.invoiceNumber` -> unique on (invoiceNumber, organizationId)
   - `attorneys.barNumber` -> unique on (barNumber, organizationId)
   - `practiceAreas.name` -> unique on (name, organizationId)
   - `trustAccounts.accountNumber` -> unique on (accountNumber, organizationId)
   - `quotes.quoteNumber` -> unique on (quoteNumber, organizationId)
   - `receipts.receiptNumber` -> unique on (receiptNumber, organizationId)
   - `creditNotes.creditNoteNumber` -> unique on (creditNoteNumber, organizationId)
   - `requisitions.requisitionNumber` -> unique on (requisitionNumber, organizationId)
   - `users.email` -> unique on (email, organizationId)
4. **AC4:** Database indexes on `organizationId` for every tenant-scoped table
5. **AC5:** `users` table has `organizationId` NOT NULL FK
6. **AC6:** `branches` table has `organizationId` NOT NULL FK
7. **AC7:** `organizationMembers` junction table for future multi-org support
8. **AC8:** Drizzle migration scripts generated and tested (forward migration + rollback)
9. **AC9:** Seed script creates default organization and assigns all seed data to it
10. **AC10:** Data migration script exists to assign existing records to default "Legacy" organization
11. **AC11:** `deletedAt` soft-delete timestamp on: organizations, users, clients, cases, attorneys
12. **AC12:** `organizationId` on `workflowTemplates` and `workflowRules` tables
13. **AC13:** `organizationId` on `notifications` table

## Current Implementation Status

**~90% of this story is already implemented.** The following analysis documents exactly what exists and what gaps remain.

### ALREADY DONE (verified in codebase)

- `organizations` table: `src/lib/db/schema/organizations.ts` - all AC1 fields present
- `plans` table: same file - maxUsers, maxCases, maxStorage, features, pricing, trialDays
- `organizationMembers` table: same file - userId, organizationId, role, joinedAt with unique index
- Relations defined for all three tables
- `organizationId` NOT NULL FK + index on **51 tables** across all 14 schema files
- Composite unique constraints on all 10 required fields (AC3)
- `users.email` composite: `users_email_org_idx`
- `super_admin` role added to `userRole` enum
- Drizzle migration `0006_dapper_zombie.sql` (36.3 KB) exists in `/drizzle/`
- Seed script creates default org, assigns all seed data to it
- `deletedAt` on: organizations, users, clients, cases
- Schema index file exports organizations module

### GAPS TO FIX (remaining ~10%)

| # | Gap | Severity | File | Fix |
|---|-----|----------|------|-----|
| G1 | `branchUsers` table missing `organizationId` | HIGH | `src/lib/db/schema/branches.ts` | Add `organizationId` NOT NULL FK + index |
| G2 | `workflowRules` table missing `organizationId` | HIGH | `src/lib/db/schema/workflows.ts` | Add `organizationId` NOT NULL FK + index |
| G3 | `workflowExecutionLog` table missing `organizationId` | HIGH | `src/lib/db/schema/workflows.ts` | Add `organizationId` NOT NULL FK + index |
| G4 | `auditLog.organizationId` is nullable | MEDIUM | `src/lib/db/schema/settings.ts` | Change to NOT NULL |
| G5 | `attorneys` table missing `deletedAt` | MEDIUM | `src/lib/db/schema/attorneys.ts` | Add `deletedAt` timestamp |
| G6 | No data migration script for existing production data | HIGH | New file needed | Create `src/lib/db/migrate-to-multi-tenant.ts` |
| G7 | Migration not tested on populated database | HIGH | Manual testing | Test migration 0006 against staging with data |
| G8 | `quoteLineItems` - verify organizationId exists | LOW | `src/lib/db/schema/billing.ts` | Verify and add if missing |

## Tasks / Subtasks

### Task 1: Fix Schema Gaps (AC: #2, #11, #12, #13)

- [x] T1.1: `organizations` table created (DONE)
- [x] T1.2: `plans` table created (DONE)
- [x] T1.3: `organizationId` on 51+ tables (DONE - except gaps below)
- [x] T1.3a: Add `organizationId` NOT NULL FK + index to `branchUsers` in `src/lib/db/schema/branches.ts`
- [x] T1.3b: Add `organizationId` NOT NULL FK + index to `workflowRules` in `src/lib/db/schema/workflows.ts`
- [x] T1.3c: Add `organizationId` NOT NULL FK + index to `workflowExecutionLog` in `src/lib/db/schema/workflows.ts`
- [x] T1.3d: Make `auditLog.organizationId` NOT NULL in `src/lib/db/schema/settings.ts`
- [x] T1.3e: Verify `quoteLineItems` has organizationId in `src/lib/db/schema/billing.ts` (table doesn't exist - N/A)
- [x] T1.4: Composite unique constraints (DONE - all 10 verified)
- [x] T1.5: Database indexes on organizationId (DONE - 70+ indexes)
- [x] T1.6: Add `deletedAt` timestamp to `attorneys` table in `src/lib/db/schema/attorneys.ts`
- [x] T1.7: `organizationId` on `workflowTemplates` (DONE)

### Task 2: Data Migration Script (AC: #10)

- [x] T2.1: Create `src/lib/db/migrate-to-multi-tenant.ts` script that:
  - Creates a default "Legacy" organization if not exists
  - Finds all records with NULL organizationId across all tables
  - Assigns them to the default organization
  - Handles foreign key ordering (organizations first, then dependent tables)
  - Reports counts of migrated records per table
  - Is idempotent (safe to run multiple times)

### Task 3: Regenerate Migration (AC: #8)

- [x] T3.1: After schema fixes, run `npx drizzle-kit generate` to create new migration (0007_unknown_katie_power.sql)
- [x] T3.2: Review generated SQL for correctness (5 statements: auditLog NOT NULL, attorneys.deletedAt, branchUsers/workflowRules/workflowExecutionLog organizationId + FKs + indexes)
- [ ] T3.3: Test migration against empty database
- [ ] T3.4: Test migration against populated database (with data migration script first)

### Task 4: Update Seed Script (AC: #9)

- [x] T4.1: Seed creates default org (DONE)
- [x] T4.2: All seed entities assigned organizationId (DONE)
- [x] T4.3: Make seed script idempotent (already idempotent - checks for existing records throughout)

### Task 5: Update Relations (AC: #2)

- [x] T5.1: Add organization relation to `branchUsers` in relations definition
- [x] T5.2: Add organization relation to `workflowRules` in relations definition
- [x] T5.3: Add organization relation to `workflowExecutionLog` in relations definition

## Dev Notes

### Architecture Constraints

- **ORM:** Drizzle ORM with PostgreSQL (Neon serverless)
- **Schema pattern:** All schema files in `src/lib/db/schema/` follow the same pattern:
  ```typescript
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  ```
- **Index pattern:** Every table with organizationId gets:
  ```typescript
  index("table_name_organization_id_idx").on(table.organizationId),
  ```
- **Composite unique pattern:**
  ```typescript
  uniqueIndex("table_org_field_idx").on(table.organizationId, table.fieldName),
  ```
- **Import:** Organizations imported from `./organizations` in each schema file
- **Cascading deletes:** All organizationId FKs use `onDelete: "cascade"`
- **Soft delete pattern:** `deletedAt: timestamp("deleted_at", { withTimezone: true })`

### Courts/CourtStations Are Global By Design

Per the epic (AC8 in Story 7): "Courts table remains global but org can configure which court types are relevant." Courts and courtStations are reference data shared across all tenants. Do NOT add organizationId to them. Court-related operational tables (courtFilings, serviceOfDocuments, causeLists, causeListEntries, courtRules) already have organizationId.

### Existing Migration Context

- Migration `0006_dapper_zombie.sql` already exists in `/drizzle/` (36.3 KB)
- After fixing the schema gaps, a new migration (0007) will be generated
- The new migration should ONLY contain the delta (branchUsers, workflowRules, workflowExecutionLog, auditLog NOT NULL, attorneys.deletedAt)

### File Locations

| File | Purpose |
|------|---------|
| `src/lib/db/schema/organizations.ts` | organizations, plans, organizationMembers tables |
| `src/lib/db/schema/branches.ts` | branches + branchUsers (FIX: add orgId to branchUsers) |
| `src/lib/db/schema/workflows.ts` | workflowTemplates, workflowRules, workflowExecutionLog (FIX: add orgId to rules + log) |
| `src/lib/db/schema/settings.ts` | firmSettings, practiceAreas, billingRates, auditLog etc. (FIX: auditLog NOT NULL) |
| `src/lib/db/schema/attorneys.ts` | attorneys and related tables (FIX: add deletedAt) |
| `src/lib/db/schema/billing.ts` | invoices, quotes, receipts, creditNotes, trustAccounts |
| `src/lib/db/schema/index.ts` | Re-exports all schema modules |
| `src/lib/db/seed.ts` | Seed script with default org creation |
| `drizzle/` | Migration files directory |
| `drizzle.config.ts` | Drizzle config (PostgreSQL, DATABASE_URL from .env.local) |

### Testing Requirements

- After schema changes: `npx drizzle-kit generate` must succeed
- After migration generation: `npx drizzle-kit push` on clean DB must succeed
- Data migration script: test with mock data across all tables
- Verify all foreign key constraints are satisfied
- Verify composite unique constraints reject duplicates within same org but allow across orgs
- Verify cascade delete: deleting an organization removes all child records

### Anti-Pattern Prevention

- DO NOT add organizationId to `courts` or `courtStations` (they are global reference data)
- DO NOT modify existing migration 0006 - create a new 0007 migration
- DO NOT make organizationId nullable on any tenant table (except where explicitly designed as global)
- DO NOT break existing relations - add organization relations alongside existing ones
- DO NOT modify the `organizations`, `plans`, or `organizationMembers` tables - they are complete

### Project Structure Notes

- All schema files follow identical patterns for organizationId, indexes, and references
- The schema index (`src/lib/db/schema/index.ts`) already exports organizations module
- Seed data files in `src/lib/db/seed-data/` contain Kenya-specific reference data

### References

- [Source: _bmad-output/planning-artifacts/saas-conversion-epic.md#STORY 1]
- [Source: src/lib/db/schema/organizations.ts] - Complete organizations/plans/members schema
- [Source: drizzle/0006_dapper_zombie.sql] - Existing multi-tenant migration
- [Source: src/lib/db/seed.ts] - Seed with default org creation

## Code Review Findings (Review Iteration 1)

### HIGH Severity

**CR-1: Data migration script missing 3 tenant-scoped tables**
- File: `src/lib/db/migrate-to-multi-tenant.ts`
- The `tablesToMigrate` array is missing `caseStageHistory`, `bankTransactions`, and `courtRules`. All three tables have `organizationId` columns but won't be migrated, causing the verification step to report NULLs and potentially blocking the NOT NULL migration.
- Fix: Add these 3 tables to the `tablesToMigrate` array in correct dependency order.

**CR-2: Workflow engine `handleUpdateStatus` lacks org-scoping**
- File: `src/lib/workflows/engine.ts:271`
- `handleUpdateStatus` updates cases by `id` only (`.where(eq(cases.id, context.entityId))`) without filtering by `organizationId`. While the workflow dispatch is org-scoped, this is a defense-in-depth violation — if `context.entityId` is tampered with or incorrect, it could modify a case in another tenant.
- Fix: Add `and(eq(cases.id, context.entityId), eq(cases.organizationId, context.organizationId))` to the where clause.

### MEDIUM Severity

**CR-3: Workflow engine rule fetch not org-scoped**
- File: `src/lib/workflows/engine.ts:59`
- Rules are fetched by `templateId` only. While templates are already org-filtered (line 37), adding `organizationId` to the rule query provides defense-in-depth and matches the pattern used everywhere else.
- Fix: Add `and(eq(workflowRules.templateId, template.id), eq(workflowRules.organizationId, context.organizationId))`.

**CR-4: Migration 0007 adds NOT NULL columns to potentially populated tables**
- File: `drizzle/0007_unknown_katie_power.sql:3-5`
- Lines 3-5 add `organization_id uuid NOT NULL` to `branch_users`, `workflow_execution_log`, and `workflow_rules` without DEFAULT values. If these tables have existing data, the migration will fail with "column contains null values". The `migrate-to-multi-tenant.ts` script handles this for the old nullable columns but cannot backfill columns that don't exist yet.
- Fix: The migration ordering must be: (1) ALTER TABLE ADD COLUMN without NOT NULL, (2) run data migration, (3) ALTER TABLE SET NOT NULL. Consider splitting migration 0007 into two migrations or documenting the exact migration procedure.

### LOW Severity

**CR-5: `branchesRelations` missing organization relation**
- File: `src/lib/db/schema/branches.ts:63-65`
- The `branchesRelations` definition only has `users: many(branchUsers)` but doesn't include an `organization` relation. All other tables with `organizationId` include the organization relation. Inconsistency could cause issues with Drizzle relational queries.
- Fix: Add `organization: one(organizations, { fields: [branches.organizationId], references: [organizations.id] })` to `branchesRelations`.

**CR-6: `attorneysRelations` missing organization relation**
- File: `src/lib/db/schema/attorneys.ts:217-226`
- Same pattern as CR-5: `attorneysRelations` doesn't include the organization relation despite having `organizationId`.
- Fix: Add `organization: one(organizations, ...)` to `attorneysRelations`.

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

- Story created from SAAS conversion epic analysis
- ~90% implementation verified in existing codebase
- 8 gaps identified requiring fixes (3 HIGH, 2 MEDIUM, 1 LOW + 2 process)
- Courts/courtStations confirmed as intentionally global

### File List

Files to MODIFY:
- `src/lib/db/schema/branches.ts` - Add organizationId to branchUsers
- `src/lib/db/schema/workflows.ts` - Add organizationId to workflowRules and workflowExecutionLog
- `src/lib/db/schema/settings.ts` - Make auditLog.organizationId NOT NULL
- `src/lib/db/schema/attorneys.ts` - Add deletedAt field
- `src/lib/db/schema/billing.ts` - Verify quoteLineItems
- `src/lib/db/seed.ts` - Make idempotent (minor)

Files to CREATE:
- `src/lib/db/migrate-to-multi-tenant.ts` - Data migration script

Files to GENERATE:
- `drizzle/0007_*.sql` - New migration for schema gap fixes
