# EPIC: Convert Law Firm Registry to Multi-Tenant SaaS Platform

**Epic ID:** SAAS-001
**Priority:** Critical
**Status:** Draft (Revised after adversarial review)
**Created:** 2026-03-07
**Revised:** 2026-03-07
**Author:** BMAD Team (John - PM, Winston - Architect, Bob - SM, Mary - Analyst, Amelia - Dev, Quinn - QA)

---

## Executive Summary

Transform the existing single-tenant Law Firm Registry application into a fully multi-tenant SaaS platform capable of serving multiple law firms from a single deployment. The current system has zero multi-tenancy infrastructure across 466 TypeScript files, 60+ database tables, 25 server action files, 18+ query files, 85 pages, and 5 API routes. Every data access path assumes a single firm.

**Approach:** Shared database with row-level tenant isolation using an `organizationId` foreign key on all tenant-scoped tables, enforced through middleware, session context, and query-layer filtering.

---

## Architecture Decision Record

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Tenancy Model | Shared DB, row-level isolation | Best fit for Neon PostgreSQL; simpler ops than DB-per-tenant |
| Tenant Identifier | `organizationId` UUID on all tenant tables | Consistent, index-friendly, no collision risk |
| Tenant Resolution | Subdomain-based (`firmname.app.com`) | Clean URL separation, easy routing, industry standard |
| Tenant Context | JWT token + middleware injection | Server-side enforcement at every layer |
| Tenant Injection | Centralized `withTenant()` helper + enhanced `safeAction()` | Single enforcement point reduces risk of missed filters |
| Billing Provider | Stripe (with M-Pesa bridge for Kenya) | Global SaaS standard with webhook support |
| Feature Gating | Plan-based feature flags in DB | Per-tenant plan tiers control feature access |
| Rate Limiting | Per-tenant + per-user with Redis backend | Prevents cross-tenant abuse; supports multi-instance |
| Background Jobs | Inngest or BullMQ with tenant-scoped execution | Required for scheduled alerts, reminders, billing checks |
| File Storage | Cloud object storage (S3/R2) with tenant-prefixed keys | Local filesystem not viable for SaaS |

---

## Current State Analysis

### Database (23 schema files, 60+ tables)
- **0 of 60+ tables** have an organizationId/tenantId field
- All unique constraints are global (case numbers, invoice numbers, bar numbers, practice areas)
- Currency hardcoded to KES, VAT to 16%, locale to en-KE
- Trust accounts, billing, and financial tables have no tenant scoping

### Authentication & Authorization
- NextAuth v5 with JWT strategy (24hr sessions)
- 3 roles: admin, attorney, client
- JWT token carries: id, role, email, name, image — **no org context**
- Session helpers (requireAuth, requireRole) have no tenant checks
- Middleware routes by role only, no tenant detection
- Password reset tokens have no tenant context — valid across orgs

### Server Actions (25 files, 100+ functions)
- Every action checks role only, never organization
- All DB operations (INSERT, UPDATE, DELETE, SELECT) execute without tenant WHERE clauses
- Audit logging captures userId but not organizationId
- `safeAction()` wrapper has no tenant context injection point
- 21 Zod validator files have no organizationId field

### Query Layer (18+ files, 100+ functions)
- All SELECT queries return global data
- Dashboard stats aggregate across all firms
- Reports (16+ functions) have no tenant filtering
- Search (global, full-text) spans all tenant data
- `getUsers()` returns all 500 users system-wide — used in assignment dropdowns
- React `cache()` keys don't include orgId — cross-tenant cache pollution possible

### API Routes (5 endpoints)
- `/api/branches` — returns ALL active branches system-wide
- `/api/upload` — stores files in shared `/public/uploads/` with no tenant path
- `/api/upload/avatar` — shared avatar directory
- `/api/calendar/ical/[userId]` — no org validation, token has no orgId
- `/api/auth/[...nextauth]` — no tenant context in auth flow

### Workflow Engine
- `/src/lib/workflows/engine.ts` — `dispatchWorkflowEvent()` queries ALL active templates across ALL tenants
- No tenant filtering on workflow execution
- Workflow-created tasks/notifications have no org context

### UI & Branding
- "Law Firm Registry" hardcoded in 6+ locations
- Homepage fully hardcoded to single company
- Partial dynamic branding exists via `getFirmBranding()` / `firmSettings` table
- Sidebar logo "LFR" hardcoded
- iCal calendar name hardcoded

### Client-Side State
- `localStorage` keys are not org-prefixed: `law-firm-timer`, `recent-searches`, `sidebar-collapsed`
- If user switches orgs in same browser, state bleeds across tenants

### Rate Limiting
- In-memory Map with global keys like `login:{email}`, `intake:{ip}`
- One tenant's abuse triggers limits for all tenants
- Not distributed — fails in multi-instance deployment

### Scheduled Jobs
- No cron/job system exists
- Overdue invoice reminders, deadline alerts, certificate expiry notifications — all missing
- Dashboard shows overdue counts but doesn't proactively notify

### Kenya-Specific Hardcoding
- `APP_LOCALE = "en-KE"` used in 301+ locations
- `formatKES()` utility hardcodes KES currency
- Courts: 8 Kenya court types + 47 county court stations in seed data
- Kenya Data Protection Act 2019 referenced in intake form
- Phone numbers assume +254 prefix
- Attorney fields: lskNumber, commissionerForOaths, seniorCounsel

### External Integrations
- **Email:** Resend (single API key, shared FROM address `env.EMAIL_FROM ?? "noreply@example.com"`)
- **SMS:** Africa's Talking (single account, Kenya-focused)
- **PDF:** jsPDF with hardcoded KES formatting and firm name fallback

### Data Compliance
- No GDPR data export endpoint
- No org-level data deletion capability
- No soft-delete timestamps on most tables
- Audit log has no org context

---

## Stories

---

### STORY 1: Organization Entity & Database Multi-Tenancy Foundation

**Story ID:** SAAS-001-S01
**Points:** 21 (XL)
**Priority:** P0 — Must be done first; all other stories depend on this

**As a** platform operator,
**I want** a multi-tenant database schema with organization-level data isolation,
**So that** each law firm's data is completely separated at the database level.

#### Acceptance Criteria

