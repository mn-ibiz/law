# Story 1.2: Database Schema — All 40+ Tables

Status: ready-for-dev

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

- [ ] Create `src/lib/db/schema/enums.ts` — Define all pgEnums: userRole, attorneyTitle, licenseStatus, clientType, clientStatus, kycStatus, riskLevel, caseStatus, casePriority, billingType, documentCategory, documentStatus, eventType, taskStatus, deadlinePriority, bringUpStatus, expenseCategory, invoiceStatus, paymentMethod, trustAccountType, trustTransactionType, pettyCashType, filingStatus, serviceMethod, requisitionStatus, messageStatus, notificationType, workflowTriggerType, workflowActionType, auditAction (AC2)
- [ ] Create `src/lib/db/schema/auth.ts` — Define `users` table with id, name, email, password, role, phone, avatar, branchId, isActive, emailVerified, createdAt, updatedAt (AC1)
- [ ] Create `src/lib/db/schema/attorneys.ts` — Define `attorneys`, `attorney_practice_areas`, `attorney_licenses`, `practising_certificates`, `cpd_records` tables with all fields per spec: barNumber, jurisdiction, title, department, hourlyRate, dateAdmitted, bio, lskNumber, commissionerForOaths, notaryPublic, seniorCounsel (AC1)
- [ ] Create `src/lib/db/schema/clients.ts` — Define `clients`, `client_contacts`, `conflict_checks`, `kyc_documents`, `client_risk_assessments` tables with Kenya-specific fields: nationalId (encrypted), passportNumber (encrypted), kraPin, county, poBox, physicalAddress, nextOfKin, employer (AC1)
- [ ] Create `src/lib/db/schema/cases.ts` — Define `cases`, `case_assignments`, `case_notes`, `case_timeline`, `case_parties`, `pipeline_stages` tables with status workflow support, caseNumber auto-format, statuteOfLimitations, estimatedValue (AC1)
- [ ] Create `src/lib/db/schema/documents.ts` — Define `documents`, `document_versions`, `document_templates` tables with file storage fields, versioning support, template placeholders (AC1)
- [ ] Create `src/lib/db/schema/calendar.ts` — Define `calendar_events`, `event_attendees`, `deadlines`, `tasks`, `bring_ups` tables with recurrence, reminder, and notification fields (AC1)
- [ ] Create `src/lib/db/schema/time-expenses.ts` — Define `time_entries`, `expenses`, `requisitions` tables with billable/non-billable, rate calculation, receipt upload, approval workflow fields (AC1)
- [ ] Create `src/lib/db/schema/billing.ts` — Define `invoices`, `invoice_line_items`, `payments`, `trust_accounts`, `trust_transactions`, `quotes`, `receipts`, `credit_notes` tables with Kenya VAT, M-Pesa, fee note numbering (AC1)
- [ ] Create `src/lib/db/schema/financial.ts` — Define `petty_cash_transactions`, `bank_accounts`, `bank_transactions`, `bank_reconciliations` tables (AC1)
- [ ] Create `src/lib/db/schema/courts.ts` — Define `courts`, `court_stations`, `court_filings`, `service_of_documents` tables with Kenya court hierarchy support (AC1)
- [ ] Create `src/lib/db/schema/suppliers.ts` — Define `suppliers`, `supplier_invoices` tables with KRA PIN, bank details (AC1)
- [ ] Create `src/lib/db/schema/messaging.ts` — Define `messages`, `notifications`, `sms_log` tables with threading, read status, delivery tracking (AC1)
- [ ] Create `src/lib/db/schema/branches.ts` — Define `branches`, `branch_users` tables with main branch flag, settings (AC1)
- [ ] Create `src/lib/db/schema/workflows.ts` — Define `workflow_templates`, `workflow_rules`, `workflow_execution_log` tables with trigger/action configuration (AC1)
- [ ] Create `src/lib/db/schema/settings.ts` — Define `firm_settings`, `practice_areas`, `billing_rates`, `email_templates`, `sms_templates`, `audit_log`, `custom_fields`, `tags` tables (AC1)
- [ ] Create `src/lib/db/schema/index.ts` — Re-export all schema tables and enums from a single entry point (AC1)
- [ ] Add all foreign key references with appropriate `onDelete` behavior: cascade for child records, set null for optional references, restrict for critical references (AC3)
- [ ] Add indexes on: users.email, users.role, attorneys.barNumber, attorneys.lskNumber, clients.email, clients.kraPin, cases.caseNumber, cases.status, invoices.invoiceNumber, invoices.status, documents.status, time_entries.date, bring_ups.date, bring_ups.status, audit_log.createdAt, audit_log.userId (AC4)
- [ ] Generate Drizzle migration with `npx drizzle-kit generate` (AC5)
- [ ] Run migration against Neon with `npx drizzle-kit push` or `npx drizzle-kit migrate` and verify all tables created (AC5)
- [ ] Verify migration runs cleanly with no errors on Neon PostgreSQL 17 (AC5)

