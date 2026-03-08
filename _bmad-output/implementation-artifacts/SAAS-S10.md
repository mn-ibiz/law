# Story: SAAS-S10 — Rate Limiting, Background Jobs & Operational Infrastructure

**Story ID:** SAAS-001-S10
**Points:** 13 (L)
**Priority:** P1
**Depends On:** S01 (Organization Entity), S02 (Authentication & Tenant Context)
**Status:** Ready for Dev

---

## User Story

**As a** platform operator,
**I want** tenant-aware rate limiting and a background job system,
**So that** one tenant's activity doesn't impact others, and scheduled operations (reminders, alerts, billing) work reliably.

---

## Current State Assessment

### Implementation: ~15%

Rate limiting exists as a simple in-memory sliding-window implementation (`src/lib/utils/rate-limit.ts`). It stores state in a process-memory `Map`, which doesn't survive serverless cold starts and doesn't share across instances. Rate limit keys are already partially org-scoped (intake uses `{orgId}:{ip}`, signup uses `email` + `ip`), but login and password reset use only email (not org-scoped).

No background job infrastructure exists. No scheduled tasks, no cron endpoints, no job queue. Overdue invoice detection, deadline alerts, certificate expiry checks, subscription enforcement, and token cleanup are all absent.

### Gaps Identified

| Gap | Location | Description |
|-----|----------|-------------|
| G1 | `src/lib/utils/rate-limit.ts` | In-memory Map, not distributed, no tenant rate isolation |
| G2 | `src/lib/actions/auth.ts:33` | Login rate limit key `login:{email}` — not org-scoped |
| G3 | `src/lib/actions/auth.ts:177` | Password reset key `reset:{email}` — not org-scoped |
| G4 | No cron/job infrastructure | No API routes for scheduled tasks, no cron triggers |
| G5 | No overdue invoice alerting | Invoices can be overdue but no notification is sent |
| G6 | No deadline approaching alerts | Deadlines exist but no proactive alerting |
| G7 | No certificate expiry alerting | Practising certificates tracked but no expiry warnings |
| G8 | No subscription enforcement job | Grace period expiry not checked automatically |
| G9 | No token cleanup | Expired invite/reset tokens never purged |
| G10 | No job execution logging | No way to track what ran, when, or if it failed |

---

## Tasks

### T1: Replace in-memory rate limiter with Upstash Redis

**Files:** `src/lib/utils/rate-limit.ts` (REWRITE), `src/lib/env.ts` (ADD), `package.json` (ADD dependency)

Install `@upstash/ratelimit` and `@upstash/redis` packages. Replace the in-memory implementation with Upstash Redis-backed sliding window rate limiter.

- Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to env schema (optional — graceful fallback to in-memory for local dev)
- Create `getRedisClient()` that returns `null` if env vars not set
- Create `rateLimit(key, opts?)` that:
  - Uses Upstash `Ratelimit` with `slidingWindow` algorithm when Redis available
  - Falls back to the existing in-memory implementation when Redis not configured
  - Supports configurable `maxRequests` and `windowMs` parameters (with defaults)
- Return interface: `{ success: boolean; remaining: number; reset?: number }`

### T2: Scope all rate limit keys per-tenant

**Files:** `src/lib/actions/auth.ts`, `src/lib/actions/onboarding.ts`, `src/app/api/check-slug/route.ts`

Update rate limit keys across all call sites:
- Login: `login:{email}` → `login:{orgId}:{email}` (orgId from subdomain context, fall back to global for root domain)
- Register: `register:{email}` → keep global (registration is pre-org)
- Password reset: `reset:{email}` → `reset:{orgId}:{email}` (orgId from subdomain context)
- Signup: Keep `signup:{email}` and `signup-ip:{ip}` global (pre-org)
- Slug check: Keep `check-slug:{ip}` global (pre-org)
- Intake: Already `intake:{orgId}:{ip}` — no change needed

### T3: Add per-plan rate limit tiers