- [ ] AC1: New `organizations` table created with fields: id (UUID PK), name, slug (unique, for subdomain), email, phone, website, address, city, county, country, logoUrl, timezone, locale, currency, status (active/suspended/cancelled), planId (FK), trialEndsAt, createdAt, updatedAt, deletedAt (soft delete)
- [ ] AC2: `organizationId` UUID NOT NULL foreign key column added to ALL tenant-scoped tables (see table list below)
- [ ] AC3: All existing global unique constraints converted to composite unique constraints scoped by organizationId:
  - `cases.caseNumber` -> unique on (caseNumber, organizationId)
  - `invoices.invoiceNumber` -> unique on (invoiceNumber, organizationId)
  - `attorneys.barNumber` -> unique on (barNumber, organizationId)
  - `practiceAreas.name` -> unique on (name, organizationId)
  - `trustAccounts.accountNumber` -> unique on (accountNumber, organizationId)
  - `quotes.quoteNumber` -> unique on (quoteNumber, organizationId)
  - `receipts.receiptNumber` -> unique on (receiptNumber, organizationId)
  - `creditNotes.creditNoteNumber` -> unique on (creditNoteNumber, organizationId)
  - `requisitions.requisitionNumber` -> unique on (requisitionNumber, organizationId)
  - `users.email` -> unique on (email, organizationId) — same email can exist in different orgs
- [ ] AC4: Database indexes created on `organizationId` for every tenant-scoped table for query performance
- [ ] AC5: `users` table gets `organizationId` NOT NULL FK; a user belongs to exactly one organization
- [ ] AC6: `branches` table gets `organizationId` NOT NULL FK; branches scoped to their organization
- [ ] AC7: New `organizationMembers` junction table for future multi-org support (userId, organizationId, role, joinedAt)
- [ ] AC8: Drizzle migration scripts generated and tested (forward migration + rollback)
- [ ] AC9: Seed script updated to create a default organization and assign all seed data to it
- [ ] AC10: All existing data migrated to belong to a default "Legacy" organization (migration script)
- [ ] AC11: `deletedAt` timestamp field added to organizations, users, clients, cases, attorneys for soft-delete support
- [ ] AC12: `organizationId` added to `workflowTemplates` and `workflowRules` tables
- [ ] AC13: `organizationId` added to `notifications` table (currently only has userId)

#### Tables Requiring organizationId

**Auth & Users:** users, branches, branchUsers
**Attorneys:** attorneys, attorneyLicenses, attorneyPracticeAreas, professionalIndemnity, lskMembership, practisingCertificates, cpdRecords, disciplinaryRecords
**Clients:** clients, clientContacts, kycDocuments, clientRiskAssessments
**Cases:** cases, caseAssignments, caseNotes, caseTimeline, caseParties, conflictChecks, pipelineStages, stageAutomations
**Billing:** invoices, invoiceLineItems, payments, quotes, quoteLineItems, receipts, creditNotes, trustAccounts, trustTransactions
**Financial:** pettyCashTransactions, bankAccounts, bankReconciliations, requisitions
**Documents:** documents, documentVersions, documentTemplates
**Calendar:** calendarEvents, eventAttendees, deadlines, tasks, bringUps
**Courts:** courtFilings, serviceOfDocuments, causeLists, causeListEntries
**Communications:** messages, notifications, smsLog
**Settings:** firmSettings, practiceAreas, billingRates, customFields, tags, emailTemplates, smsTemplates, rolePermissions, auditLog
**Workflows:** workflowTemplates, workflowRules, workflowExecutionLog
**Suppliers:** suppliers, supplierInvoices
**Time & Expenses:** timeEntries, expenses

#### Sub-Tasks

- [ ] T1.1: Create `organizations` table schema in `/src/lib/db/schema/organizations.ts`
- [ ] T1.2: Create `plans` table schema (id, name, slug, maxUsers, maxCases, maxStorage, features JSON, monthlyPrice, annualPrice, currency, isActive)
- [ ] T1.3: Add `organizationId` column to all 50+ tenant-scoped tables (modify all schema files in `/src/lib/db/schema/`)
- [ ] T1.4: Convert all global unique constraints to composite constraints (including users.email)
- [ ] T1.5: Add database indexes on organizationId for all tenant tables
- [ ] T1.6: Add `deletedAt` soft-delete timestamp to organizations, users, clients, cases, attorneys
- [ ] T1.7: Generate Drizzle migration (drizzle-kit generate)
- [ ] T1.8: Write data migration script to assign existing records to default org
- [ ] T1.9: Update seed script (`/src/lib/db/seed.ts` and `/src/lib/db/seed-data/`) to create default org
- [ ] T1.10: Update all Drizzle relations in schema files to include organization references
- [ ] T1.11: Test migration on staging database — verify zero data loss

---

### STORY 2: Authentication & Tenant Context Infrastructure

**Story ID:** SAAS-001-S02
**Points:** 13 (L)
**Priority:** P0 — Required before any tenant-filtered queries can work
**Depends On:** S01

**As a** law firm user,
**I want** my session to automatically carry my organization context,
**So that** I only see and interact with my own firm's data without any extra steps.

#### Acceptance Criteria

- [ ] AC1: JWT token extended with `organizationId` and `organizationSlug` fields
- [ ] AC2: Session object extended: `session.user.organizationId` available in all server components and actions
- [ ] AC3: TypeScript types updated in `/src/types/next-auth.d.ts` to include organizationId and organizationSlug
- [ ] AC4: `middleware.ts` updated to:
  - Extract tenant from subdomain (e.g., `acme.lawfirmregistry.co.ke` -> org slug "acme")
  - Validate that authenticated user belongs to the resolved organization
  - Reject cross-tenant access attempts with 403
  - Allow platform-level routes (landing page, super-admin) on root domain
  - Handle edge case: user visits wrong subdomain for their org
- [ ] AC5: New `requireOrg()` session helper in `/src/lib/auth/get-session.ts` that returns session with guaranteed organizationId
- [ ] AC6: New `getTenantContext()` utility that extracts organizationId from session for use in queries
- [ ] AC7: Login flow updated: after credential verification, resolve user's organizationId and inject into JWT; redirect to correct subdomain if user logs in from wrong one
- [ ] AC8: Registration flow updated: either join existing org (via invite) or create new org
- [ ] AC9: Account lockout scoped per organization (same email can exist in different orgs)
- [ ] AC10: `users.email` unique constraint changed to composite unique on (email, organizationId) (schema change in S01, enforcement here)
- [ ] AC11: Password reset flow updated — reset token stored with organizationId; reset URL includes org context (`https://acme.app.com/reset-password?token=X`); token validated against org
- [ ] AC12: `safeAction()` wrapper in `/src/lib/utils/safe-action.ts` enhanced to accept and pass tenant context, OR new `safeTenantAction()` created that auto-extracts orgId from session
- [ ] AC13: Client portal login — when a client logs in on a firm's subdomain, verify the client belongs to that firm's org; reject with clear error if not
- [ ] AC14: Handle edge case where a client's userId matches records in multiple orgs — enforce that login is scoped to the subdomain's org only

#### Sub-Tasks

