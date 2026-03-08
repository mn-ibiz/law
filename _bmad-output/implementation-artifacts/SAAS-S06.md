# Story SAAS.6: Tenant Onboarding & Organization Management

Status: ready-for-review

## Story

As a **new law firm**,
I want **a self-service onboarding flow to set up my firm on the platform**,
so that **I can start using the system without manual intervention**.

## Acceptance Criteria

1. **AC1:** Public signup page on root domain (`/signup`)
2. **AC2:** Onboarding wizard: Firm name, slug (subdomain), admin email, password, plan selection, country/jurisdiction, currency
3. **AC3:** Slug validation (uniqueness, allowed characters, reserved words blacklist)
4. **AC4:** Organization created atomically with: firm record, admin user, default branch, default settings, default permissions, default practice areas
5. **AC5:** Subdomain provisioned automatically (DNS wildcard + middleware routing)
6. **AC6:** Welcome email sent to firm admin with getting-started guide and subdomain URL
7. **AC7:** Onboarding checklist shown on first login (add attorneys, configure branding, import clients, set up billing rates)
8. **AC8:** Invite flow: firm admin can invite users via email with role assignment
9. **AC9:** User invitation acceptance creates account within the inviting organization
10. **AC10:** Intake form resolves to correct organization based on subdomain

## Current Implementation Status

**~5% of this story is implemented.** Analysis:

### ALREADY DONE

- **AC10 COMPLETE:** Intake form (`/intake`) already resolves org from subdomain via `extractTenantSlug()` and inserts client with correct `organizationId`.
- **AC5 PARTIAL:** Middleware already routes subdomains via `extractTenantSlug()`. DNS wildcard is an ops task, not code.
- **Schema exists:** `organizationMembers` table defined with relations (but never populated).
- **Email infra exists:** `src/lib/email/send-email.ts` with Resend integration and template examples.
- **Seed creates defaults:** Seed script shows the pattern for creating org + admin + branch + practice areas (but hardcoded, not a reusable provisioning function).

### GAPS TO FIX

| # | Gap | Severity | Fix |
|---|-----|----------|-----|
| G1 | No public signup page | HIGH | Create `/signup` route on root domain with onboarding wizard |
| G2 | No org provisioning function | HIGH | Create atomic `provisionOrganization()` that creates org + admin + defaults |
| G3 | No slug validation | HIGH | Create validator with reserved words blacklist, allowed chars, uniqueness check |
| G4 | No invite system | HIGH | Create invite tokens, email, acceptance flow |
| G5 | No welcome email | MEDIUM | Create welcome email template and send on org creation |
| G6 | No onboarding checklist | MEDIUM | Create checklist component with progress tracking |
| G7 | organizationMembers never populated | MEDIUM | Populate on org creation (owner) and invite acceptance |
| G8 | No slug availability API | LOW | Create `/api/check-slug` endpoint for real-time validation |

## Tasks / Subtasks

### Task 1: Slug Validation & Availability (AC: #3)

- [ ] T1.1: Create `src/lib/utils/slug-validation.ts` with `validateSlug(slug)` — allowed chars (a-z, 0-9, hyphens), length (3-50), no leading/trailing hyphens
- [ ] T1.2: Define reserved words blacklist: admin, api, app, www, mail, support, help, billing, status, docs, blog, portal, auth, login, register, signup, dashboard, settings, webhook, webhooks, stripe, calendar, intake
- [ ] T1.3: Create `checkSlugAvailability(slug)` — queries DB for uniqueness
- [ ] T1.4: Create `/api/check-slug/route.ts` — public endpoint for real-time slug availability check (rate-limited)

### Task 2: Organization Provisioning Service (AC: #4)

- [ ] T2.1: Create `src/lib/actions/onboarding.ts` with `provisionOrganization()` function
- [ ] T2.2: Provisioning creates atomically: organization record, admin user (hashed password, role=admin, isActive=true), default branch ("Main Office"), organization member (role=owner), subscription (trialing, linked to selected plan with trialEnd = now + plan.trialDays)
- [ ] T2.3: Provisioning also seeds: default practice areas for jurisdiction, default firm settings, default billing rates
- [ ] T2.4: Use Neon HTTP batch or sequential inserts (no transaction support) with rollback-on-error pattern

### Task 3: Public Signup Page & Wizard (AC: #1, #2)

- [ ] T3.1: Create `src/app/(public)/signup/page.tsx` — multi-step wizard
- [ ] T3.2: Step 1: Firm details (name, slug with live availability check, country, currency, timezone)
- [ ] T3.3: Step 2: Admin account (name, email, password, phone)
- [ ] T3.4: Step 3: Plan selection (show all active plans with features)
- [ ] T3.5: Step 4: Review & confirm
- [ ] T3.6: Create `src/app/(public)/layout.tsx` if needed (public layout without auth)
- [ ] T3.7: Server action `signupAction()` calls `provisionOrganization()`, sends welcome email, redirects to subdomain login

### Task 4: Welcome Email (AC: #6)

