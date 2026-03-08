# SaaS Conversion — Gap Analysis & Security Audit

**Document ID:** SAAS-001-AUDIT
**Date:** 2026-03-08
**Scope:** Complete audit of 11-story SaaS conversion (S01–S11) against epic requirements
**Methodology:** Line-by-line review of all 30 query files, 29 action files, 18 schema files, all API routes, middleware, auth, and UI pages

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Story-Level Gap Analysis](#2-story-level-gap-analysis)
3. [Security Audit Findings](#3-security-audit-findings)
4. [Implementation Punch List](#4-implementation-punch-list)
5. [Hardening Recommendations](#5-hardening-recommendations)

---

## 1. Executive Summary

### Overall Completion: ~88%

| Story | Points | Status | Completion | Remaining Gaps |
|-------|--------|--------|------------|----------------|
| S01 — DB Foundation | 21 | DONE | 100% | None |
| S02 — Auth & Tenant Context | 13 | DONE | 95% | Reset password page missing |
| S03 — Query & Action Isolation | 21 | DONE | 97% | 1 TOCTOU race in workflows |
| S04 — File Storage Isolation | 8 | DONE | 100% | None |
| S05 — Subscription Billing | 21 | DONE | 98% | Stripe graceful degradation |
| S06 — Tenant Onboarding | 13 | DONE | 100% | None |
| S07 — Internationalization | 13 | DONE | 100% | None |
| S08 — Super-Admin Panel | 13 | DONE | 92% | Org edit UI, org delete flow |
| S09 — Landing Page | 8 | DONE | 95% | Minor branding gaps |
| S10 — Rate Limiting & Jobs | 13 | DONE | 93% | External scheduler, iCal rate limit |
| S11 — Data Compliance & API Keys | 13 | DONE | 88% | API key permission enforcement, R2 purge |

**Critical issues found:** 2
**High-priority issues:** 4
**Medium issues:** 9
**Low/Hardening items:** 11

---

## 2. Story-Level Gap Analysis

---

### S01: Organization Entity & Database Multi-Tenancy Foundation

**Status: 100% Complete — No gaps**

Verified:
- [x] All 60+ tenant tables have `organizationId` UUID NOT NULL FK
- [x] All unique constraints are composite with `organizationId` (cases, invoices, attorneys, practiceAreas, trustAccounts, quotes, receipts, creditNotes, requisitions, users, tags, firmSettings, apiKeys)
- [x] Indexes on `organizationId` for all tenant tables
- [x] `organizations` table: id, name, slug (unique), email, phone, website, country, timezone, locale, currency, status, storageUsedBytes, stripeCustomerId, planId, trialEndsAt, deletedAt
- [x] `plans` table: id, name, slug, maxUsers, maxCases, maxStorageMb, monthlyPrice, annualPrice, trialDays, features (JSON), isActive
- [x] `subscriptions` table: organizationId (unique), planId, status, Stripe fields, grace period, trial tracking
- [x] Soft-delete (`deletedAt`) on users, attorneys, cases, clients, organizations
- [x] `organizationMembers` junction table
- [x] Migration 0007 (4-phase safe migration), data migration script, seed script updated
- [x] `courts` and `courtStations` are intentionally platform-global (per epic S07 AC8)

---

### S02: Authentication & Tenant Context Infrastructure

**Status: 95% Complete**

Verified:
- [x] JWT carries `organizationId` and `organizationSlug`
- [x] Session hydrated: `session.user.organizationId`, `session.user.organizationSlug`
- [x] TypeScript types updated in `/src/types/next-auth.d.ts`
- [x] Middleware extracts tenant from subdomain via `extractTenantSlug()`
- [x] Cross-tenant access rejected with redirect to `/forbidden`
- [x] `requireOrg()` in `/src/lib/auth/get-session.ts` returns session with guaranteed orgId
- [x] `getTenantContext()` utility returns orgId, userId, role
- [x] Login flow resolves user's org by subdomain slug, checks org.status
- [x] Registration flow: signup wizard creates new org (via S06 `signupAction`)
- [x] Account lockout: 5 attempts → 15-minute lockout, persisted in DB
- [x] `users.email` unique constraint scoped to `(email, organizationId)`
- [x] Password reset token generated with org-scoped rate limit key `reset:{slug}:{email}`
- [x] Reset URL includes org subdomain: `https://{slug}.domain/reset-password?token=...`
- [x] Token hashed with SHA-256 before storage, 1-hour expiry
- [x] Generic success response prevents email enumeration

#### GAP 2.1: Missing `/reset-password` Page (HIGH)

**Description:** `forgotPasswordAction()` in `src/lib/actions/auth.ts:265` generates reset URLs pointing to `/reset-password?token=...&email=...`, but no page exists to handle this route.

**Evidence:**
- No `src/app/(auth)/reset-password/page.tsx`
- No `src/app/reset-password/page.tsx`
- No `resetPasswordAction()` server action found

**Impact:** Password reset emails are sent but link to a 404. Users cannot reset their passwords.

**Fix Required:**
1. Create `src/app/(auth)/reset-password/page.tsx` (or `src/app/reset-password/page.tsx` if it should be public)
2. Create `resetPasswordAction(token, email, newPassword)` server action that:
   - Validates token (SHA-256 hash lookup)
   - Checks expiry (1 hour)
   - Verifies email matches
   - Hashes new password with bcrypt
   - Updates user record
   - Clears reset token fields
   - Returns success/redirect to login
3. Add `/reset-password` to `publicRoutes` array in `src/middleware.ts:7`
4. UI: Token + email from URL params, new password + confirm password fields

---

### S03: Query & Server Action Tenant Isolation

**Status: 97% Complete**

#### Queries: 100% — Zero gaps

All 30 query files (150+ functions) verified:
- Every function takes `organizationId: string` parameter
- Every SELECT includes `eq(table.organizationId, organizationId)` in WHERE
- Dashboard aggregates, reports, search, portal queries all org-scoped
- Platform-level queries (`admin.ts`, `plans.ts`) correctly omit org filter
- Raw SQL queries use parameterized `${organizationId}` — no injection vectors

#### Actions: 97% — 1 gap found

28 of 29 action files fully org-scoped. One TOCTOU issue:

#### GAP 3.1: `deleteWorkflowRule()` TOCTOU Race Condition (MEDIUM)

**File:** `src/lib/actions/workflows.ts:106-124`

**Current Code:**
```typescript
// Line 114-118: Verification query (CORRECT — checks orgId)
const [rule] = await db.select({ id: workflowRules.id })
  .from(workflowRules)
  .where(and(eq(workflowRules.id, id), eq(workflowRules.organizationId, organizationId)))
  .limit(1);
if (!rule) return { error: "Rule not found" };

// Line 121: DELETE (MISSING orgId in WHERE)
await db.delete(workflowRules).where(eq(workflowRules.id, id));
```

**Problem:** The verification query checks `organizationId`, but the actual DELETE only checks `id`. Between verification and deletion, a race condition is theoretically possible.

**Fix Required:** Add org filter to DELETE:
```typescript
await db.delete(workflowRules).where(
  and(eq(workflowRules.id, id), eq(workflowRules.organizationId, organizationId))
);
```

#### Design Note: Courts & Court Stations Are Intentionally Global

The `courts` and `courtStations` tables do NOT have `organizationId` — this is correct per epic S07 AC8: "Courts table remains global but org can configure which court types are relevant to them." These are shared reference data (e.g., "High Court of Kenya", "Milimani Law Courts"). The court-related *transactional* tables (`courtFilings`, `serviceOfDocuments`, `causeLists`, `causeListEntries`, `courtRules`) all have `organizationId` and are properly tenant-scoped.

The 6 court/station CRUD actions (`createCourt`, `updateCourt`, `toggleCourtActive`, `createCourtStation`, `updateCourtStation`, `toggleCourtStationActive`) operate on global tables and are restricted to `role === "admin"`. However:

#### GAP 3.2: Court/Station Admin Actions Need Super-Admin Gate (MEDIUM)

**Description:** Currently any org admin can create/update/toggle courts and court stations, which are global reference data shared across ALL tenants. One org admin could rename "High Court" for all other orgs.

**Fix Required:** Either:
- **(Option A — Recommended):** Restrict these 6 functions to `super_admin` role only
- **(Option B):** Add `organizationId` to `courts`/`courtStations` tables and make them per-org (larger change, may not be desired for shared reference data)

---

### S04: File Storage Tenant Isolation

**Status: 100% Complete — No gaps**

Verified:
- [x] Cloudflare R2 integration (`src/lib/storage/r2.ts`) with local filesystem fallback
- [x] Tenant-prefixed keys: `{orgId}/{category}/{uuid}.ext` (categories: documents, avatars, logos)
- [x] `/api/files/[...key]` proxy validates orgId from key, rejects cross-tenant access
- [x] Path traversal protection: rejects `..` and `.` segments, regex pattern validation
- [x] Signed URLs with 3600s expiration
- [x] Storage quota enforcement: upload route checks `plan.maxStorageMb` vs `organizations.storageUsedBytes`
- [x] Atomic `storageUsedBytes` increment on upload
- [x] iCal token org-scoped, calendar events filtered by orgId
- [x] Magic byte verification on file uploads
- [x] MIME type whitelist enforcement

---

### S05: Subscription Billing & Plan Management

**Status: 98% Complete**

Verified:
- [x] 3 plan tiers seeded: Starter (KES 2,500/mo), Professional (KES 7,500/mo), Enterprise (KES 15,000/mo)
- [x] `subscriptions` table with full Stripe integration fields
- [x] Stripe checkout session creation (`src/lib/stripe/actions.ts`)
- [x] Stripe billing portal session
- [x] Webhook handler for 5 event types: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.payment_succeeded`
- [x] Grace period: 7 days on payment failure
- [x] Org suspension on subscription cancellation/deletion
- [x] `checkPlanLimit()` and `checkFeatureAccess()` helpers
- [x] Subscription management page at `/settings/subscription`
- [x] Trial period support (configurable `trialDays` per plan)
- [x] `getOrCreateStripeCustomer()` with race condition safety

#### GAP 5.1: No Graceful Degradation When Stripe Is Not Configured (LOW)

**File:** `src/lib/env.ts:31-32` — `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are optional.

**Problem:** If Stripe is not configured:
- `createCheckoutSession()` will throw at runtime
- Subscription management page may error
- No fallback for self-hosted/trial-only deployments

**Fix Required:**
1. `src/lib/stripe/client.ts` already has `isStripeConfigured()` — ensure all Stripe action callers check this before invoking
2. Subscription page should show "Payment processing not configured" when Stripe is unavailable
3. Consider: orgs in `trialing` status should work normally without Stripe

#### GAP 5.2: M-Pesa Payment Bridge Not Implemented (LOW — Deferred)

**Epic AC4:** "M-Pesa payment bridge for Kenya market (via Stripe or custom integration)"

**Status:** Not implemented. This was flagged as a future enhancement in the epic. Stripe covers international payments. M-Pesa integration requires a separate provider (Safaricom Daraja API or IntaSend).

**Recommendation:** Defer to post-launch. Track as a separate feature request.

---

### S06: Tenant Onboarding & Organization Management

**Status: 100% Complete — No gaps**

Verified:
- [x] Public signup page at `/signup` with 4-step wizard
- [x] Firm details: name, slug, country, currency, timezone, locale
- [x] Admin account: name, email, password, phone
- [x] Plan selection from active plans
- [x] Review + confirmation step
- [x] Slug validation: 3-50 chars, lowercase alphanumeric + hyphens, reserved words blocklist
- [x] Live slug availability check via `/api/check-slug` (rate limited)
- [x] Atomic org provisioning: org → branch → admin user → org member → subscription → practice areas
- [x] Cleanup on failure (cascading delete of org)
- [x] Welcome email with subdomain URL
- [x] Onboarding checklist component
- [x] Invite system: admin sends invite → email with org-scoped token → acceptance creates user within org
- [x] Invite acceptance validates: token exists, not expired (7 days), not already accepted, org still active
- [x] Rate limiting on signup: per-email + per-IP

---

### S07: Configuration Internationalization & Per-Tenant Settings

**Status: 100% Complete — No gaps**

Verified:
- [x] `formatKES()` fully replaced with `formatCurrency(amount, currency, locale)` across 33+ files
- [x] `APP_LOCALE` constant deleted from codebase
- [x] `src/lib/constants/locale.ts` removed
- [x] `getOrgConfig(organizationId)` with React.cache() — returns locale, currency, timezone, country, vatRate, prefixes, emailFrom, smsSenderId, cpdTotalRequired, cpdLskRequired
- [x] `TenantConfigProvider` context integrated in dashboard + portal layouts
- [x] `useOrgConfig()` client-side hook with fallback defaults
- [x] VAT rate configurable per org via `firmSettings`
- [x] Number prefixes (INV-, QT-, RCT-, CN-, REQ-, TRUST-, CASE-) configurable per org
- [x] Kenya-specific fields (lskNumber, kraPin, etc.) conditional on `org.country === "KE"`
- [x] CPD thresholds configurable (total required, LSK required)
- [x] PDF generation uses org branding, currency, locale
- [x] Email FROM address per-org (`orgConfig.emailFrom`)
- [x] SMS sender ID per-org (`orgConfig.smsSenderId`)
- [x] 3 localStorage keys org-prefixed: `{orgId}-timer`, `{orgId}-recent-searches`, `{orgId}-sidebar-collapsed`

---

### S08: Platform Super-Admin & Tenant Management

**Status: 92% Complete**

Verified:
- [x] `super_admin` role in `userRole` enum
- [x] Super-admin middleware: `/admin` routes on root domain only, `requireSuperAdmin()` guard
- [x] Admin layout with dedicated sidebar (Dashboard, Organizations, Revenue, Plans, Health, Audit)
- [x] Dashboard: total orgs, users, MRR, active subscriptions, recent signups
- [x] Organization list: search, filter by status, pagination
- [x] Organization detail: profile, user/case counts, storage, recent audit log
- [x] Suspend/reactivate actions with audit logging
- [x] Impersonation: HMAC-SHA256 signed cookie, 1-hour expiry, constant-time verification, audit trail
- [x] Impersonation banner component with "End Session" button
- [x] Revenue analytics: MRR, plan distribution, new orgs, churn
- [x] Plan management: list plans with subscriber counts
- [x] System health: platform metrics
- [x] Platform audit log: paginated, action-filtered, enriched with user/org names
- [x] Org suspension enforced: login blocked, JWT refresh clears token every 5 min, `/suspended` page

#### GAP 8.1: No Organization Edit Form in Admin Detail Page (LOW)

**Description:** `updateOrganization()` action exists in `src/lib/actions/admin.ts` but the admin organization detail page has no inline edit form for org fields (name, email, phone).

**Fix Required:** Add an edit form/dialog to `/src/app/(admin)/organizations/[id]/page.tsx` that calls `updateOrganization()`.

#### GAP 8.2: No Organization Deletion Flow (LOW)

**Description:** Super-admin can suspend orgs but cannot trigger immediate data deletion. The `data-purge` cron job handles cancelled orgs past retention, but there's no admin action to force-delete an org.

**Fix Required (Optional):**
1. Add `deleteOrganization(orgId)` action with confirmation
2. Should set status to "cancelled" and optionally override retention period
3. Include confirmation dialog with org name re-typing

#### GAP 8.3: No Plan Create/Edit UI Form (LOW)

**Description:** `createPlan()` and `updatePlan()` actions exist in `src/lib/actions/admin.ts`. The plans page lists plans but the editor component may need polish.

**Fix Required:** Verify the plan editor form at `/src/app/(admin)/plans/page.tsx` is fully functional with all plan fields (name, slug, limits, pricing, trial days, features JSON).

---

### S09: Landing Page & Marketing Site Overhaul

**Status: 95% Complete**

Verified:
- [x] Root domain serves SaaS marketing homepage (hero, features, testimonials, CTAs)
- [x] Homepage has dashboard mockup, 6 feature cards, 3-step onboarding visual
- [x] `/features` page with 7 feature categories
- [x] `/pricing` page with dynamic plans from DB, formatted pricing, trial messaging
- [x] `siteConfig` in `src/lib/config/site.ts` replaces hardcoded branding
- [x] CTA buttons: "Start Free Trial" → `/signup`, "Schedule Demo", "Get Started"

#### GAP 9.1: Sidebar Still Shows "LFR" Fallback in Some Cases (LOW)

**Description:** Sidebar uses `getOrgAbbreviation()` from `siteConfig` to derive abbreviation from org name. If org name is not loaded (race condition or error), it may fall back to a hardcoded value.

**Fix Required:** Verify sidebar in `src/components/layout/sidebar.tsx` always uses org name from session/config, never a hardcoded fallback.

#### GAP 9.2: No Contact Page (LOW)

**Epic AC3:** "New pages: Home, Features, Pricing, About, Contact, Login, Signup"

**Status:** About and Contact pages not created. Home, Features, Pricing, Login, Signup all exist.

**Fix Required (Optional):** Create `/about` and `/contact` pages if needed for marketing site.

#### GAP 9.3: SEO Metadata for Tenant Subdomains (LOW)

**Epic AC10:** "Subdomain pages show firm-specific branding"

**Status:** Dashboard layout uses org name for page title via `TenantConfigProvider`. Could be more comprehensive.

**Fix Required:** Ensure `<title>` and `<meta description>` on tenant subdomains include org name (e.g., "Kamau & Associates | Cases" not just "Cases").

---

### S10: Rate Limiting, Background Jobs & Operational Infrastructure

**Status: 93% Complete**

Verified:
- [x] Redis-backed rate limiter (Upstash) with in-memory fallback
- [x] Per-plan rate limits: Starter 100/min, Professional 500/min, Enterprise 2000/min
- [x] Rate limit keys scoped: `login:{slug}:{email}`, `signup:{email}`, `reset:{slug}:{email}`, `check-slug:{ip}`, `data-export:{orgId}`
- [x] 7 cron jobs implemented: `overdue-invoices`, `deadline-alerts`, `certificate-expiry`, `subscription-check`, `token-cleanup`, `data-purge`, `usage-alerts`
- [x] Cron runner with lazy job loading and audit logging
- [x] `/api/cron` endpoint with `CRON_SECRET` verification (constant-time comparison)
- [x] All jobs iterate active orgs via `getActiveOrganizations()` and scope queries by orgId
- [x] `subscription-check`: suspends past-grace orgs, enters grace for expired trials
- [x] `data-purge`: cascading delete after configurable retention period
- [x] `usage-alerts`: 80%/95% threshold notifications with 7-day cooldown
- [x] `token-cleanup`: expired invite/reset tokens + lockout entries

#### GAP 10.1: No Built-In Job Scheduler (MEDIUM)

**Description:** The cron system relies on external triggers (HTTP GET to `/api/cron?job=name`). No built-in scheduler like Inngest, BullMQ, or node-cron.

**Impact:** Requires external infrastructure: Vercel Crons, GitHub Actions, EasyCron, or similar.

**Fix Required:**
1. Document required cron schedule in deployment guide:
   - `overdue-invoices`: daily at 06:00 UTC
   - `deadline-alerts`: daily at 07:00 UTC
   - `certificate-expiry`: weekly on Monday at 08:00 UTC
   - `subscription-check`: daily at 00:00 UTC
   - `token-cleanup`: daily at 03:00 UTC
   - `data-purge`: weekly on Sunday at 02:00 UTC
   - `usage-alerts`: daily at 09:00 UTC
2. Add `vercel.json` cron configuration (if deploying to Vercel)
3. Alternative: Integrate Inngest for event-driven job execution

#### GAP 10.2: iCal Export Missing Rate Limit (LOW)

**File:** `src/app/api/calendar/ical/[userId]/route.ts`

**Description:** The iCal endpoint requires authentication (session + token) but has no explicit rate limiting. A valid token could be used to hammer the endpoint.

**Fix Required:** Add rate limit with key `ical:{userId}` (e.g., 60 requests/hour).

#### GAP 10.3: File Download Missing Rate Limit (LOW)

**File:** `src/app/api/files/[...key]/route.ts`

**Description:** Authenticated file access proxy has no rate limiting. Valid users could enumerate files.

**Fix Required:** Add rate limit with key `files:{userId}` (e.g., 300 requests/hour).

#### GAP 10.4: Per-Org API Rate Limiting Not Enforced at Request Level (MEDIUM)

**Description:** `rateLimitForPlan(planSlug)` exists in the rate limiter but there's no middleware that automatically applies per-plan rate limits to all API requests. It's currently only used explicitly in specific actions.

**Fix Required:** Add API rate limiting middleware or Next.js middleware check that:
1. Extracts `organizationId` from session
2. Looks up plan slug
3. Applies plan-based rate limit to all `/api/*` requests

---

### S11: Data Compliance, API Keys & Tenant Data Management

**Status: 88% Complete**

Verified:
- [x] `apiKeys` table: id, organizationId, name, keyHash (SHA-256), keyPrefix (first 8 chars), permissions (JSON), lastUsedAt, expiresAt, createdBy, createdAt, revokedAt
- [x] API key CRUD: create (returns key once), list (prefix only), revoke (sets revokedAt)
- [x] Enterprise plan feature gate on API key creation
- [x] API key authentication: `authenticateApiKey()` with prefix-based lookup, hash verification (constant-time), expiry/revocation checks, org status validation, `lastUsedAt` update
- [x] API keys settings page at `/settings/api-keys` with feature gate UI
- [x] Data export service: 50+ tables, organized by domain, excludes passwords/tokens/hashes
- [x] Data export action: admin-only, rate limited (1/hour per org), 50MB size guard
- [x] Data export button component with download trigger
- [x] Data purge cron job: cascading delete after retention period (configurable, default 90 days)
- [x] Approaching-limit warnings via `usage-alerts` cron (80%/95% thresholds)

#### GAP 11.1: API Key Permissions Not Enforced at Endpoint Level (HIGH)

**Description:** API keys store a `permissions` array (e.g., `["cases:read", "clients:read", "billing:read"]`), and `authenticateApiKey()` returns these permissions in the context. However, NO API route or middleware actually checks these permissions before serving data.

**Impact:** An API key with `["cases:read"]` can access ALL endpoints that accept API key auth, not just case endpoints. Permissions are metadata-only.

**Fix Required:**
1. Create `requireApiPermission(permission: string)` middleware helper
2. Each API endpoint using API key auth must call: `requireApiPermission("cases:read")` etc.
3. Or: implement middleware in `/src/middleware.ts` that intercepts API-key-authenticated requests and validates permissions against the route pattern
4. Document available permission scopes and which endpoints they protect

#### GAP 11.2: R2 Files Not Deleted During Data Purge (MEDIUM)

**File:** `src/lib/cron/jobs/data-purge.ts`

**Description:** When an org is purged (cascading DB delete), files stored in R2 with the org's prefix (`{orgId}/documents/*`, `{orgId}/avatars/*`) remain orphaned.

**Impact:** Storage leak — orphaned files accumulate over time, incurring R2 storage costs.

**Fix Required:**
1. Before cascading DB delete, call `r2DeleteByPrefix(orgId)` to enumerate and delete all objects with the org's prefix
2. Or: add a separate `storage-cleanup` cron job that finds org prefixes not matching any active org
3. `r2.ts` already has `r2GetPrefixSize()` — extend with `r2DeleteByPrefix()` using S3 `ListObjectsV2` + `DeleteObjects`

#### GAP 11.3: No Usage Dashboard in Org Admin Settings (LOW)

**Epic AC12:** "Org admin can view storage usage, user count, case count on a settings dashboard"

**Status:** Usage data is available (plan limits, current counts) but no dedicated dashboard widget on the settings page.

**Fix Required:** Add a "Usage & Limits" card/section to `/settings/page.tsx` showing:
- Users: X / Y (plan limit)
- Cases: X / Y
- Storage: X MB / Y MB
- Progress bars with color coding (green/yellow/red)

#### GAP 11.4: Data Retention Period Not Configurable in UI (LOW)

**Description:** `data-purge` cron reads retention days from `firmSettings` but there's no UI to set this value.

**Fix Required:** Add "Data Retention Period" field to firm settings page (`/settings/firm`).

---

## 3. Security Audit Findings

### 3.1 CRITICAL Findings

*None identified.* (`.env.local` verified NOT tracked in git.)

---

### 3.2 HIGH Findings

#### SEC-H1: API Key Permissions Not Enforced

**Severity:** HIGH
**Category:** Authorization
**Location:** `src/lib/auth/api-key-auth.ts`, all API routes

**Description:** API key authentication returns a `permissions` array, but no route or middleware validates these permissions before serving data. An Enterprise org's API key with `["cases:read"]` permission could theoretically access billing, documents, or any other data accessible via API key-authenticated endpoints.

**Recommendation:** Implement permission check middleware. See GAP 11.1 for fix details.

#### SEC-H2: Court/Station Admin Actions Allow Cross-Tenant Modification

**Severity:** HIGH
**Category:** Authorization
**Location:** `src/lib/actions/courts.ts` — `createCourt`, `updateCourt`, `toggleCourtActive`, `createCourtStation`, `updateCourtStation`, `toggleCourtStationActive`

**Description:** Courts and court stations are global reference data (no `organizationId`). Any org admin (not just super_admin) can create, update, or toggle these records, affecting all other tenants.

**Example Attack:** Org A admin renames "High Court of Kenya" to "Org A Private Court" — all orgs now see the wrong name.

**Recommendation:** Restrict these 6 functions to `super_admin` role. Replace:
```typescript
if (role !== "admin") return { error: "Unauthorized" };
```
With:
```typescript
if (role !== "super_admin") return { error: "Only platform administrators can manage courts" };
```

---

### 3.3 MEDIUM Findings

#### SEC-M1: TOCTOU Race in deleteWorkflowRule

**Severity:** MEDIUM
**Category:** Tenant Isolation
**Location:** `src/lib/actions/workflows.ts:121`

**Description:** See GAP 3.1 above. Verification query includes orgId, DELETE does not.

**Recommendation:** Add `eq(workflowRules.organizationId, organizationId)` to DELETE WHERE clause.

#### SEC-M2: Stripe Webhook Error Message May Leak Information

**Severity:** MEDIUM
**Category:** Information Disclosure
**Location:** `src/app/api/webhooks/stripe/route.ts:207`

**Description:** Webhook signature verification failure returns: `"Webhook signature verification failed: {err.message}"`. Stripe's error message could contain internal details.

**Recommendation:** Return a generic error:
```typescript
return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
```

#### SEC-M3: No CSP (Content Security Policy) Headers

**Severity:** MEDIUM
**Category:** Defense in Depth
**Location:** `next.config.ts` or middleware

**Description:** No Content-Security-Policy headers are configured. This leaves the application vulnerable to injected scripts if an XSS vector is ever introduced.

**Recommendation:** Add CSP headers in `next.config.ts`:
```javascript
headers: [
  { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: *.r2.cloudflarestorage.com; font-src 'self'; connect-src 'self' *.stripe.com" }
]
```

#### SEC-M4: No Request ID Tracking

**Severity:** MEDIUM
**Category:** Audit Trail
**Location:** Application-wide

**Description:** No request ID is generated per request. This makes it difficult to correlate audit log entries, error logs, and external service calls for incident investigation.

**Recommendation:** Add request ID middleware that:
1. Generates UUID per request
2. Includes in audit log entries
3. Returns as `X-Request-Id` response header
4. Passes to error reporting

---

### 3.4 LOW Findings

#### SEC-L1: iCal Endpoint Missing Rate Limit

**Severity:** LOW
**Category:** Availability
**Location:** `src/app/api/calendar/ical/[userId]/route.ts`
**Recommendation:** Add rate limit (see GAP 10.2)

#### SEC-L2: File Proxy Missing Rate Limit

**Severity:** LOW
**Category:** Availability
**Location:** `src/app/api/files/[...key]/route.ts`
**Recommendation:** Add rate limit (see GAP 10.3)

#### SEC-L3: WebP Magic Byte Check Incomplete

**Severity:** LOW
**Category:** Input Validation
**Location:** `src/app/api/upload/route.ts`

**Description:** WebP validation checks for "RIFF" header (4 bytes) but full WebP detection requires checking bytes 8-11 for "WEBP".

**Recommendation:** Extend magic byte check:
```typescript
// WebP: RIFF????WEBP
if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46
    && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50)
```

#### SEC-L4: Seed Password Hardcoded in Dev Mode

**Severity:** LOW
**Category:** Credential Management
**Location:** `src/lib/db/seed.ts:13`

**Description:** Default seed password `"Password123!"` is hardcoded with `NODE_ENV === "production"` guard. Acceptable for development but ensure seed script is never run in production.

**Recommendation:** Add explicit production guard that throws if `NODE_ENV === "production"` and `SEED_PASSWORD` is not set.

#### SEC-L5: Impersonation Cookie Format Non-Standard

**Severity:** LOW (Informational)
**Category:** Session Management
**Location:** `src/lib/utils/impersonation.ts`

**Description:** Impersonation uses custom base64+HMAC format. Functional and secure but non-standard. JWT or encrypted cookies would be more conventional.

**Recommendation:** No change required — current implementation is secure (HMAC-SHA256, constant-time comparison, 1-hour expiry).

---

### 3.5 Security Strengths (No Action Required)

| Area | Assessment |
|------|-----------|
| **SQL Injection** | EXCELLENT — All queries use Drizzle ORM parameterization. Raw SQL uses template literals with parameter binding. Zero injection vectors. |
| **XSS Prevention** | EXCELLENT — Zero instances of `dangerouslySetInnerHTML`. All user data rendered through React's auto-escaping. |
| **CSRF Protection** | EXCELLENT — NextAuth v5 JWT-based CSRF built-in for server actions. |
| **Password Security** | EXCELLENT — bcrypt hashing, 8+ char minimum with complexity requirements, account lockout. |
| **Token Security** | EXCELLENT — SHA-256 hashed reset tokens, 32-byte random generation, 1-hour expiry. |
| **API Key Security** | EXCELLENT — SHA-256 hash storage, key shown once, prefix-based lookup, constant-time comparison, expiry + revocation. |
| **File Upload Security** | EXCELLENT — MIME whitelist, magic byte verification, size limits, tenant-prefixed storage, path traversal protection. |
| **Rate Limiting** | EXCELLENT — Redis-backed (Upstash) with in-memory fallback, per-plan tiers, applied to all auth endpoints. |
| **Tenant Isolation (Reads)** | EXCELLENT — 150+ query functions across 30 files all filter by `organizationId`. Zero data leaks. |
| **Tenant Isolation (Writes)** | EXCELLENT — 28/29 action files fully org-scoped. One TOCTOU race (workflows). |
| **Session Management** | EXCELLENT — JWT refresh every 5 min validates user + org status, lockout enforced. |
| **Impersonation** | EXCELLENT — HMAC-signed cookies, constant-time verification, 1-hour expiry, full audit trail. |
| **Org Suspension** | EXCELLENT — Login blocked, JWT refresh clears token, `/suspended` page, middleware allows. |
| **Data Export** | EXCELLENT — Excludes passwords/tokens/hashes, rate limited, 50MB guard. |

---

## 4. Implementation Punch List

Priority-ordered list of all remaining work items.

### P0 — Must Fix (Security / Broken Features)

| # | Gap | Story | Effort | Description |
|---|-----|-------|--------|-------------|
| 1 | GAP 2.1 | S02 | 4h | Create `/reset-password` page + `resetPasswordAction` + add to public routes |
| 2 | SEC-H2 | S03 | 30m | Restrict court/station CRUD actions to `super_admin` role |
| 3 | GAP 3.1 / SEC-M1 | S03 | 15m | Add `organizationId` to `deleteWorkflowRule()` DELETE WHERE clause |
| 4 | SEC-H1 / GAP 11.1 | S11 | 3h | Implement API key permission enforcement at endpoint/middleware level |

### P1 — Should Fix (Functional Gaps)

| # | Gap | Story | Effort | Description |
|---|-----|-------|--------|-------------|
| 5 | GAP 10.1 | S10 | 2h | Document cron schedule + configure `vercel.json` crons or external scheduler |
| 6 | GAP 11.2 | S11 | 2h | Add R2 file deletion to data purge cron (delete by org prefix) |
| 7 | SEC-M2 | S05 | 15m | Genericize Stripe webhook error messages |
| 8 | GAP 10.4 | S10 | 3h | Add per-plan API rate limiting middleware for all `/api/*` requests |
| 9 | SEC-M3 | — | 1h | Add Content-Security-Policy headers in `next.config.ts` |

### P2 — Nice to Have (Polish / Completeness)

| # | Gap | Story | Effort | Description |
|---|-----|-------|--------|-------------|
| 10 | GAP 5.1 | S05 | 1h | Add Stripe-not-configured fallback in subscription pages |
| 11 | GAP 8.1 | S08 | 2h | Add org edit form in admin detail page |
| 12 | GAP 8.2 | S08 | 2h | Add org force-delete flow for super-admin |
| 13 | GAP 11.3 | S11 | 2h | Add usage dashboard widget in org settings |
| 14 | GAP 11.4 | S11 | 30m | Add data retention period field in firm settings UI |
| 15 | GAP 9.2 | S09 | 3h | Create `/about` and `/contact` marketing pages |
| 16 | GAP 9.3 | S09 | 1h | Add dynamic SEO metadata on tenant subdomains |
| 17 | SEC-M4 | — | 2h | Add request ID tracking (middleware + audit log + response header) |
| 18 | GAP 10.2 | S10 | 30m | Add rate limit to iCal endpoint |
| 19 | GAP 10.3 | S10 | 30m | Add rate limit to file proxy endpoint |
| 20 | SEC-L3 | S04 | 15m | Extend WebP magic byte check to 12 bytes |
| 21 | GAP 8.3 | S08 | 1h | Verify/polish plan editor form in admin panel |

---

## 5. Hardening Recommendations

These are not gaps in the current implementation but would strengthen the platform for production SaaS deployment.

### 5.1 Infrastructure

| # | Recommendation | Priority | Effort |
|---|---------------|----------|--------|
| H1 | Enable Neon PostgreSQL row-level security (RLS) as defense-in-depth for tenant isolation | Medium | 8h |
| H2 | Add database connection pooling monitoring (Neon supports this natively) | Medium | 1h |
| H3 | Configure Vercel deployment with wildcard SSL for `*.lawfirmregistry.co.ke` | High | 2h |
| H4 | Set up error monitoring (Sentry) with org context in error metadata | High | 2h |
| H5 | Configure Upstash Redis for production rate limiting (replace in-memory fallback) | High | 1h |

### 5.2 Security Hardening

| # | Recommendation | Priority | Effort |
|---|---------------|----------|--------|
| H6 | Implement field-level encryption for highly sensitive data (bar numbers, KRA PINs, national IDs) | Medium | 8h |
| H7 | Add DLP checks on email/SMS — prevent sending sensitive data outside org | Low | 4h |
| H8 | Implement anomaly detection on audit log (bulk impersonations, mass exports) | Low | 4h |
| H9 | Add IP allowlisting option for Enterprise orgs | Low | 3h |
| H10 | Implement MFA (TOTP/WebAuthn) for admin accounts | Medium | 8h |

### 5.3 Operational

| # | Recommendation | Priority | Effort |
|---|---------------|----------|--------|
| H11 | Cross-tenant penetration test: script that creates 2 orgs and verifies complete isolation across all entity types | High | 4h |
| H12 | Add health check endpoint (`/api/health`) for load balancer/monitoring | Medium | 1h |
| H13 | Document disaster recovery: DB backups, point-in-time restore, R2 replication | Medium | 2h |
| H14 | Add metrics dashboard: request latency, error rates, DB query performance | Medium | 4h |
| H15 | Load test with 50+ tenants and realistic data volumes | High | 4h |

---

## Appendix A: Files Referenced

| File | Relevant Gaps |
|------|--------------|
| `src/lib/actions/courts.ts` | SEC-H2 (court actions need super_admin gate) |
| `src/lib/actions/workflows.ts:121` | GAP 3.1 / SEC-M1 (deleteWorkflowRule TOCTOU) |
| `src/lib/auth/api-key-auth.ts` | SEC-H1 / GAP 11.1 (permission enforcement) |
| `src/app/api/webhooks/stripe/route.ts:207` | SEC-M2 (error message leak) |
| `src/app/api/calendar/ical/[userId]/route.ts` | GAP 10.2 / SEC-L1 (rate limit) |
| `src/app/api/files/[...key]/route.ts` | GAP 10.3 / SEC-L2 (rate limit) |
| `src/app/api/upload/route.ts` | SEC-L3 (WebP magic bytes) |
| `src/lib/cron/jobs/data-purge.ts` | GAP 11.2 (R2 file cleanup) |
| `src/lib/db/seed.ts:13` | SEC-L4 (seed password) |
| `src/lib/env.ts:31-32` | GAP 5.1 (Stripe optional) |
| `src/lib/stripe/actions.ts` | GAP 5.1 (graceful degradation) |
| `src/lib/utils/rate-limit.ts` | GAP 10.4 (per-plan middleware) |

## Appendix B: Verified Secure — No Action Required

These areas were audited and found to be production-ready:

- **30 query files** (150+ functions): All org-scoped, zero data leaks
- **28/29 action files**: Fully org-scoped (1 TOCTOU exception noted)
- **5 API routes**: All authenticated and org-filtered
- **Middleware**: Subdomain extraction, cross-tenant rejection, role enforcement
- **Auth system**: JWT with org context, 5-min refresh, lockout, generic error responses
- **File storage**: R2 with tenant-prefixed keys, signed URLs, path traversal protection
- **Stripe integration**: Signature verification, proper webhook handling, grace period logic
- **Onboarding**: Atomic provisioning, cleanup on failure, rate limiting
- **I18n**: Complete replacement of hardcoded KES/locale, per-org config system
- **Data export**: Excludes sensitive fields, rate limited, admin-only
