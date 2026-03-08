# Story SAAS.3: Query & Server Action Tenant Isolation

Status: done

## Story

As a **law firm user**,
I want **every data query and mutation to be automatically scoped to my organization**,
so that **I can never accidentally see or modify another firm's data**.

## Acceptance Criteria

1. **AC1:** ALL query files include organizationId filtering on every SELECT
2. **AC2:** ALL server action files include organizationId on INSERTs and verify on UPDATE/DELETE
3. **AC3:** `withTenant()` query helper exists
4. **AC4:** Dashboard queries scoped to org
5. **AC5:** All report queries scoped to org
6. **AC6:** Global search scoped to org
7. **AC7:** Conflict checks scoped to org
8. **AC8:** Number generation per-org sequential
9. **AC9:** Audit log entries include organizationId
10. **AC10:** React `cache()` keys include organizationId (or function args inherently scope)
11. **AC12:** Validators — organizationId injected server-side (not in client schemas)
12. **AC13:** `getUsers()` filtered by organizationId
13. **AC14:** `getAttorneys()` filtered by organizationId
14. **AC15:** `/api/branches` route filtered by organizationId
15. **AC16:** Workflow engine org-scoped
16. **AC17:** Messaging validates sender/recipient same org
17. **AC18:** Intake form resolves orgId from subdomain

## Current Implementation Status

**~95% of this story is already implemented.** Comprehensive audit reveals:

### ALREADY DONE

- **AC1 DONE:** ALL 27 query files accept `organizationId` as first parameter and filter by it. Verified: attorneys, billing, calendar, cases, clients, compliance, courts (operational tables), dashboard, dashboard-attorney, dashboard-charts, disciplinary, documents, kpi, kyc, messaging, notifications, permissions, pipeline-analytics, portal, reports (16+ functions), search, settings, suppliers, time-expenses, trust, workflows, attorney-performance.
- **AC2 DONE:** ALL 24 action files use `getTenantContext()` or equivalent to get organizationId. All INSERTs include organizationId. All UPDATE/DELETE WHERE clauses include organizationId.
- **AC3 DONE:** `withTenant()` and `tenantAnd()` helpers exist in `src/lib/utils/tenant.ts`.
- **AC4 DONE:** Dashboard queries accept and filter by organizationId.
- **AC5 DONE:** All 16 report functions accept and filter by organizationId.
- **AC6 DONE:** `fullTextSearch()` in `src/lib/queries/search.ts` filters by organizationId.
- **AC7 DONE:** Conflict checks in `src/lib/actions/conflicts.ts` use `getTenantContext()`.
- **AC8 DONE:** `generateInvoiceNumber()` and `generateCaseNumber()` accept organizationId and scope sequence queries.
- **AC9 DONE:** auditLog.organizationId is NOT NULL (fixed in S01). Queries filter by orgId.
- **AC10 DONE:** React `cache()` used for per-render deduplication — function arguments (including organizationId) provide natural cache scoping. No explicit cache keys needed.
- **AC12 DONE:** Validators define client-facing schemas. organizationId is injected server-side in actions — this is the correct pattern.
- **AC13 DONE:** `getUsers()` accepts and filters by organizationId.
- **AC14 DONE:** `getAttorneys()` accepts and filters by organizationId.
- **AC16 DONE:** Workflow engine filters by organizationId (fixed in S01 CR).
- **AC17 DONE:** `sendMessage()` in messaging actions uses `getTenantContext()` and includes organizationId.
- **AC18 DONE:** `submitIntake()` resolves orgId from slug parameter, inserts with organizationId.

### GAPS TO FIX (remaining ~5%)

| # | Gap | Severity | File | Fix |
|---|-----|----------|------|-----|
| G1 | `/api/branches` route returns all branches without org filter | HIGH | `src/app/api/branches/route.ts` | Add organizationId filter from session |
| G2 | `/api/calendar/ical` route queries events/deadlines without org filter | MEDIUM | `src/app/api/calendar/ical/[userId]/route.ts` | Add organizationId filter for defense-in-depth |
| G3 | Intake rate limit not org-scoped | LOW | `src/lib/actions/intake.ts` | Rate limit key should be `intake:{orgId}:{ip}` not just `intake:{ip}` |

## Tasks / Subtasks

### Task 1: Fix API Branches Route (AC: #15)

- [x] T1.1: Add session org check and filter branches by `organizationId` in `/api/branches/route.ts`

### Task 2: Fix iCal Route Org Scoping (AC: #1)

- [x] T2.1: Add `organizationId` filter to calendar events and deadlines queries in iCal route

### Task 3: Fix Intake Rate Limiting (AC: #18)

- [x] T3.1: Include orgId in rate limit key for intake submissions (`intake:{orgId}:{ip}`)

## Dev Notes

### Architecture Observations

The existing implementation is remarkably thorough:
- ALL 27 query files consistently accept organizationId as first parameter
- ALL 24 action files consistently use getTenantContext()
- Number generation is per-org
- Search is org-scoped
- Workflow engine is org-scoped (S01 fixes)
- Courts and courtStations remain correctly global

### Out of Scope

- **AC11 (cross-tenant tests):** Deferred — testing infrastructure not yet in place
- **File upload org-scoping:** Addressed in S04 (File Storage Tenant Isolation)

### Key Files to Modify

| File | Fix |
|------|-----|
| `src/app/api/branches/route.ts` | Add org filter |
| `src/app/api/calendar/ical/[userId]/route.ts` | Add org filter |
| `src/lib/actions/intake.ts` | Fix rate limit key |

### References

- [Source: _bmad-output/planning-artifacts/saas-conversion-epic.md#STORY 3]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

- ~95% implementation verified through exhaustive grep of all query and action files
- Only 3 gaps found — 2 API routes and 1 rate limit key
- All 27 query files verified org-scoped
- All 24 action files verified using getTenantContext

### Code Review Results

Adversarial code review conducted. All 3 gaps fixed correctly:
- G1: `/api/branches` route now filters by session organizationId — VERIFIED
- G2: `/api/calendar/ical` route now filters events and deadlines by organizationId — VERIFIED
- G3: Intake rate limit key now includes orgId (`intake:{orgId}:{ip}`) — VERIFIED

Additional adversarial checks performed:
- All 27 query files accept organizationId as first parameter — CONFIRMED
- All 23+ action files use getTenantContext()/requireOrg() — CONFIRMED
- All INSERT operations include organizationId — CONFIRMED
- Upload routes (S04 scope) correctly excluded from S03 — CONFIRMED
- Courts reference data (courts, courtStations) correctly remain global — CONFIRMED
- No new findings. Code review PASSED.

### File List

Files MODIFIED:
- `src/app/api/branches/route.ts` - Added org filter
- `src/app/api/calendar/ical/[userId]/route.ts` - Added org filter
- `src/lib/actions/intake.ts` - Fixed rate limit key
