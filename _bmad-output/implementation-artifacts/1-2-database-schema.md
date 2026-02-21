# Story 1.2: Database Schema — All 40+ Tables

Status: done

## Story

As a developer,
I want the complete database schema in Drizzle ORM across all 15 domains,
so that the entire data model exists from day one.

## Acceptance Criteria (ACs)

1. All tables defined per the database specification across 15 domains:
   - **Auth:** `users`
   - **Attorneys:** `attorneys`, `attorney_practice_areas`, `attorney_licenses`, `practising_certificates`, `cpd_records`
   - **Clients:** `clients`, `client_contacts`, `conflict_checks`, `kyc_documents`, `client_risk_assessments`
   - **Cases:** `cases`, `case_assignments`, `case_notes`, `case_timeline`, `case_parties`, `pipeline_stages`
   - **Documents:** `documents`, `document_versions`, `document_templates`
   - **Calendar:** `calendar_events`, `event_attendees`, `deadlines`, `tasks`, `bring_ups`
   - **Time/Expense:** `time_entries`, `expenses`, `requisitions`
   - **Billing:** `invoices`, `invoice_line_items`, `payments`, `trust_accounts`, `trust_transactions`, `quotes`, `receipts`, `credit_notes`
   - **Financial:** `petty_cash_transactions`, `bank_accounts`, `bank_transactions`, `bank_reconciliations`
   - **Courts:** `courts`, `court_stations`, `court_filings`, `service_of_documents`
   - **Suppliers:** `suppliers`, `supplier_invoices`
   - **Messaging:** `messages`, `notifications`, `sms_log`
   - **Branches:** `branches`, `branch_users`
   - **Workflows:** `workflow_templates`, `workflow_rules`, `workflow_execution_log`
   - **Settings:** `firm_settings`, `practice_areas`, `billing_rates`, `email_templates`, `sms_templates`, `audit_log`, `custom_fields`, `tags`
2. All pgEnums defined for status fields, roles, priorities, types, categories, and billing types
3. All foreign keys defined with appropriate `onDelete` behavior (cascade, set null, restrict as appropriate)
4. Indexes created on frequently queried fields: status columns, email fields, number/reference fields, date fields
5. Migration generated and runs successfully on Neon PostgreSQL 17

## Tasks / Subtasks

- [x] Create `src/lib/db/schema/enums.ts` — Define all pgEnums (AC2)
- [x] Create `src/lib/db/schema/auth.ts` — Define `users` table (AC1)
- [x] Create `src/lib/db/schema/attorneys.ts` — Define attorney domain tables (AC1)
- [x] Create `src/lib/db/schema/clients.ts` — Define client domain tables (AC1)
- [x] Create `src/lib/db/schema/cases.ts` — Define case domain tables (AC1)
- [x] Create `src/lib/db/schema/documents.ts` — Define document domain tables (AC1)
- [x] Create `src/lib/db/schema/calendar.ts` — Define calendar/events/tasks/bring-ups tables (AC1)
- [x] Create `src/lib/db/schema/time-expenses.ts` — Define time and expense tables (AC1)
- [x] Create `src/lib/db/schema/billing.ts` — Define billing/invoice/payment/trust tables (AC1)
- [x] Create `src/lib/db/schema/financial.ts` — Define petty cash and bank tables (AC1)
- [x] Create `src/lib/db/schema/courts.ts` — Define court and filing tables (AC1)
- [x] Create `src/lib/db/schema/suppliers.ts` — Define supplier tables (AC1)
- [x] Create `src/lib/db/schema/messaging.ts` — Define messages and notifications tables (AC1)
- [x] Create `src/lib/db/schema/branches.ts` — Define branch management tables (AC1)
- [x] Create `src/lib/db/schema/workflows.ts` — Define workflow automation tables (AC1)
- [x] Create `src/lib/db/schema/settings.ts` — Define settings and configuration tables (AC1)
- [x] Create `src/lib/db/schema/index.ts` — Re-export all schema tables and enums (AC1)
- [x] Add all foreign key references with appropriate `onDelete` behavior (AC3)
- [x] Add indexes on frequently queried fields (AC4)
- [x] Generate Drizzle migration with `npx drizzle-kit generate` (AC5)
- [x] Run migration against Neon with `npx drizzle-kit push` and verify all tables created (AC5)
- [x] Verify migration runs cleanly with no errors on Neon PostgreSQL 17 (AC5)

## Dev Notes

### Architecture & Constraints
- Use Drizzle ORM's `pgTable`, `pgEnum` APIs for all definitions
- Schema files are organized by domain in `src/lib/db/schema/` — one file per domain
- All tables use `uuid` primary keys generated with `gen_random_uuid()`
- Use `timestamp` with timezone for all date/time fields
- Use `text` for most string fields
- Use `decimal`/`numeric` for all monetary values
- Encrypted fields stored as text; encryption handled at application layer

## Dev Agent Record

### Implementation Notes
- Created 16 schema files across 15 domains + barrel export
- Defined 30+ pgEnums for all status/type/category fields
- 62 tables created on Neon PostgreSQL (exceeds the 40+ target)
- All foreign keys use appropriate onDelete: cascade for child records, set null for optional refs, restrict for critical refs
- Indexes on: users.email, users.role, attorneys.barNumber, attorneys.lskNumber, clients.email, clients.kraPin, cases.caseNumber, cases.status, invoices.invoiceNumber, invoices.status, documents.status, time_entries.date, bring_ups.date, bring_ups.status, audit_log.createdAt, audit_log.userId, and more
- Drizzle relations defined in each schema file for type-safe joins
- Migration generated and pushed to Neon project: long-river-86020922

## File List

- src/lib/db/schema/enums.ts (new)
- src/lib/db/schema/auth.ts (new)
- src/lib/db/schema/attorneys.ts (new)
- src/lib/db/schema/clients.ts (new)
- src/lib/db/schema/cases.ts (new)
- src/lib/db/schema/documents.ts (new)
- src/lib/db/schema/calendar.ts (new)
- src/lib/db/schema/time-expenses.ts (new)
- src/lib/db/schema/billing.ts (new)
- src/lib/db/schema/financial.ts (new)
- src/lib/db/schema/courts.ts (new)
- src/lib/db/schema/suppliers.ts (new)
- src/lib/db/schema/messaging.ts (new)
- src/lib/db/schema/branches.ts (new)
- src/lib/db/schema/workflows.ts (new)
- src/lib/db/schema/settings.ts (new)
- src/lib/db/schema/index.ts (new)
- drizzle.config.ts (modified)
- drizzle/0000_wakeful_mimic.sql (new — migration file)

## Change Log

- 2026-02-22: Implemented complete database schema with 62 tables across 15 domains, 30+ enums, all foreign keys and indexes. Migration pushed to Neon PostgreSQL successfully.