**Files:** `src/lib/utils/rate-limit.ts` (ADD), `src/lib/db/schema/organizations.ts` (VERIFY plans schema)

Add a `rateLimitForPlan()` helper that maps plan slugs to rate limit configs:
- Starter: 100 requests/minute
- Professional: 500 requests/minute
- Enterprise: 2000 requests/minute
- Default (no plan / trial): 100 requests/minute

This is used by API routes and server actions that need per-org throttling. Not all endpoints need per-plan limits — just high-frequency ones (search, API calls).

### T4: Create cron job API infrastructure

**Files:** `src/app/api/cron/route.ts` (NEW), `src/lib/cron/runner.ts` (NEW), `src/lib/cron/jobs/index.ts` (NEW)

Create a cron job runner triggered by an API endpoint:
- `GET /api/cron?job={jobName}` — executes a specific job
- Protected by `CRON_SECRET` header (Vercel-style `Authorization: Bearer {CRON_SECRET}`)
- Add `CRON_SECRET` to env schema
- Job runner:
  - Validates auth, resolves job by name, executes, logs result
  - Each job receives no arguments — they query the DB for all orgs/items to process
  - Jobs iterate over active organizations (exclude platform org, suspended, deleted)
- Job execution logged to `platformAuditLog` or a dedicated `cronJobLog` table

### T5: Build overdue invoice reminder job

**Files:** `src/lib/cron/jobs/overdue-invoices.ts` (NEW)

Job: `overdue-invoices`
- Query all orgs, for each find invoices where `status = 'sent'` and `dueDate < now()`
- Mark invoices as `overdue` status
- Create a notification for the org admin(s): "Invoice {number} for {client} is overdue"
- Optionally send email reminder to the client (based on org setting `billing.overdueReminder` in firmSettings)
- Only process invoices not already marked overdue
- Log count of processed invoices per org

### T6: Build approaching deadline alert job

**Files:** `src/lib/cron/jobs/deadline-alerts.ts` (NEW)

Job: `deadline-alerts`
- Query all orgs, for each find deadlines where:
  - `completedAt IS NULL`
  - `dueDate` is within the next 48 hours (or configurable per-org `deadline.alertLeadHours` setting)
  - No existing notification for this deadline in the last 24 hours (avoid spam)
- Create notification for the `assignedTo` user: "Deadline '{title}' is due in {hours} hours"
- Log count per org

### T7: Build certificate expiry check job

**Files:** `src/lib/cron/jobs/certificate-expiry.ts` (NEW)

Job: `certificate-expiry`
- Query all orgs, for each find practising certificates where:
  - `expiryDate` is within 60 days from now
  - No existing notification for this certificate in the last 7 days
- Create notification for org admin(s): "Attorney {name}'s practising certificate expires on {date}"
- Log count per org

### T8: Build subscription enforcement job

**Files:** `src/lib/cron/jobs/subscription-check.ts` (NEW)

Job: `subscription-check`
- Query all orgs with active subscriptions
- For orgs in grace period where `gracePeriodEnd < now()`:
  - Update org status to `suspended`
  - Create notification for org admin: "Your subscription has been suspended"
  - Log platform audit entry
- For orgs where `trialEnd < now()` and no active subscription:
  - Enter grace period (update subscription status)
  - Create notification for org admin: "Your trial has ended. Subscribe to continue."
- Log count of affected orgs

### T9: Build token cleanup job

**Files:** `src/lib/cron/jobs/token-cleanup.ts` (NEW)

Job: `token-cleanup`
- Delete expired password reset tokens: `resetTokenExpiresAt < now()`
- Delete expired invite tokens: `inviteExpiresAt < now()` (only for inactive users with no password set)
- Log count of cleaned tokens

### T10: Create vercel.json cron configuration

**Files:** `vercel.json` (NEW or UPDATE)