- [ ] T4.1: Create `src/lib/email/templates/welcome.ts` — HTML template with firm name, subdomain URL, getting-started steps
- [ ] T4.2: Send welcome email in `provisionOrganization()` after successful creation

### Task 5: Invite System (AC: #8, #9)

- [ ] T5.1: Add `inviteToken`, `inviteExpiresAt`, `invitedBy`, `invitedRole` columns to users table (nullable, for pending invites)
- [ ] T5.2: Create `sendInvite(email, role, organizationId)` server action — creates pending user with invite token, sends invite email
- [ ] T5.3: Create `src/lib/email/templates/invite.ts` — invite email with accept link pointing to org subdomain
- [ ] T5.4: Create `src/app/(auth)/invite/[token]/page.tsx` — invite acceptance page (set password, activate account)
- [ ] T5.5: Create `acceptInvite(token, password)` server action — validates token, sets password, activates user, creates organizationMember record
- [ ] T5.6: Add invite UI to settings/users page — admin can invite by email with role selector

### Task 6: Onboarding Checklist (AC: #7)

- [ ] T6.1: Create `src/components/dashboard/onboarding-checklist.tsx` — shows checklist items with completion status
- [ ] T6.2: Checklist items: Add first attorney, Configure branding, Import/add first client, Set billing rates, Invite team member, Configure practice areas
- [ ] T6.3: Track completion via firmSettings (JSON key `onboardingCompleted`) or derive from data presence
- [ ] T6.4: Show on admin dashboard when org is < 7 days old and checklist incomplete
- [ ] T6.5: Dismissable with "Don't show again" option

### Task 7: Organization Members Integration (AC: #4, #9)

- [ ] T7.1: Populate organizationMembers on org creation (admin as "owner")
- [ ] T7.2: Populate organizationMembers on invite acceptance
- [ ] T7.3: Populate organizationMembers on self-registration (as "member")

## Dev Notes

### Architecture Decisions

1. **Neon HTTP limitation:** No true transactions available. Provisioning uses sequential inserts with best-effort cleanup on failure. The unique constraint on org slug prevents duplicate orgs.
2. **Invite via users table:** Rather than a separate invites table, add invite fields to users table. A pending invite is a user with `isActive=false`, `inviteToken` set, and no password. This simplifies the acceptance flow (just update the existing user row).
3. **Onboarding checklist derived from data:** Instead of tracking checklist state separately, derive completion from actual data presence (e.g., has attorneys? has branding? has clients?). This avoids state drift.
4. **Signup on root domain:** The `/signup` route must be accessible from the root domain (not a subdomain). The middleware already allows unauthenticated access to auth routes.
5. **Slug validation client-side + server-side:** Validate on client for UX (instant feedback via API), validate again on server before provisioning.

### Key Files to Create

| File | Purpose |
|------|---------|
| `src/lib/utils/slug-validation.ts` | Slug validation + reserved words |
| `src/lib/actions/onboarding.ts` | Org provisioning + signup action |
| `src/app/(public)/signup/page.tsx` | Public signup wizard |
| `src/app/api/check-slug/route.ts` | Slug availability API |
| `src/lib/email/templates/welcome.ts` | Welcome email template |
| `src/lib/email/templates/invite.ts` | Invite email template |
| `src/app/(auth)/invite/[token]/page.tsx` | Invite acceptance page |
| `src/components/dashboard/onboarding-checklist.tsx` | Onboarding checklist |

### Key Files to Modify

| File | Change |
|------|--------|
| `src/lib/db/schema/auth.ts` | Add invite fields to users table |
| `src/lib/actions/auth.ts` | Add registerAction organizationMembers insert |
| `src/app/(dashboard)/settings/users/page.tsx` | Add invite UI |
| `src/components/dashboard/admin-dashboard.tsx` | Show onboarding checklist |
| `src/middleware.ts` | Ensure /signup is accessible on root domain |

### Out of Scope

- **DNS wildcard configuration:** Ops/infra task, not code. Document in deployment guide.
- **Custom domain support:** Future feature (S09 or beyond).
- **Onboarding email sequence (drip):** Future enhancement. Single welcome email for MVP.

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

- ~5% implemented (intake form org resolution, organizationMembers schema, email infra)
- No signup or org creation flow exists anywhere
- Invite system is completely missing
- The seed script shows the provisioning pattern but isn't reusable
- Neon HTTP driver limitation means no atomic transactions for provisioning

### File List

Files to CREATE:
- `src/lib/utils/slug-validation.ts`
- `src/lib/actions/onboarding.ts`
- `src/app/(public)/signup/page.tsx`
- `src/app/(public)/layout.tsx`
- `src/app/api/check-slug/route.ts`
- `src/lib/email/templates/welcome.ts`
- `src/lib/email/templates/invite.ts`
- `src/app/(auth)/invite/[token]/page.tsx`
- `src/components/dashboard/onboarding-checklist.tsx`

Files to MODIFY:
- `src/lib/db/schema/auth.ts`
- `src/lib/actions/auth.ts`
- `src/app/(dashboard)/settings/users/page.tsx`
- `src/components/dashboard/admin-dashboard.tsx`
- `src/middleware.ts`