- [ ] T2.1: Extend JWT callback in `/src/lib/auth/auth.ts` to include organizationId and organizationSlug in token
- [ ] T2.2: Extend session callback to expose organizationId to client
- [ ] T2.3: Update TypeScript types (`/src/types/next-auth.d.ts`)
- [ ] T2.4: Rewrite `/src/middleware.ts` with subdomain tenant resolution + cross-tenant rejection
- [ ] T2.5: Create `requireOrg()` and `getTenantContext()` helpers in `/src/lib/auth/get-session.ts`
- [ ] T2.6: Update login action (`/src/lib/actions/auth.ts`) to fetch and attach organizationId; add subdomain redirect logic
- [ ] T2.7: Update registration action to support org creation or invite-based joining
- [ ] T2.8: Create org invite system (invite tokens, email flow)
- [ ] T2.9: Update password reset flow — store orgId with token, include org in reset URL, validate on reset
- [ ] T2.10: Enhance `safeAction()` or create `safeTenantAction()` wrapper with tenant context injection
- [ ] T2.11: Add client portal org verification on login
- [ ] T2.12: Add integration tests for: cross-tenant access rejection, wrong-subdomain login, password reset cross-org, client multi-org edge case

---

### STORY 3: Query & Server Action Tenant Isolation

**Story ID:** SAAS-001-S03
**Points:** 21 (XL)
**Priority:** P0 — Core data isolation; security-critical
**Depends On:** S01, S02

**As a** law firm user,
**I want** every data query and mutation to be automatically scoped to my organization,
**So that** I can never accidentally see or modify another firm's data.

#### Acceptance Criteria

- [ ] AC1: ALL 18+ query files updated — every SELECT query includes `.where(eq(table.organizationId, orgId))` filtering
- [ ] AC2: ALL 25 server action files updated — every INSERT includes organizationId, every UPDATE/DELETE verifies organizationId ownership
- [ ] AC3: New `withTenant(orgId)` query helper created that wraps common tenant filtering patterns to reduce repetition and risk of missed filters
- [ ] AC4: Dashboard queries (`getAdminDashboardStats`, `getAttorneyDashboardStats`, `getClientDashboardStats`) scoped to org
- [ ] AC5: All report queries (16+ functions in `/src/lib/queries/reports.ts`) scoped to org
- [ ] AC6: Global search (`fullTextSearch`, `globalSearch` in `/src/lib/actions/search.ts`) scoped to org — staff searches MUST NOT return data from other orgs
- [ ] AC7: Conflict checks (`searchConflicts`, `runConflictCheck`) scoped to org — conflicts only checked within same org
- [ ] AC8: Number generation functions (invoice, case, quote, receipt, credit note, requisition, trust account) scoped to org — sequence numbers are per-org
- [ ] AC9: Audit log entries include organizationId; audit log queries filter by org
- [ ] AC10: All Drizzle `cache()` calls include organizationId in cache key to prevent cross-tenant cache leaks
- [ ] AC11: Automated tests verify that Org A cannot read/write/delete Org B's data across ALL entity types
- [ ] AC12: ALL 21 Zod validator files in `/src/lib/validators/` updated — `organizationId` added as required field on all entity creation schemas; server actions validate orgId matches session
- [ ] AC13: `getUsers()` in `/src/lib/queries/settings.ts` filtered by organizationId — currently returns up to 500 users system-wide, used in assignment dropdowns across case detail, messaging, and calendar pages
- [ ] AC14: `getAttorneys()` in `/src/lib/queries/attorneys.ts` filtered by organizationId — same cross-tenant exposure in attorney selectors
- [ ] AC15: `/api/branches` route filtered by organizationId — currently returns all active branches system-wide
- [ ] AC16: Workflow engine (`/src/lib/workflows/engine.ts`) — `dispatchWorkflowEvent()` filtered to only trigger templates belonging to the event's organization; workflow-created tasks/notifications include orgId
- [ ] AC17: Messaging — `sendMessage()` validates sender and recipient belong to the same organization; cross-org messaging blocked
- [ ] AC18: Intake form (`/src/lib/actions/intake.ts`) — resolve organizationId from subdomain context (no auth available); insert client with correct orgId; rate limit scoped to `intake:{orgId}:{ip}`

#### Files Requiring Modification

**Query Files (18 files):**
1. `/src/lib/queries/attorneys.ts` — getAttorneys, getAttorneyById, getAttorneyLicenses, getAttorneyPracticeAreas, getAvailableUsers, getAttorneyIndemnity, getAttorneyLskMemberships
2. `/src/lib/queries/billing.ts` — getInvoices, getInvoiceById, getInvoiceLineItems, getInvoicePayments, getQuotes, getInvoiceHistory, generateInvoiceNumber
3. `/src/lib/queries/cases.ts` — getCases, getCaseStats, getCaseById, getCaseAssignments, getCaseNotes, getCaseTimeline, getCaseNumber, getCasesByPipelineStage
4. `/src/lib/queries/clients.ts` — getClients, getClientById, getClientsByPipelineStage, getClientContacts
5. `/src/lib/queries/compliance.ts` — getAttorneyCertificates, getAttorneyCpdRecords, getCpdSummary, getExpiringCertificates, getNonCompliantCpdAttorneys
6. `/src/lib/queries/dashboard.ts` — getAdminDashboardStats, getAttorneyDashboardStats, getClientDashboardStats
7. `/src/lib/queries/documents.ts` — getDocuments, getDocumentTemplates, getDocumentVersions, getPendingReviewDocuments
8. `/src/lib/queries/messaging.ts` — getMessages, getSentMessages, getMessageById, getMessageThread, getNotifications, getUnreadNotificationCount
9. `/src/lib/queries/permissions.ts` — getPermissionsForRole, getAllRolePermissions
10. `/src/lib/queries/settings.ts` — getUsers, getUserById, getPracticeAreas, getBillingRates, getFirmSettings, getBranches, getBranchWithUsers, getCustomFields, getTags, getEmailTemplates, getSmsTemplates, getAuditLogs, getFirmBranding
11. `/src/lib/queries/suppliers.ts` — getSuppliers, getSupplierById, getSupplierInvoices
12. `/src/lib/queries/time-expenses.ts` — getTimeEntries, getWeeklyTimesheet, getWeeklyTimeEntries, getExpenses, getRequisitions, getRequisitionHistory
13. `/src/lib/queries/trust.ts` — getTrustAccounts, getTrustAccountById, getTrustTransactions, getClientsForSelect, getCasesForSelect, getPettyCashTransactions, getBankAccounts, getBankReconciliations
14. `/src/lib/queries/kyc.ts` — getClientKycDocuments, getClientRiskAssessment, getKycComplianceStats
15. `/src/lib/queries/calendar.ts` — getCalendarEvents, getEventById, getDeadlines, getTasks, getBringUps
16. `/src/lib/queries/courts.ts` — getCourtFilings, getAllCourtFilings, getAllServiceOfDocuments, getCourtRules (courts themselves remain global)
17. `/src/lib/queries/disciplinary.ts` — getAttorneyDisciplinaryRecords, getActiveDisciplinaryProceedings, getAllActiveDisciplinaryProceedings
18. `/src/lib/queries/reports.ts` — getRevenueReport, getAccountsReceivableAgingReport, getTimeAndExpenseReport, getCasePerformanceReport, getAttorneyPerformanceReport, + 10 more

