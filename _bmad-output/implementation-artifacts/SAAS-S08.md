# Story: Platform Super-Admin & Tenant Management

**Story ID:** SAAS-001-S08
**Epic:** SAAS-001 - Convert Law Firm Registry to Multi-Tenant SaaS Platform
**Priority:** P2
**Points:** 13 (L)
**Status:** draft
**Depends On:** S01 (done), S02 (done), S05 (done)

---

## User Story

**As a** platform operator (super-admin),
**I want** a platform-level admin panel to manage all organizations,
**So that** I can monitor, support, and manage tenants across the platform.

---

## Current State Analysis

### What Already Exists

| Component | Status | Details |
|-----------|--------|---------|
| `super_admin` role in enum | DONE | `src/lib/db/schema/enums.ts:4` - added to `userRole` pgEnum |
| Middleware role check | DONE | `src/middleware.ts:32` - `/admin` paths restricted to `super_admin` role |
| `requireSuperAdmin()` helper | DONE | `src/lib/auth/get-session.ts:34` - session guard |
| Default permissions matrix | DONE | `src/lib/auth/permissions.ts:21` - super_admin has full CRUD on all resources |
| JWT carries role | DONE | `src/lib/auth/auth.ts:142,189` - `super_admin` included in role type |
| Org status check in JWT refresh | DONE | `src/lib/auth/auth.ts:175-176` - skipped for super_admin users |
| Organizations table | DONE | Has status, storageUsedBytes, stripeCustomerId, planId, trialEndsAt |
| Plans table | DONE | Has name, slug, pricing, limits, features |
| Subscriptions table | DONE | Has status, Stripe IDs, period dates, grace period |
| Audit log table | DONE | Org-scoped (`organizationId` NOT NULL) |

### What Does NOT Exist (Gaps)

| Gap | Description | Impact |
|-----|-------------|--------|
| G1 | No `/admin` pages at all - zero UI | No admin dashboard, org management, or platform monitoring |
| G2 | No platform audit log table | Current `auditLog` is org-scoped (NOT NULL FK); platform events (impersonation, org suspension) have no storage |
| G3 | No impersonation system | Cannot impersonate org admins for support |
| G4 | No org management queries/actions | No server-side logic for listing/searching/suspending organizations |
| G5 | No revenue/analytics queries | No MRR, churn, plan distribution calculations |
| G6 | No plan management UI | Plans exist in DB but no CRUD interface |
| G7 | No system health monitoring | No DB metrics, connection info, or error rate tracking |
| G8 | Middleware doesn't enforce root-domain-only for `/admin` | A super_admin could access `/admin` from a tenant subdomain |
| G9 | No platform org for super_admin users | `users.organizationId` is NOT NULL; super_admin users need a home org |
| G10 | Org suspension has no immediate middleware enforcement | Status is checked on JWT refresh (up to 24hr gap); no real-time block |

---

## Acceptance Criteria

- [x] AC1: `super_admin` role exists outside any organization (enum added)
- [ ] AC2: Super-admin dashboard at `/admin` shows: total orgs, total users, MRR, active subscriptions, recent signups
- [ ] AC3: Organization list with search, filter by status/plan, sort by created date/user count
- [ ] AC4: Organization detail view: firm info, subscription status, user count, case count, storage usage, audit log
- [ ] AC5: Suspend/reactivate an organization (sets org status, blocks all org users at middleware level)
- [ ] AC6: Impersonate an org admin for support purposes (with audit trail)
- [ ] AC7: Platform-level audit log (org creations, suspensions, plan changes, impersonation events)
- [ ] AC8: Revenue dashboard: MRR, churn rate, plan distribution, growth metrics
- [ ] AC9: Manage global resources: court hierarchy, shared reference data
- [ ] AC10: Manage plans and pricing
- [ ] AC11: System health monitoring: DB size, active connections, error rates
- [ ] AC12: Super-admin middleware prevents access from tenant subdomains (root domain only)

---

## Technical Design

### Architecture Decisions

1. **Platform Organization**: Create a special "Platform" organization (slug: `_platform`) during seed/migration for super_admin users. This avoids making `users.organizationId` nullable (breaking change across 60+ tables).

2. **Platform Audit Log**: New `platform_audit_log` table without org FK. Stores cross-org events: impersonation, org suspension/reactivation, plan changes, platform config changes.

