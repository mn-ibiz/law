# Story: SAAS-S11 — Data Compliance, API Keys & Tenant Data Management

**Story ID:** SAAS-001-S11
**Points:** 13 (L)
**Priority:** P2
**Depends On:** S01 (Organization Entity), S02 (Authentication), S03 (Query Isolation), S05 (Subscription Billing)
**Status:** Ready for Dev

---

## User Story

**As a** law firm administrator,
**I want** to export all my firm's data, manage API keys, and have confidence my data can be deleted if I leave the platform,
**So that** I maintain control over my data and meet regulatory compliance requirements.

---

## Current State Assessment

### Implementation: ~10%

Usage tracking infrastructure exists: `storageUsedBytes` on organizations, `getOrgUsage()` query, `checkPlanLimit()` and `checkFeatureAccess()` utilities, and a subscription settings page showing usage metrics. A data management settings page exists (`/settings/data`) but only shows placeholder import/export/backup cards with no functionality.

No data export service, no data deletion job, no API keys table, no API key auth middleware, no approaching-limit warnings.

### Gaps Identified

| Gap | Location | Description |
|-----|----------|-------------|
| G1 | No data export service | No code to query all org tables and produce a downloadable archive |
| G2 | `/settings/data` is placeholder | Has cards but no functional export or backup actions |
| G3 | No data deletion job | No mechanism to purge org data after retention period |
| G4 | No `apiKeys` table | Schema does not exist |
| G5 | No API key CRUD | No actions for creating, listing, or revoking API keys |
| G6 | No API key auth middleware | No way to authenticate via API key header |
| G7 | No API key rate limiting | API key requests not separately rate limited |
| G8 | No approaching-limit warnings | Users/cases/storage hitting 80%/95% not detected or notified |
| G9 | No data retention config | No per-org retention period setting |
| G10 | `api_access` feature flag exists | `PlanFeatures.api_access` defined in plan-limits.ts but not enforced anywhere |

---

## Tasks

### T1: Create `apiKeys` table schema

**Files:** `src/lib/db/schema/organizations.ts` (ADD), `src/lib/db/schema/index.ts` (VERIFY)

Add `apiKeys` table to organizations schema:
- `id` (uuid PK)
- `organizationId` (uuid FK to organizations, cascade delete)
- `name` (text, user-provided label)
- `keyHash` (text, SHA-256 hash of the full key)
- `keyPrefix` (text, first 8 chars of the key for display/identification)
- `permissions` (text, JSON string of allowed scopes — e.g., `["read:cases", "read:clients"]`)
- `lastUsedAt` (timestamp, nullable)
- `expiresAt` (timestamp, nullable — null means never expires)
- `createdBy` (uuid FK to users)
- `revokedAt` (timestamp, nullable — non-null means revoked)
- `createdAt` (timestamp, default now)

Index: `apiKeys.organizationId`, unique `apiKeys.keyPrefix` within org.

### T2: Build API key CRUD actions

**Files:** `src/lib/actions/api-keys.ts` (NEW)

Server actions:
- `createApiKey(data)` — generates a random API key (`lfr_` + 48 random bytes hex), hashes it (SHA-256), stores hash + prefix, returns the full key ONCE. Feature-gated to Enterprise plan via `checkFeatureAccess("api_access")`.
- `listApiKeys()` — returns all keys for the org (prefix, name, permissions, lastUsedAt, expiresAt, revokedAt, createdAt). Never returns the key itself.
- `revokeApiKey(id)` — sets `revokedAt = now()`. Cannot be undone.
- All actions require admin role via `requireRole("admin")`.

### T3: Build API key settings page

**Files:** `src/app/(dashboard)/settings/api-keys/page.tsx` (NEW), `src/components/settings/api-key-form.tsx` (NEW)

Settings page for API key management:
- List of API keys with name, prefix (`lfr_abc12345...`), permissions, last used, status (active/expired/revoked), created date
- "Create New Key" button opens dialog with name + permissions (multi-select from available scopes) + optional expiry date
- On creation, shows the key ONCE in a copy-to-clipboard dialog with a warning it won't be shown again
- "Revoke" button per key with confirmation dialog
- Feature gate: show "Upgrade to Enterprise" message if plan doesn't include `api_access`

### T4: Build API key authentication middleware

**Files:** `src/lib/auth/api-key-auth.ts` (NEW), `src/middleware.ts` (MODIFY)

API key authentication for programmatic access:
- Reads `Authorization: Bearer lfr_...` header (API key always prefixed with `lfr_`)
- Extracts prefix (first 8 chars after `lfr_`), queries `apiKeys` where `keyPrefix` matches and `revokedAt IS NULL`
- Verifies full key by hashing and comparing to `keyHash` (constant-time with `timingSafeEqual`)
- Checks `expiresAt` if set
- Updates `lastUsedAt` (fire-and-forget, non-blocking)
- Returns `{ organizationId, permissions }` on success
- Rate limited separately via `rateLimitForPlan(planSlug)` with key-specific prefix
- Helper: `authenticateApiKey(request)` returns org context or null

Middleware integration:
- For `/api/*` routes (excluding auth, cron, webhooks), check for API key in Authorization header
- If API key present, validate and attach org context — bypass session auth
- If no API key and no session, return 401

### T5: Build data export service

**Files:** `src/lib/services/data-export.ts` (NEW)