**Server Action Files (25 files):**
1. `/src/lib/actions/attorneys.ts` — createAttorney, updateAttorney, deactivateAttorney, addAttorneyLicense, linkPracticeAreas, addProfessionalIndemnity, addLskMembership
2. `/src/lib/actions/auth.ts` — loginAction (add org resolution), registerAction (org creation/joining)
3. `/src/lib/actions/billing.ts` — createInvoice, updateInvoice, sendInvoice, recordPayment, cancelInvoice, deleteInvoice, createQuote, createQuoteWithLineItems, updateQuoteStatus, createReceipt, createCreditNote
4. `/src/lib/actions/branches.ts` — createBranch, updateBranch, toggleBranchActive, assignUserToBranch, removeUserFromBranch
5. `/src/lib/actions/calendar.ts` — createEvent, createDeadline, completeDeadline, createTask, updateTaskStatus, addEventAttendee, removeEventAttendee, deleteTask, deleteDeadline, deleteEvent, updateTask, updateDeadline, updateEvent
6. `/src/lib/actions/cases.ts` — createCase, updateCase, + additional case functions
7. `/src/lib/actions/clients.ts` — createClient, updateClient, deactivateClient, addContactLog, updateContactLog, deleteContactLog, addKycDocument
8. `/src/lib/actions/compliance.ts` — addPractisingCertificate, addCpdRecord, deleteCpdRecord
9. `/src/lib/actions/conflicts.ts` — searchConflicts, runConflictCheck
10. `/src/lib/actions/courts.ts` — createCourt (global), createCourtFiling, updateFilingStatus, createServiceOfDocument, updateServiceOfDocument
11. `/src/lib/actions/disciplinary.ts` — addDisciplinaryRecord, updateDisciplinaryRecord
12. `/src/lib/actions/documents.ts` — createDocumentRecord, updateDocumentStatus, updateDocument, createTemplate, deleteDocument
13. `/src/lib/actions/intake.ts` — submitIntake (must resolve org from subdomain context)
14. `/src/lib/actions/kyc.ts` — verifyKycDocument, addRiskAssessment
15. `/src/lib/actions/messaging.ts` — sendMessage, deleteMessage, markMessageRead, markNotificationsRead
16. `/src/lib/actions/permissions.ts` — getMyPermissions, updateRolePermissions
17. `/src/lib/actions/pipeline.ts` — executeStageAutomations, createStageAutomation
18. `/src/lib/actions/profile.ts` — changePassword, updateProfile
19. `/src/lib/actions/reports.ts` — emailReport
20. `/src/lib/actions/search.ts` — globalSearch
21. `/src/lib/actions/settings.ts` — createPracticeArea, updatePracticeArea, togglePracticeAreaActive, deletePracticeArea, createBillingRate, upsertFirmSetting, createCustomField
22. `/src/lib/actions/suppliers.ts` — createSupplier, updateSupplier, toggleSupplierActive, createSupplierInvoice, deleteSupplierInvoice, paySupplierInvoice
23. `/src/lib/actions/time-expenses.ts` — createTimeEntry, deleteTimeEntry, createExpense, createRequisition, updateTimeEntry, updateExpense, deleteExpense, markTimeEntryBillable, markExpenseBillable, createBatchTimeEntries
24. `/src/lib/actions/trust.ts` — createTrustTransaction, createTrustAccount, updateTrustAccount, createPettyCashTransaction
25. `/src/lib/actions/workflows.ts` — createWorkflowTemplate, updateWorkflowTemplate, toggleWorkflowActive, createWorkflowRule, deleteWorkflowRule

**Validator Files (21 files):**
All files in `/src/lib/validators/` — add organizationId to creation schemas

**Workflow Engine:**
`/src/lib/workflows/engine.ts` — add tenant filtering to dispatchWorkflowEvent()

**API Routes:**
`/src/app/api/branches/route.ts` — add organizationId filter

#### Sub-Tasks

- [ ] T3.1: Create `withTenant()` query helper utility in `/src/lib/utils/tenant.ts`
- [ ] T3.2: Update all 18 query files to add organizationId filtering (batch by domain)
- [ ] T3.3: Update all 25 action files to include organizationId on inserts and verify on updates/deletes
- [ ] T3.4: Update all 21 validator files to include organizationId on creation schemas
- [ ] T3.5: Update number generation to be per-org sequential
- [ ] T3.6: Update audit logging to include organizationId
- [ ] T3.7: Update React `cache()` keys to include orgId
- [ ] T3.8: Update workflow engine `dispatchWorkflowEvent()` to filter by orgId
- [ ] T3.9: Update `/api/branches` route to filter by orgId
- [ ] T3.10: Update intake form action to resolve orgId from request context (subdomain/header)
- [ ] T3.11: Update messaging to validate sender/recipient same org
- [ ] T3.12: Write cross-tenant isolation tests (create 2 orgs, verify complete data separation across ALL entity types)
- [ ] T3.13: Security review — manual audit of every query for tenant leak vectors

---

### STORY 4: File Storage Tenant Isolation

**Story ID:** SAAS-001-S04
**Points:** 8 (M)
**Priority:** P1
**Depends On:** S01, S02

**As a** law firm,
**I want** my uploaded documents and files to be stored separately from other firms,
**So that** our confidential legal documents cannot be accessed by other tenants.

#### Acceptance Criteria

- [ ] AC1: Cloud storage provider integrated (S3, Cloudflare R2, or Supabase Storage) — local `/public/uploads/` eliminated for production
- [ ] AC2: File upload path uses tenant-isolated keys: `{orgId}/documents/{uuid}.ext` and `{orgId}/avatars/{uuid}.ext`
- [ ] AC3: Document download/access validates that requesting user belongs to the document's organization
- [ ] AC4: Signed URLs with expiration used for file access — no direct public file URLs
- [ ] AC5: Existing files migrated to new tenant-isolated paths in cloud storage
- [ ] AC6: Per-tenant storage usage tracking (for plan limits)
- [ ] AC7: `documents` table queries verify organizationId before returning file URLs
- [ ] AC8: iCal export (`/api/calendar/ical/[userId]`) validates org context; token generation includes orgId; token from Org A cannot access Org B calendar
- [ ] AC9: File upload size limits enforced per-org based on plan (storage quota)