3. **Impersonation**: JWT-based. Super-admin gets a new short-lived token with the target org's context + `impersonatedBy` claim. All actions during impersonation are logged to both platform audit log and org audit log. Impersonation sessions capped at 1 hour.

4. **Root-Domain Enforcement**: Middleware enhancement - if path starts with `/admin` AND tenant slug is present in host, redirect to root domain `/admin`.

5. **Admin Layout**: New `src/app/(admin)/layout.tsx` route group with its own sidebar/nav, separate from the dashboard layout.

6. **Real-Time Org Suspension**: In middleware, for non-super_admin users, check a lightweight org status cache (or cookie flag) to block suspended orgs immediately, not just on JWT refresh.

### File Structure

```
src/app/(admin)/
  layout.tsx                          # Admin layout with sidebar
  admin/page.tsx                      # Dashboard overview
  admin/organizations/page.tsx        # Org list
  admin/organizations/[id]/page.tsx   # Org detail
  admin/revenue/page.tsx              # Revenue analytics
  admin/plans/page.tsx                # Plan management
  admin/health/page.tsx               # System health
  admin/audit/page.tsx                # Platform audit log

src/lib/db/schema/
  organizations.ts                    # Add platformAuditLog table

src/lib/queries/
  admin.ts                            # All super-admin queries

src/lib/actions/
  admin.ts                            # All super-admin actions

src/components/admin/
  admin-sidebar.tsx                   # Admin navigation
  org-table.tsx                       # Organization data table
  revenue-charts.tsx                  # Revenue visualization
  plan-editor.tsx                     # Plan CRUD form
  impersonation-banner.tsx            # Banner shown during impersonation
```

### Database Changes

**New table: `platform_audit_log`**
- `id` UUID PK
- `userId` UUID FK -> users (the super_admin)
- `action` text (impersonate, suspend_org, reactivate_org, update_plan, create_plan, delete_plan, update_org)
- `targetOrgId` UUID nullable (the org affected)
- `targetUserId` UUID nullable (for impersonation target)
- `details` text (JSON)
- `ipAddress` text
- `createdAt` timestamp

**Seed change:** Create platform org + default super_admin user.

### Impersonation Flow

1. Super-admin clicks "Impersonate" on org detail page
2. Server action validates super_admin role, logs to platform_audit_log
3. Sets a signed cookie/JWT claim: `{ impersonatedBy: superAdminId, originalRole: "super_admin" }`
4. Redirects to the org's subdomain dashboard
5. Banner component reads impersonation state from session, shows "You are impersonating [Org Name]" with "End Session" button
6. "End Session" clears impersonation cookie, redirects back to `/admin`
7. All actions during impersonation include `impersonatedBy` in audit log entries

### Middleware Enhancement

```
// In middleware, after auth check:
// 1. If pathname starts with /admin and tenantSlug exists:
//    redirect to root domain /admin (strip subdomain)
// 2. If user's org status is "suspended" and role !== "super_admin":
//    redirect to /suspended page with clear message
```

---

## Tasks

### T1: Platform Audit Log Schema + Migration
**Files:** `src/lib/db/schema/organizations.ts`, new migration
- Add `platformAuditLog` table to organizations.ts
- Generate Drizzle migration
- Export from schema index

### T2: Platform Organization Seed
**Files:** `src/lib/db/seed.ts`
- Add platform org (slug: `_platform`, name: "Platform Administration") to seed
- Add default super_admin user (email configurable via env `SUPER_ADMIN_EMAIL`)
- Make `_platform` a reserved slug in validation

### T3: Admin Layout + Sidebar
**Files:** `src/app/(admin)/layout.tsx`, `src/components/admin/admin-sidebar.tsx`
- Create admin route group layout with requireSuperAdmin guard
- Build admin sidebar with nav links: Dashboard, Organizations, Revenue, Plans, Health, Audit Log
- Minimal, professional design - distinct from tenant dashboard

### T4: Admin Dashboard Page
**Files:** `src/app/(admin)/admin/page.tsx`, `src/lib/queries/admin.ts`
- Platform metrics: total orgs, total users, active subscriptions, MRR, recent signups (last 7 days)
- Quick actions: view orgs, view revenue
- Recent platform audit events

