# Story SAAS.5: Subscription Billing & Plan Management

Status: done

## Story

As a **platform operator**,
I want **a subscription billing system with tiered plans**,
so that **I can monetize the platform and control feature access per firm**.

## Acceptance Criteria

1. **AC1:** `plans` table with tiers: Starter, Professional, Enterprise (configurable)
2. **AC2:** `subscriptions` table with organizationId, planId, status, period dates, Stripe IDs
3. **AC3:** Stripe integration for payment processing (Checkout, Billing Portal, Webhooks)
4. **AC4:** M-Pesa payment bridge for Kenya market (deferred — Stripe handles KES)
5. **AC5:** Plan limits enforced: max users, max cases, max storage, feature access
6. **AC6:** Usage tracking: current user count, case count, storage used per org
7. **AC7:** Upgrade/downgrade flow with prorated billing
8. **AC8:** Trial period support (14-day default)
9. **AC9:** Grace period for failed payments before suspension (7-day default)
10. **AC10:** Webhook handlers for Stripe events
11. **AC11:** Billing admin page for org admins to manage subscription
12. **AC12:** Plan limit enforcement helper — reject actions that exceed plan limits
13. **AC13:** Feature gating integrated with permissions — features gated by plan tier

## Current Implementation Status

**~10% of this story is implemented.** Analysis:

### ALREADY DONE

- **AC1 PARTIAL:** `plans` table exists in `src/lib/db/schema/organizations.ts` with maxUsers, maxCases, maxStorageMb, features (JSON), pricing, trialDays. Only "Professional" plan seeded.
- **AC6 PARTIAL:** `organizations.storageUsedBytes` tracking exists (from S04). User/case counts can be derived from DB.
- **AC8 PARTIAL:** `organizations.trialEndsAt` column exists but not enforced.

### GAPS TO FIX

| # | Gap | Severity | Fix |
|---|-----|----------|-----|
| G1 | No `subscriptions` table | HIGH | Create schema with Stripe IDs, status, period dates |
| G2 | No Stripe integration | HIGH | Install stripe SDK, create customer/subscription/checkout utilities |
| G3 | No webhook handler | HIGH | Create `/api/webhooks/stripe/route.ts` |
| G4 | No plan enforcement | HIGH | Create `checkPlanLimit()` and `checkFeatureAccess()` helpers |
| G5 | No subscription management UI | MEDIUM | Create `/settings/subscription` page |
| G6 | No Stripe env vars | MEDIUM | Add STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY |
| G7 | Only 1 plan seeded | LOW | Seed Starter, Professional, Enterprise plans |
| G8 | Trial not enforced | MEDIUM | Check trialEndsAt in middleware/session |
| G9 | No grace period logic | MEDIUM | Implement suspension after failed payment grace period |
| G10 | M-Pesa integration | LOW | Defer — Stripe supports KES natively |
| G11 | Features JSON not validated | LOW | Define typed feature flags |

## Tasks / Subtasks

### Task 1: Subscriptions Schema (AC: #2)

- [ ] T1.1: Create `subscriptions` table in organizations schema: id, organizationId, planId, status (trialing/active/past_due/cancelled/suspended), stripeCustomerId, stripeSubscriptionId, stripePriceId, currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd, trialEnd, createdAt, updatedAt
- [ ] T1.2: Add relations for subscriptions
- [ ] T1.3: Generate migration

### Task 2: Stripe Integration (AC: #3, #7)