#### Sub-Tasks

- [ ] T4.1: Evaluate and integrate cloud storage provider (Cloudflare R2 or S3)
- [ ] T4.2: Create storage utility with tenant-prefixed key generation and signed URL support
- [ ] T4.3: Update `/api/upload/route.ts` to use cloud storage with tenant-isolated keys
- [ ] T4.4: Update `/api/upload/avatar/route.ts` for tenant isolation
- [ ] T4.5: Add org validation to document download/access; implement signed URLs
- [ ] T4.6: Write migration script for existing files to cloud storage
- [ ] T4.7: Add storage usage tracking per org
- [ ] T4.8: Update iCal export — encode orgId in token, validate on access
- [ ] T4.9: Enforce per-org storage quota based on plan

---

### STORY 5: Subscription Billing & Plan Management

**Story ID:** SAAS-001-S05
**Points:** 21 (XL)
**Priority:** P1
**Depends On:** S01, S02

**As a** platform operator,
**I want** a subscription billing system with tiered plans,
**So that** I can monetize the platform and control feature access per firm.

#### Acceptance Criteria

- [ ] AC1: `plans` table with tiers: Free/Starter, Professional, Enterprise (configurable)
- [ ] AC2: `subscriptions` table: organizationId, planId, status (trialing/active/past_due/cancelled), currentPeriodStart, currentPeriodEnd, stripeCustomerId, stripeSubscriptionId
- [ ] AC3: Stripe integration for payment processing (Checkout, Billing Portal, Webhooks)
- [ ] AC4: M-Pesa payment bridge for Kenya market (via Stripe or custom integration)
- [ ] AC5: Plan limits enforced: max users, max cases, max storage, feature access
- [ ] AC6: Usage tracking: current user count, case count, storage used per org
- [ ] AC7: Upgrade/downgrade flow with prorated billing
- [ ] AC8: Trial period support (14-day default)
- [ ] AC9: Grace period for failed payments before suspension (7-day default)
- [ ] AC10: Webhook handlers for Stripe events (payment_succeeded, payment_failed, subscription_updated, subscription_deleted)
- [ ] AC11: Billing admin page for org admins to manage subscription
- [ ] AC12: Plan limit enforcement middleware — reject actions that exceed plan limits with clear error messages
- [ ] AC13: Feature gating integrated with permissions — features like trust accounting, workflow automation, custom branding gated by plan tier

#### Plan Tiers (Suggested)

| Feature | Starter | Professional | Enterprise |
|---------|---------|-------------|------------|
| Users | 5 | 25 | Unlimited |
| Cases | 100 | 1,000 | Unlimited |
| Storage | 5 GB | 50 GB | 500 GB |
| Client Portal | Yes | Yes | Yes |
| Billing & Invoicing | Basic | Full | Full |
| Trust Accounting | No | Yes | Yes |
| Reports | Basic | Full | Full + Custom |
| Workflow Automation | No | Yes | Yes |
| API Access | No | No | Yes |
| Custom Branding | No | Yes | Yes |
| Priority Support | No | No | Yes |

#### Sub-Tasks

- [ ] T5.1: Create `plans` and `subscriptions` schema in `/src/lib/db/schema/subscriptions.ts`
- [ ] T5.2: Create `usageLimits` table (organizationId, metric, currentValue, maxValue)
- [ ] T5.3: Integrate Stripe SDK — create customers, subscriptions, checkout sessions
- [ ] T5.4: Build webhook handler `/api/webhooks/stripe/route.ts`
- [ ] T5.5: Create plan enforcement middleware/helper (`checkPlanLimit("users")`, `checkFeatureAccess("trust_accounting")`)
- [ ] T5.6: Build subscription management page (`/settings/subscription`)
- [ ] T5.7: Build plan selection/upgrade UI
- [ ] T5.8: Implement trial period logic
- [ ] T5.9: Implement grace period and suspension on payment failure
- [ ] T5.10: Research and integrate M-Pesa payment option for Kenya market
- [ ] T5.11: Seed default plans
- [ ] T5.12: Integrate feature gating with existing permissions system

---

### STORY 6: Tenant Onboarding & Organization Management

**Story ID:** SAAS-001-S06
**Points:** 13 (L)
**Priority:** P1
**Depends On:** S01, S02, S05

**As a** new law firm,
**I want** a self-service onboarding flow to set up my firm on the platform,
**So that** I can start using the system without manual intervention.

#### Acceptance Criteria

- [ ] AC1: Public signup page on root domain (lawfirmregistry.co.ke/signup)
- [ ] AC2: Onboarding wizard: Firm name, slug (subdomain), admin email, password, plan selection, country/jurisdiction, currency
- [ ] AC3: Slug validation (uniqueness, allowed characters, reserved words blacklist — e.g., `admin`, `api`, `app`, `www`, `mail`, `support`)
- [ ] AC4: Organization created atomically with: firm record, admin user, default branch ("Main Office"), default settings, default permissions, default practice areas for selected jurisdiction
- [ ] AC5: Subdomain provisioned automatically (DNS wildcard + middleware routing)
- [ ] AC6: Welcome email sent to firm admin with getting-started guide and subdomain URL
- [ ] AC7: Onboarding checklist shown on first login (add attorneys, configure branding, import clients, set up billing rates, etc.)
- [ ] AC8: Invite flow: firm admin can invite users via email with role assignment
- [ ] AC9: User invitation acceptance creates account within the inviting organization on the correct subdomain
- [ ] AC10: Intake form (`/intake`) resolves to correct organization based on subdomain

#### Sub-Tasks

- [ ] T6.1: Build signup page and onboarding wizard with jurisdiction/currency selection
- [ ] T6.2: Create org provisioning service (creates org + admin + defaults in single DB transaction)
- [ ] T6.3: Build slug validation and reservation system with reserved words blacklist
- [ ] T6.4: Configure DNS wildcard for subdomain routing
- [ ] T6.5: Build invite system (invite tokens, email, acceptance flow on correct subdomain)
- [ ] T6.6: Build onboarding checklist component
- [ ] T6.7: Update intake form to resolve org from subdomain
- [ ] T6.8: Send welcome email via Resend with subdomain URL

---

### STORY 7: Configuration Internationalization & Per-Tenant Settings

**Story ID:** SAAS-001-S07
**Points:** 13 (L)
**Priority:** P1 (upgraded from P2 — required for any non-Kenya firm to use the platform)
**Depends On:** S01, S02, S03

**As a** law firm in any jurisdiction,
**I want** my currency, locale, VAT rate, and legal system configuration to be specific to my firm,
**So that** the platform works correctly for my country and practice.

#### Acceptance Criteria