### T5: Organization Management (List + Detail + Actions)
**Files:** `src/app/(admin)/admin/organizations/page.tsx`, `src/app/(admin)/admin/organizations/[id]/page.tsx`, `src/lib/actions/admin.ts`
- **List page**: search by name/slug, filter by status (active/suspended/cancelled) and plan, sort by created/users/cases, pagination
- **Detail page**: org info, subscription details, user count, case count, storage usage, org audit log (last 50 entries)
- **Actions**: suspend org (set status=suspended, log to platform audit), reactivate org (set status=active, log), edit org details

### T6: Impersonation System
**Files:** `src/lib/actions/admin.ts`, `src/components/admin/impersonation-banner.tsx`, auth modifications
- Start impersonation: server action validates super_admin, creates impersonation session (JWT claim or secure cookie)
- End impersonation: clears impersonation state, redirects to admin panel
- Banner component: shown in tenant dashboard layout when impersonation active
- Audit: all impersonation start/end events logged to platform audit log
- Guard: impersonation sessions expire after 1 hour max

### T7: Revenue Dashboard
**Files:** `src/app/(admin)/admin/revenue/page.tsx`, `src/lib/queries/admin.ts`
- MRR calculation from active subscriptions
- Plan distribution (pie/bar chart data)
- Growth metrics: new orgs this month vs last month
- Churn: cancelled subscriptions this month
- Server-side data, client chart components

### T8: Plan Management
**Files:** `src/app/(admin)/admin/plans/page.tsx`, `src/lib/actions/admin.ts`
- List all plans with current subscriber counts
- Edit plan: name, description, pricing, limits (maxUsers, maxCases, maxStorageMb), features, active/inactive
- Create new plan
- Cannot delete plans with active subscriptions (soft disable via isActive)

### T9: Middleware Enhancements
**Files:** `src/middleware.ts`
- Root-domain enforcement: `/admin` paths redirect to root domain if accessed from subdomain
- Suspended org enforcement: non-super_admin users of suspended orgs redirected to `/suspended` page
- Create `/suspended` page with clear messaging

### T10: System Health Page
**Files:** `src/app/(admin)/admin/health/page.tsx`, `src/lib/queries/admin.ts`
- Basic health metrics: total DB tables, org count, user count
- Storage: total storage used across all orgs
- Subscription status breakdown
- Environment info (Node version, deployment region if available)
- Note: Full DB connection pool metrics require pg_stat_activity which may not be available on Neon free tier

### T11: Platform Audit Log Page
**Files:** `src/app/(admin)/admin/audit/page.tsx`
- List platform audit events with pagination
- Filter by action type, date range
- Show actor (super_admin user), target org, details

---

## Scoping Notes

- **AC9 (global resources)**: Descoped to plan management only. Court hierarchy is Kenya-specific and better handled per-org. Shared reference data (if needed) is a separate future story.
- **System health**: Limited to what's queryable without special DB permissions. Neon serverless may restrict `pg_stat_*` access.
- **Impersonation**: Uses JWT claims approach (no separate session table) to keep it simple. The `impersonatedBy` claim in the JWT differentiates impersonation from normal access.

---

## Testing Checklist

- [ ] Super-admin can access `/admin` on root domain
- [ ] Non-super-admin cannot access `/admin` (redirects to /forbidden)
- [ ] `/admin` on tenant subdomain redirects to root domain
- [ ] Dashboard shows accurate platform metrics
- [ ] Org list searches, filters, sorts correctly
- [ ] Org detail shows correct subscription, user, case, storage data
- [ ] Suspend org: status changes, users blocked at middleware, platform audit logged
- [ ] Reactivate org: status changes, users can access again
- [ ] Impersonation: start creates correct session, banner shows, actions logged, end returns to admin
- [ ] Revenue metrics calculate correctly (MRR, plan distribution)
- [ ] Plan CRUD works, cannot delete plan with active subscribers
- [ ] Platform audit log displays events with correct pagination/filtering
- [ ] Suspended org users see `/suspended` page immediately (not after JWT expiry)

---

## Dependencies

- **S01** (done): Organization schema, multi-tenant DB foundation
- **S02** (done): Auth infrastructure, tenant context, middleware
- **S05** (done): Subscription/plan schema, Stripe integration

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Impersonation security | Short-lived sessions (1hr), audit trail, JWT claim approach prevents token reuse |
| Suspended org access gap | Middleware-level check on every request, not just JWT refresh |
| Platform org contamination | `_platform` org excluded from all tenant-facing queries by convention + status check |
| Super-admin privilege escalation | Only `super_admin` role can access admin actions; role cannot be self-assigned |