- [ ] T2.1: Install `stripe` npm package
- [ ] T2.2: Add Stripe env vars to `src/lib/env.ts`
- [ ] T2.3: Create `src/lib/stripe/client.ts` — Stripe SDK client
- [ ] T2.4: Create `src/lib/stripe/actions.ts` — createCheckoutSession, createBillingPortalSession, createStripeCustomer
- [ ] T2.5: Create `/api/webhooks/stripe/route.ts` (AC: #10)

### Task 3: Plan Enforcement (AC: #5, #12, #13)

- [ ] T3.1: Create `src/lib/utils/plan-limits.ts` with `checkPlanLimit(orgId, metric)` and `checkFeatureAccess(orgId, feature)`
- [ ] T3.2: Define typed feature flags interface
- [ ] T3.3: Integrate plan limit checks into key actions: createUser, createCase
- [ ] T3.4: Integrate feature gating into permissions system

### Task 4: Trial & Grace Period (AC: #8, #9)

- [ ] T4.1: On org creation, set trialEndsAt = now + plan.trialDays
- [ ] T4.2: Create subscription with status "trialing" during trial
- [ ] T4.3: Webhook: on trial_end, check if payment method exists → active or past_due
- [ ] T4.4: Webhook: on payment_failed, set grace period (7 days) → suspend if still unpaid

### Task 5: Subscription Management UI (AC: #11)

- [ ] T5.1: Create `/settings/subscription/page.tsx` — shows current plan, usage, billing portal link
- [ ] T5.2: Create plan selection/upgrade component
- [ ] T5.3: Server actions for subscription management

### Task 6: Seed Default Plans (AC: #1)

- [ ] T6.1: Update seed to create all 3 tiers: Starter, Professional, Enterprise
- [ ] T6.2: Define feature flags per plan tier

### Task 7: Usage Tracking Queries (AC: #6)

- [ ] T7.1: Create `getOrgUsage(orgId)` — returns { userCount, caseCount, storageUsedBytes }
- [ ] T7.2: Used by plan limit checks and subscription UI

## Dev Notes

### Architecture Decisions

1. **Stripe as sole payment provider** — handles KES natively, no separate M-Pesa integration needed for MVP
2. **Subscriptions table** separate from organizations — clean separation of billing concern
3. **Feature flags as JSON** in plans table — flexible, no schema changes for new features
4. **Plan enforcement at action layer** — checked in server actions where mutations happen, not in middleware (too heavy for every request)
5. **Webhook idempotency** — use Stripe event IDs to prevent duplicate processing

### Feature Flags Schema

```typescript
interface PlanFeatures {
  trust_accounting: boolean;
  workflow_automation: boolean;
  custom_branding: boolean;
  client_portal: boolean;
  api_access: boolean;
  reports: "basic" | "full" | "custom";
  priority_support: boolean;
}
```

### Out of Scope

- **AC4 (M-Pesa):** Deferred — Stripe handles KES. Can add M-Pesa as alternative payment method in future.
- **Billing history UI:** Users can access via Stripe Billing Portal (self-service)
- **Invoice generation:** Handled by Stripe

### Key Files to Create

| File | Purpose |
|------|---------|
| `src/lib/stripe/client.ts` | Stripe SDK client singleton |
| `src/lib/stripe/actions.ts` | Server actions for Stripe operations |
| `src/app/api/webhooks/stripe/route.ts` | Webhook handler |
| `src/lib/utils/plan-limits.ts` | Plan enforcement utilities |
| `src/app/(dashboard)/settings/subscription/page.tsx` | Subscription management page |

### Key Files to Modify

| File | Change |
|------|--------|
| `src/lib/env.ts` | Add Stripe env vars |
| `src/lib/db/schema/organizations.ts` | Add subscriptions table |
| `src/lib/db/seed.ts` | Seed 3 plan tiers |
| `src/lib/actions/cases.ts` | Add plan limit check on case creation |
| `src/lib/actions/auth.ts` | Add plan limit check on user registration |

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

- ~10% implemented (plans table, storage tracking, trialEndsAt column)
- No Stripe integration exists anywhere in the codebase
- Plans table has good schema but only 1 tier seeded
- This is the largest remaining story at 21 points

### File List

Files to CREATE:
- `src/lib/stripe/client.ts`
- `src/lib/stripe/actions.ts`
- `src/app/api/webhooks/stripe/route.ts`
- `src/lib/utils/plan-limits.ts`
- `src/app/(dashboard)/settings/subscription/page.tsx`

Files to MODIFY:
- `src/lib/env.ts`
- `src/lib/db/schema/organizations.ts`
- `src/lib/db/seed.ts`
- `src/lib/actions/cases.ts`
- `src/lib/actions/auth.ts`