- [ ] AC1: `APP_LOCALE` constant (`/src/lib/constants/locale.ts`) replaced with per-org setting fetched from organization record or `firmSettings`
- [ ] AC2: `formatKES()` utility (`/src/lib/utils/format.ts`) replaced with generic `formatCurrency(amount, currency, locale)` that reads org config
- [ ] AC3: VAT rate (currently hardcoded 16% in `/src/lib/db/schema/billing.ts`) moved to per-org `firmSettings`
- [ ] AC4: Invoice/quote/receipt/credit note number prefixes configurable per org (currently INV-, QT-, RCT-, CN-, REQ-, TRUST-, CASE-)
- [ ] AC5: Currency field default changed from hardcoded "KES" to org setting in all schema files
- [ ] AC6: All 301+ usages of `APP_LOCALE` / `formatKES` updated to use tenant-aware formatting
- [ ] AC7: Kenya-specific fields (lskNumber, kraPin, nationalId, commissionerForOaths, seniorCounsel) made optional — display based on org's jurisdiction setting
- [ ] AC8: Courts table remains global but org can configure which court types are relevant to them
- [ ] AC9: Compliance thresholds (CPD units: 5 total, 2 LSK) made per-org configurable
- [ ] AC10: PDF generation (`generate-pdf.ts`, `generate-invoice-pdf.ts`) uses org branding, currency, and locale
- [ ] AC11: Email templates use org branding (colors, logo, firm name); per-org FROM email address supported (e.g., `billing@acmefirm.com` instead of global `noreply@example.com`)
- [ ] AC12: SMS sender ID configurable per org (or use platform default)
- [ ] AC13: `localStorage` keys prefixed with orgId to prevent state bleed between orgs in same browser — affects: timer-widget (`law-firm-timer`), command-search (`recent-searches`), sidebar (`sidebar-collapsed`)

#### Sub-Tasks

- [ ] T7.1: Create `formatCurrency(amount, currency, locale)` utility to replace `formatKES()`
- [ ] T7.2: Create tenant config context/helper that caches org settings (locale, currency, timezone) for the request lifecycle
- [ ] T7.3: Update all 301+ locale/currency references across components (batch by feature area)
- [ ] T7.4: Make Kenya-specific schema fields optional with jurisdiction toggle
- [ ] T7.5: Update PDF generators to use org branding, currency, and locale
- [ ] T7.6: Update email sending (`/src/lib/email/send-email.ts`) to support per-org FROM address lookup
- [ ] T7.7: Add jurisdiction/country/timezone setting to organization profile
- [ ] T7.8: Add currency/locale settings to org onboarding wizard
- [ ] T7.9: Prefix all localStorage keys with orgId — update timer-widget, command-search, sidebar components

---

### STORY 8: Platform Super-Admin & Tenant Management

**Story ID:** SAAS-001-S08
**Points:** 13 (L)
**Priority:** P2
**Depends On:** S01, S02, S05

**As a** platform operator (super-admin),
**I want** a platform-level admin panel to manage all organizations,
**So that** I can monitor, support, and manage tenants across the platform.

#### Acceptance Criteria

- [ ] AC1: New `super_admin` role that exists outside of any organization (added to userRole enum)
- [ ] AC2: Super-admin dashboard on root domain (`/admin`) showing: total orgs, total users, MRR, active subscriptions, recent signups
- [ ] AC3: Organization list with search, filter by status/plan, sort by created date/user count
- [ ] AC4: Organization detail view: firm info, subscription status, user count, case count, storage usage, audit log
- [ ] AC5: Ability to suspend/reactivate an organization (sets org status, blocks all org users at middleware level)
- [ ] AC6: Ability to impersonate an org admin for support purposes (with audit trail)
- [ ] AC7: Platform-level audit log (org creations, suspensions, plan changes, impersonation events)
- [ ] AC8: Revenue dashboard: MRR, churn rate, plan distribution, growth metrics
- [ ] AC9: Manage global resources: court hierarchy, shared reference data
- [ ] AC10: Manage plans and pricing
- [ ] AC11: System health monitoring: DB size, active connections, error rates
- [ ] AC12: Super-admin middleware prevents access from tenant subdomains — only root domain

#### Sub-Tasks

- [ ] T8.1: Add `super_admin` role to user role enum
- [ ] T8.2: Create super-admin middleware (root domain only, super_admin role)
- [ ] T8.3: Build super-admin dashboard page with platform metrics
- [ ] T8.4: Build organization management CRUD pages
- [ ] T8.5: Build impersonation system with audit trail
- [ ] T8.6: Build revenue analytics dashboard
- [ ] T8.7: Build plan management UI
- [ ] T8.8: Build system health monitoring page
- [ ] T8.9: Implement org suspension — middleware blocks all requests for suspended orgs with clear message

---

### STORY 9: Landing Page & Marketing Site Overhaul

**Story ID:** SAAS-001-S09
**Points:** 8 (M)
**Priority:** P2
**Depends On:** S05, S06

**As a** prospective customer,
**I want** a professional SaaS marketing site with pricing and signup,
**So that** I can understand the product value and sign up my firm.

#### Acceptance Criteria

- [ ] AC1: Root domain (`lawfirmregistry.co.ke`) serves marketing site instead of single-firm homepage
- [ ] AC2: Remove all single-firm hardcoded content from `/app/page.tsx`
- [ ] AC3: New pages: Home, Features, Pricing, About, Contact, Login, Signup
- [ ] AC4: Pricing page displays plan tiers with feature comparison matrix
- [ ] AC5: CTA buttons link to signup flow with plan pre-selection
- [ ] AC6: SEO metadata updated for SaaS positioning
- [ ] AC7: "Built for Kenya's Legal Profession" can remain but add "and beyond" positioning
- [ ] AC8: Remove hardcoded email (info@lawfirmregistry.co.ke) — use dynamic contact form
- [ ] AC9: All hardcoded "Law Firm Registry" branding in non-tenant pages updated to platform branding
- [ ] AC10: Subdomain pages (`firm.lawfirmregistry.co.ke`) show firm-specific branding

#### Hardcoded References to Update

| Current Value | Location | New Behavior |
|--------------|----------|-------------|
| "Law Firm Registry" | `/src/app/layout.tsx` (title) | Platform name for root; org name for subdomains |
| "Law Firm Registry" | `/src/app/page.tsx` (multiple) | SaaS marketing copy |
| "Comprehensive law firm management system for Kenya" | `/src/app/layout.tsx` (description) | SaaS description |
| "Legal Practice Management System" | `/src/app/(auth)/layout.tsx` | Keep or make dynamic per org |
| "LFR" | `/src/components/layout/sidebar.tsx` | Org logo or abbreviation from org name |
| "Law Firm Registry" | `/src/app/api/calendar/ical/[userId]/route.ts` | Org name from DB |
| "info@lawfirmregistry.co.ke" | `/src/app/page.tsx` | Platform contact or remove |
| "Client Intake Form" | `/src/app/intake/layout.tsx` | Org-branded intake |
| "Law Firm Registry" | `/src/lib/utils/generate-pdf.ts` (DEFAULT_FIRM_NAME) | Org name from DB |