Data export service that generates a complete archive of all org data:
- `exportOrgData(organizationId)` — queries every tenant-scoped table:
  - users, attorneys, clients, cases, case_assignments, case_parties
  - invoices, invoice_line_items, payments, quotes, quote_line_items
  - time_entries, expenses
  - documents (metadata only — files referenced by URL/key)
  - calendar_events, event_attendees, deadlines, tasks, bring_ups
  - messages, notifications
  - trust_accounts, trust_transactions
  - petty_cash_transactions, reconciliations
  - firm_settings, practice_areas, branches
  - audit_log
- Returns a JSON structure organized by table name
- Each table's data is a JSON array of rows
- Sensitive fields (passwords, tokens) are excluded
- Document file URLs are included for reference but files are NOT embedded (too large for JSON export)

### T6: Build data export UI

**Files:** `src/app/(dashboard)/settings/data/page.tsx` (MODIFY), `src/lib/actions/data-export.ts` (NEW)

Functional data export from settings page:
- "Export All Data" button triggers server action that generates the JSON archive
- Returns a downloadable JSON file (Content-Disposition: attachment)
- Or: uses an API route `/api/export` that streams the JSON
- Show "Preparing export..." state while generating
- Audit log entry on export: `data_export` action
- Rate limited: 1 export per org per hour

### T7: Build data deletion service

**Files:** `src/lib/cron/jobs/data-purge.ts` (NEW), `src/lib/cron/runner.ts` (MODIFY), `vercel.json` (MODIFY)

Background job for permanent data deletion:
- Queries orgs with `status = "cancelled"` and `deletedAt` set
- For each cancelled org, check retention period (default 90 days from `deletedAt`)
- If past retention period:
  - Delete all org data via cascading delete (`DELETE FROM organizations WHERE id = ?` — cascade handles all FK tables)
  - Log to platform audit log
- Retention period configurable per-org via `firmSettings` key `data.retentionDays` (default: 90)
- Add to cron runner registry and vercel.json schedule (weekly)

### T8: Build approaching-limit warning notifications

**Files:** `src/lib/cron/jobs/usage-alerts.ts` (NEW), `src/lib/cron/runner.ts` (MODIFY), `vercel.json` (MODIFY)

Background job for usage limit warnings:
- For each active org, check users/cases/storage against plan limits
- At 80% threshold: create "warning" notification for org admins
- At 95% threshold: create "system" notification for org admins
- Dedup: use `linkUrl = /settings/subscription#usage-{metric}` to avoid duplicate notifications within 7 days
- Add to cron runner and vercel.json (daily at 8 AM UTC)

---

## Acceptance Criteria

- [ ] **AC1:** `apiKeys` table exists with proper schema and indexes
- [ ] **AC2:** API key CRUD works: create shows key once, list shows prefix only, revoke sets revokedAt
- [ ] **AC3:** API key feature gated to Enterprise plan via `checkFeatureAccess("api_access")`
- [ ] **AC4:** API key authentication middleware validates keys with constant-time comparison
- [ ] **AC5:** API key rate limiting separate from user session rate limiting
- [ ] **AC6:** Data export generates complete JSON archive of all org data (excluding passwords/tokens)
- [ ] **AC7:** Data export accessible from settings page with download link
- [ ] **AC8:** Data deletion job purges cancelled orgs past retention period via cascading delete
- [ ] **AC9:** Data retention period configurable per-org (default 90 days)
- [ ] **AC10:** Approaching-limit warnings at 80% and 95% thresholds for users/cases/storage
- [ ] **AC11:** All operations audit-logged with org context
- [ ] **AC12:** Org admin can view usage stats on settings page (already exists via subscription page)

---

## Technical Design Notes

### API Key Format

```
lfr_<48 random hex bytes>
```

Prefix `lfr_` identifies it as a Law Firm Registry key. Total length: 4 + 96 = 100 chars. The first 8 hex chars after `lfr_` are the `keyPrefix` for identification without exposing the full key.

### API Key Authentication Flow

```
Request: Authorization: Bearer lfr_abc12345...
  ├─ Extract prefix: "abc12345" (chars 4-12)
  ├─ Query: SELECT * FROM api_keys WHERE key_prefix = 'abc12345' AND revoked_at IS NULL
  ├─ Hash full key: SHA-256(lfr_abc12345...)
  ├─ timingSafeEqual(hash, stored keyHash)
  ├─ Check expiresAt
  ├─ Update lastUsedAt (fire-and-forget)
  └─ Return { organizationId, permissions }
```

### Data Export Structure

```json
{
  "exportedAt": "2026-03-09T12:00:00Z",
  "organizationId": "...",
  "organizationName": "...",
  "tables": {
    "users": [...],
    "clients": [...],
    "cases": [...],
    ...
  }
}
```

### Data Deletion Strategy

Cascading DELETE on the organizations table handles all dependent data. The organizations table is the root — all tenant tables have `ON DELETE CASCADE` on `organizationId`. This means a single `DELETE FROM organizations WHERE id = ?` cleanly purges all data.

File storage cleanup is handled separately — R2/local files must be enumerated and deleted by key prefix (`{orgId}/...`).

### Scope Boundaries

- This story does NOT build a full REST API for third-party integrations — API keys are for basic programmatic access
- This story does NOT implement fine-grained per-field permissions for API keys — permissions are coarse-grained scopes
- This story does NOT implement webhook delivery for API consumers — that's a future enhancement
- File downloads in data export are NOT included — only metadata/URLs are exported (files can be downloaded separately)