## Dev Notes

### Architecture & Constraints
- Use Drizzle ORM's `pgTable`, `pgEnum` APIs for all definitions
- Schema files are organized by domain in `src/lib/db/schema/` — one file per domain
- All tables should use `uuid` primary keys generated with `gen_random_uuid()` or `serial`/`bigserial` depending on preference (uuid recommended for distributed systems)
- Use `timestamp` with timezone for all date/time fields
- Use `text` for most string fields (PostgreSQL has no performance difference vs varchar)
- Use `decimal`/`numeric` for all monetary values (never float)
- Encrypted fields (nationalId, passportNumber) should be stored as text; encryption handled at application layer
- The `firm_settings` table uses a key-value pattern: `key` (text, unique) + `value` (text/jsonb)
- `audit_log` must be append-only: no update or delete operations
- All timestamps default to `now()` for createdAt

### Drizzle-Specific Patterns
```typescript
// pgEnum example
export const userRole = pgEnum('user_role', ['admin', 'attorney', 'client']);

// Table example
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  role: userRole('role').notNull().default('client'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
}));
```

### Relations
- Define Drizzle relations in each schema file using `relations()` for type-safe joins
- One-to-many: users -> attorneys, clients -> cases, cases -> documents
- Many-to-many: attorneys <-> practice_areas (via junction table), events <-> attendees

### Project Structure Notes

Files to create:
- `src/lib/db/schema/enums.ts` — All pgEnum definitions
- `src/lib/db/schema/auth.ts` — users table
- `src/lib/db/schema/attorneys.ts` — Attorney domain tables
- `src/lib/db/schema/clients.ts` — Client domain tables
- `src/lib/db/schema/cases.ts` — Case domain tables
- `src/lib/db/schema/documents.ts` — Document domain tables
- `src/lib/db/schema/calendar.ts` — Calendar/events/tasks/bring-ups tables
- `src/lib/db/schema/time-expenses.ts` — Time and expense tables
- `src/lib/db/schema/billing.ts` — Billing/invoice/payment/trust tables
- `src/lib/db/schema/financial.ts` — Petty cash and bank tables
- `src/lib/db/schema/courts.ts` — Court and filing tables
- `src/lib/db/schema/suppliers.ts` — Supplier tables
- `src/lib/db/schema/messaging.ts` — Messages and notifications tables
- `src/lib/db/schema/branches.ts` — Branch management tables
- `src/lib/db/schema/workflows.ts` — Workflow automation tables
- `src/lib/db/schema/settings.ts` — Settings and configuration tables
- `src/lib/db/schema/index.ts` — Barrel export file

Files to modify:
- `drizzle.config.ts` — Point to schema directory

### References

- [Source: a.md — Database: 40+ Tables across 15 Domains]
- [Source: a.md — All Module Details for field specifications]
- [Source: epics.md — Epic 1, Story 1.2]
- [Source: a.md — Kenya Legal Requirements (Advocates Act, Cap. 16)]