#### Sub-Tasks

- [ ] T9.1: Redesign root domain homepage as SaaS marketing site
- [ ] T9.2: Build pricing page with plan comparison
- [ ] T9.3: Build features page
- [ ] T9.4: Update all hardcoded references (see table above)
- [ ] T9.5: Add dynamic metadata based on tenant vs root domain
- [ ] T9.6: Update sidebar to use org name/logo instead of "LFR"
- [ ] T9.7: Update iCal calendar name to use org name
- [ ] T9.8: Update PDF DEFAULT_FIRM_NAME to fetch from org settings

---

### STORY 10: Rate Limiting, Background Jobs & Operational Infrastructure

**Story ID:** SAAS-001-S10
**Points:** 13 (L)
**Priority:** P1 (upgraded — required for reliable SaaS operation)
**Depends On:** S01, S02

**As a** platform operator,
**I want** tenant-aware rate limiting and a background job system,
**So that** one tenant's activity doesn't impact others, and scheduled operations (reminders, alerts, billing) work reliably.

#### Acceptance Criteria

**Rate Limiting:**
- [ ] AC1: Rate limiter (`/src/lib/utils/rate-limit.ts`) replaced with distributed Redis-backed implementation
- [ ] AC2: All rate limit keys scoped per-tenant: `{orgId}:login:{email}`, `{orgId}:intake:{ip}`, `{orgId}:api:{userId}`
- [ ] AC3: Per-org API rate limits configurable based on plan tier (Starter: 100 req/min, Pro: 500, Enterprise: 2000)
- [ ] AC4: Global rate limits remain for unauthenticated endpoints (signup, contact form)

**Background Jobs:**
- [ ] AC5: Job queue system integrated (Inngest, BullMQ, or similar) with tenant-scoped execution
- [ ] AC6: Scheduled job: Check overdue invoices daily — create notifications for org admins, optionally send email reminders (per-org setting)
- [ ] AC7: Scheduled job: Check approaching deadlines (statutory and non-statutory) — alert assigned attorneys via notification (configurable lead time per org)
- [ ] AC8: Scheduled job: Check attorney certificate/license expiry — alert org admin when certificates expire within 60 days (configurable per org)
- [ ] AC9: Scheduled job: Check subscription payment status — trigger grace period warnings, suspend orgs after grace period
- [ ] AC10: Scheduled job: Cleanup expired password reset tokens, expired invite tokens
- [ ] AC11: All background jobs run with tenant context — queries scoped to the org being processed
- [ ] AC12: Job execution logging with orgId for debugging

#### Sub-Tasks

- [ ] T10.1: Replace in-memory rate limiter with Redis-backed implementation (Upstash Redis or similar)
- [ ] T10.2: Update all rate limit keys to include orgId
- [ ] T10.3: Add per-plan rate limit configuration
- [ ] T10.4: Integrate background job system (Inngest recommended for serverless Next.js)
- [ ] T10.5: Build overdue invoice reminder job
- [ ] T10.6: Build approaching deadline alert job
- [ ] T10.7: Build certificate/license expiry check job
- [ ] T10.8: Build subscription payment/grace period job
- [ ] T10.9: Build token cleanup job
- [ ] T10.10: Add job execution dashboard for super-admin

---

### STORY 11: Data Compliance, API Keys & Tenant Data Management

**Story ID:** SAAS-001-S11
**Points:** 13 (L)
**Priority:** P2
**Depends On:** S01, S02, S03, S05

**As a** law firm administrator,
**I want** to export all my firm's data, manage API keys, and have confidence my data can be deleted if I leave the platform,
**So that** I maintain control over my data and meet regulatory compliance requirements.

#### Acceptance Criteria

**GDPR / Data Compliance:**
- [ ] AC1: Org-level data export endpoint — generates a complete archive (JSON + files) of all org data: users, clients, cases, documents, invoices, time entries, settings, audit log
- [ ] AC2: Data export accessible from org admin settings page with progress indicator
- [ ] AC3: Org-level data deletion — when an org is cancelled and past retention period, all org data is permanently purged
- [ ] AC4: Data retention policy configurable per org (default: 90 days after cancellation before permanent deletion)
- [ ] AC5: Soft-delete used throughout — cancelled orgs' data hidden immediately but retained for recovery window
- [ ] AC6: Audit log entry for all data export and deletion requests

**API Key Management (Enterprise Plan):**
- [ ] AC7: `apiKeys` table: id, organizationId, name, keyHash, keyPrefix (first 8 chars for identification), permissions (JSON), lastUsedAt, expiresAt, createdBy, createdAt, revokedAt
- [ ] AC8: API key CRUD in org admin settings (create, list, revoke — key shown only once on creation)
- [ ] AC9: API key authentication middleware — validate key, resolve orgId, enforce permissions
- [ ] AC10: API key rate limiting separate from user rate limiting
- [ ] AC11: Feature gated to Enterprise plan only

**Tenant Data Management:**
- [ ] AC12: Org admin can view storage usage, user count, case count on a settings dashboard
- [ ] AC13: Approaching-limit warnings (80%, 95%) shown in dashboard and sent via email

#### Sub-Tasks

- [ ] T11.1: Build data export service — query all org tables, package as downloadable archive
- [ ] T11.2: Build data export UI in org settings with async job + download link
- [ ] T11.3: Build data deletion job — purge all org records after retention period
- [ ] T11.4: Create `apiKeys` table schema
- [ ] T11.5: Build API key CRUD actions and settings page
- [ ] T11.6: Build API key authentication middleware
- [ ] T11.7: Build usage dashboard component for org settings
- [ ] T11.8: Build approaching-limit notification triggers

---

## Story Dependency Graph

```
S01 (DB Foundation)
 |
 +---> S02 (Auth & Tenant Context)
        |
        +---> S03 (Query/Action Isolation)
        |      |
        |      +---> S07 (Internationalization)
        |      |
        |      +---> S11 (Data Compliance & API Keys)
        |
        +---> S04 (File Storage Isolation)
        |
        +---> S05 (Subscription Billing)
        |      |
        |      +---> S06 (Onboarding)
        |      |
        |      +---> S08 (Super-Admin)
        |      |
        |      +---> S09 (Landing Page)
        |
        +---> S10 (Rate Limiting & Background Jobs)
```

---

## Effort Estimation Summary