Configure Vercel Cron Jobs (or document manual cron setup for non-Vercel deployments):
```json
{
  "crons": [
    { "path": "/api/cron?job=overdue-invoices", "schedule": "0 6 * * *" },
    { "path": "/api/cron?job=deadline-alerts", "schedule": "0 */4 * * *" },
    { "path": "/api/cron?job=certificate-expiry", "schedule": "0 7 * * 1" },
    { "path": "/api/cron?job=subscription-check", "schedule": "0 0 * * *" },
    { "path": "/api/cron?job=token-cleanup", "schedule": "0 3 * * 0" }
  ]
}
```

Schedules:
- Overdue invoices: Daily at 6 AM UTC
- Deadline alerts: Every 4 hours
- Certificate expiry: Weekly Monday 7 AM UTC
- Subscription check: Daily at midnight UTC
- Token cleanup: Weekly Sunday 3 AM UTC

---

## Acceptance Criteria

- [ ] **AC1:** Rate limiter has Upstash Redis backend with graceful in-memory fallback for local dev
- [ ] **AC2:** All rate limit keys scoped per-tenant where appropriate (login, reset use org context from subdomain; global endpoints stay global)
- [ ] **AC3:** Per-plan rate limit tiers defined (Starter 100/min, Pro 500/min, Enterprise 2000/min)
- [ ] **AC4:** Global rate limits remain for unauthenticated endpoints (signup, contact, slug-check)
- [ ] **AC5:** Cron job API endpoint protected by CRON_SECRET, executes named jobs
- [ ] **AC6:** Overdue invoice job marks invoices as overdue and creates admin notifications
- [ ] **AC7:** Deadline alert job creates notifications for assignees when deadlines approach
- [ ] **AC8:** Certificate expiry job alerts org admins when certificates expire within 60 days
- [ ] **AC9:** Subscription check job suspends orgs past grace period, enters grace period for expired trials
- [ ] **AC10:** Token cleanup job purges expired reset and invite tokens
- [ ] **AC11:** All background jobs iterate over active organizations with tenant-scoped queries
- [ ] **AC12:** Job execution logged with org context for debugging

---

## Technical Design Notes

### Rate Limiter Architecture

```
rateLimit(key, { maxRequests?, windowMs? })
  ├─ UPSTASH_REDIS_REST_URL set?
  │   ├─ Yes → Upstash Ratelimit (slidingWindow)
  │   └─ No  → In-memory fallback (existing Map implementation)
  └─ Returns: { success, remaining, reset? }
```

The Upstash `@upstash/ratelimit` package handles the sliding window algorithm, atomic counters, and TTL automatically. For local dev without Redis, the existing in-memory implementation is preserved as fallback.

### Cron Job Architecture

```
GET /api/cron?job=overdue-invoices
  ├─ Verify Authorization: Bearer {CRON_SECRET}
  ├─ Resolve job function by name
  ├─ Execute job
  │   ├─ Query active organizations (exclude _platform, suspended, deleted)
  │   ├─ For each org: run tenant-scoped queries
  │   └─ Create notifications / update statuses
  └─ Return { success, processed, errors }
```

Jobs run as simple async functions, not a full job queue. This is appropriate because:
- Vercel Cron supports up to 60s execution time (Hobby) or 300s (Pro)
- All jobs are simple DB queries + inserts — no long-running computation
- No need for retry logic or dead-letter queues at this scale
- Each job is idempotent — safe to re-run if a previous execution was interrupted

### Notification Creation Pattern

Jobs create notifications using the existing `notifications` table. They do NOT send emails directly — email delivery is the notification system's responsibility (or a future enhancement). This keeps jobs simple and avoids email spam from job retries.

Exception: Overdue invoice reminders to clients MAY send emails directly, gated by an org-level setting.

### Scope Boundaries

- This story does NOT add a super-admin job execution dashboard (tracked as future enhancement)
- This story does NOT add real-time push notifications — jobs create DB notification records
- This story does NOT add per-endpoint rate limiting for all server actions — only the existing rate-limited endpoints are upgraded
- Redis is optional — the system must work without it (degraded to in-memory)