| Story | Points | Priority | Description |
|-------|--------|----------|-------------|
| S01 | 21 (XL) | P0 | Database Multi-Tenancy Foundation |
| S02 | 13 (L) | P0 | Authentication & Tenant Context |
| S03 | 21 (XL) | P0 | Query & Action Tenant Isolation |
| S04 | 8 (M) | P1 | File Storage Isolation |
| S05 | 21 (XL) | P1 | Subscription Billing |
| S06 | 13 (L) | P1 | Tenant Onboarding |
| S07 | 13 (L) | P1 | Internationalization & Per-Tenant Config |
| S08 | 13 (L) | P2 | Super-Admin Panel |
| S09 | 8 (M) | P2 | Landing Page Overhaul |
| S10 | 13 (L) | P1 | Rate Limiting & Background Jobs |
| S11 | 13 (L) | P2 | Data Compliance & API Keys |
| **Total** | **157 pts** | | **11 stories** |

---

## Suggested Sprint Plan (2-week sprints)

### Sprint 1-2: Foundation (P0)
- S01: Database Multi-Tenancy Foundation
- S02: Authentication & Tenant Context

### Sprint 3-4: Core Isolation (P0)
- S03: Query & Action Tenant Isolation (largest story — may span 2 sprints)

### Sprint 5-6: Infrastructure & Storage (P1)
- S04: File Storage Isolation
- S10: Rate Limiting & Background Jobs

### Sprint 7-8: Monetization (P1)
- S05: Subscription Billing
- S07: Internationalization & Per-Tenant Config

### Sprint 9: Onboarding (P1)
- S06: Tenant Onboarding

### Sprint 10-11: Platform (P2)
- S08: Super-Admin Panel
- S09: Landing Page Overhaul
- S11: Data Compliance & API Keys

### Sprint 12: Hardening
- Cross-tenant penetration testing (every query, every action, every API route)
- localStorage bleed testing (org switching in same browser)
- Password reset cross-org testing
- iCal token cross-org testing
- Performance testing with 50+ tenants
- Load testing with realistic data volumes
- Client portal multi-org edge case testing
- Workflow engine cross-tenant trigger testing
- Background job tenant isolation testing
- Documentation and runbooks

---

## Risk Register

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| Missing tenant filter on a query — data leak | Critical | Medium | Centralized `withTenant()` helper; `safeTenantAction()` wrapper; automated tests for every query; security audit in S03 |
| Workflow engine triggers cross-tenant templates | Critical | High | AC16 in S03 explicitly addresses this; test with multi-tenant workflow setup |
| Migration breaks existing production data | High | Low | Test migration on staging; maintain rollback scripts |
| Stripe/M-Pesa integration complexity | Medium | Medium | Start with Stripe only; add M-Pesa in later phase |
| Performance degradation with shared DB | Medium | Low | Proper indexes on organizationId; monitor query plans |
| Subdomain DNS/SSL complexity | Medium | Medium | Use wildcard SSL cert; Cloudflare for DNS |
| Scope creep on internationalization | Medium | High | Limit S07 to currency/locale/branding; defer full i18n |
| localStorage bleed between orgs | Medium | High | S07 AC13 prefixes all keys; test org switching |
| Password reset token works across orgs | High | Medium | S02 AC11 adds org context to tokens |
| Client belongs to multiple orgs — wrong data shown | High | Medium | S02 AC14 enforces subdomain-scoped login |
| Rate limiting allows cross-tenant abuse | Medium | High | S10 replaces with Redis-backed per-tenant limiter |
| No background jobs — overdue invoices/deadlines missed | Medium | High | S10 adds job queue with scheduled tasks |
| GDPR non-compliance — no data export/deletion | High | Medium | S11 adds export endpoint and deletion pipeline |

---

## Global Data (Remains Shared Across Tenants)

These tables do NOT need organizationId — they are platform-level reference data:

- `courts` — Court hierarchy (shared reference, initially Kenya courts)
- `courtStations` — Court station locations (shared reference)
- `plans` — Subscription plan tiers (platform-managed)

All other tables require tenant isolation.

---

## Technical Notes

### Current Tech Stack (No Changes Required)
- Next.js 16.1.6 (App Router)
- React 19.2.3
- Drizzle ORM 0.45.1
- PostgreSQL on Neon (serverless)
- NextAuth 5.0.0-beta.30
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui components

### New Dependencies Required
- `stripe` — Payment processing SDK
- `@stripe/stripe-js` — Client-side Stripe
- `@upstash/redis` + `@upstash/ratelimit` — Distributed rate limiting
- `inngest` — Background job queue (serverless-friendly) OR `bullmq` + `ioredis`
- `@aws-sdk/client-s3` or `@cloudflare/r2` — Cloud storage SDK
- Possibly `@vercel/analytics` or similar for platform metrics

### Environment Variables to Add
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `S3_BUCKET` / `R2_BUCKET`
- `S3_ACCESS_KEY_ID` / `R2_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY` / `R2_SECRET_ACCESS_KEY`
- `S3_REGION` / `R2_ACCOUNT_ID`
- `INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY`
- `PLATFORM_DOMAIN` (e.g., lawfirmregistry.co.ke)
- `SUPER_ADMIN_EMAILS` (comma-separated list for bootstrap)

---

## Adversarial Review Findings (Addressed)

The following gaps were identified during adversarial review and incorporated into the stories above:

| Gap Found | Addressed In | AC/Task |
|-----------|-------------|---------|
| Workflow engine dispatches to all tenants | S03 | AC16 |
| Zod validators missing organizationId | S03 | AC12, T3.4 |
| `safeAction()` has no tenant injection | S02 | AC12, T2.10 |
| GDPR data export/deletion missing | S11 | AC1-AC6 |
| Rate limiting is global in-memory | S10 | AC1-AC4 |
| No scheduled jobs exist | S10 | AC5-AC12 |
| API key management missing | S11 | AC7-AC11 |
| Password reset has no tenant context | S02 | AC11, T2.9 |
| localStorage bleeds between orgs | S07 | AC13, T7.9 |
| iCal token has no orgId | S04 | AC8, T4.8 |
| Per-org email FROM address | S07 | AC11, T7.6 |
| Client multi-org edge case | S02 | AC13-AC14, T2.11 |
| `getUsers()` returns all orgs' users | S03 | AC13 |
| `getAttorneys()` unfiltered in dropdowns | S03 | AC14 |
| `/api/branches` returns all orgs' branches | S03 | AC15 |
| Intake form creates orphan records (no orgId) | S03 | AC18 |
| Messaging allows cross-org send | S03 | AC17 |
| Notifications table missing orgId | S01 | AC13 |
| `workflowTemplates` missing orgId | S01 | AC12 |
| Soft-delete not supported | S01 | AC11 |
