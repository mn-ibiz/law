# Story: SAAS-S09 — Landing Page & Marketing Site Overhaul

**Story ID:** SAAS-001-S09
**Points:** 8 (M)
**Priority:** P2
**Depends On:** S05 (Subscription & Plan Management), S06 (Tenant Onboarding & Provisioning)
**Status:** Ready for Dev

---

## User Story

**As a** prospective customer,
**I want** a professional SaaS marketing site with pricing and signup,
**So that** I can understand the product value and sign up my firm.

---

## Current State Assessment

### Implementation: ~5%

The root domain currently serves a well-designed single-firm landing page at `src/app/page.tsx` (~1100 lines). It has a hero section, features grid, "how it works" section, compliance section, and footer. However, it's entirely hardcoded for a single firm — "Law Firm Registry" appears throughout, contact info is hardcoded, there's no pricing page, and no plan comparison.

### Gaps Identified

| Gap | Location | Description |
|-----|----------|-------------|
| G1 | `src/app/page.tsx` | 9+ hardcoded "Law Firm Registry" strings, hardcoded email/phone/address |
| G2 | `src/app/layout.tsx` | Metadata title "Law Firm Registry", description "for Kenya" |
| G3 | No pricing page | Missing `/pricing` with plan tiers and feature comparison |
| G4 | No features page | Missing `/features` with detailed feature breakdown |
| G5 | `src/components/layout/sidebar.tsx` | "LFR" hardcoded on line 62 |
| G6 | `src/app/(auth)/layout.tsx` | Fallback "Law Firm Registry" on line 36, "Legal Practice Management System" on line 39 |
| G7 | `src/app/intake/page.tsx` | "Law Firm Registry" hardcoded heading on line 19 |
| G8 | `src/lib/utils/generate-pdf.ts` | `DEFAULT_FIRM_NAME = "Law Firm Registry"` on line 39 |
| G9 | `src/app/api/calendar/ical/[userId]/route.ts` | "Law Firm Registry" as calName on lines 78, 91, 101 |
| G10 | Email templates | "Law Firm Registry" in invite.ts, welcome.ts, invoice-delivery.ts |
| G11 | Homepage has no CTA for signup with plan pre-selection | No pricing CTA integration |

---

## Tasks

### T1: Create platform site configuration
**Files:** `src/lib/config/site.ts` (NEW)

Create a centralized configuration for the marketing site and platform-level defaults:
```typescript
export const siteConfig = {
  name: "Law Firm Registry",
  tagline: "Legal Practice Management Platform",
  description: "Cloud-based practice management for modern law firms. Case tracking, billing, compliance, and more.",
  supportEmail: "support@lawfirmregistry.co.ke",
  supportPhone: "+254 700 000 000",
  address: "Nairobi, Kenya",
  url: "https://lawfirmregistry.co.ke",
};
```

This centralizes all hardcoded strings so they're easy to change and can eventually be driven by env vars or DB config.

### T2: Redesign root homepage as SaaS marketing page
**Files:** `src/app/page.tsx`

Update the existing landing page:
- Replace all hardcoded "Law Firm Registry" with `siteConfig.name`
- Replace hardcoded email/phone/address with `siteConfig` values
- Update hero copy to position as a SaaS platform: "The practice management platform built for Kenya's legal profession — and beyond"
- Add a prominent **Pricing CTA** section that links to `/pricing`
- Add "Get Started Free" / "Start Your Free Trial" CTAs linking to `/signup`
- Keep the existing features grid, how-it-works, and compliance sections (they're generic enough)
- Update navigation to include "Pricing" link
- Update footer to use `siteConfig` values

### T3: Create pricing page with plan comparison
**Files:** `src/app/pricing/page.tsx` (NEW)

Build a pricing page that:
- Fetches plan data from the DB via a new `getPublicPlans()` query (only active plans)
- Displays plan cards with: name, price, feature limits (users, cases, storage)
- Shows a feature comparison matrix
- Each plan has a CTA button linking to `/signup?plan={slug}`
- Includes FAQ section about billing, trials, cancellation
- Server component — fetches plans at render time

**Files:** `src/lib/queries/plans.ts` (NEW)
- `getPublicPlans()` — returns active plans with features, ordered by price

### T4: Create features page
**Files:** `src/app/features/page.tsx` (NEW)

Build a features page that:
- Lists all major features grouped by category (Case Management, Billing, Documents, Compliance, Calendar, etc.)
- Shows which plan tier includes each feature
- Links to pricing page for conversion
- Static content — no DB queries needed

### T5: Update root layout metadata for SaaS
**Files:** `src/app/layout.tsx`

- Update metadata title from "Law Firm Registry" to `siteConfig.name`
- Update description to SaaS-appropriate copy from `siteConfig.description`
- Template becomes `%s | ${siteConfig.name}`

### T6: Update hardcoded references in auth, intake, sidebar
**Files:** Multiple

- `src/app/(auth)/layout.tsx` line 36: Change fallback from "Law Firm Registry" to `siteConfig.name`; line 39: Change "Legal Practice Management System" to `siteConfig.tagline`
- `src/app/intake/page.tsx` line 19: Replace "Law Firm Registry" with org name from session/slug context (intake is org-scoped via subdomain)
- `src/components/layout/sidebar.tsx` line 62: Replace "LFR" with dynamic abbreviation derived from org name (first letters of each word, max 3 chars)

### T7: Update iCal calendar name to use org name
**Files:** `src/app/api/calendar/ical/[userId]/route.ts`

- Lines 78, 91: Replace `calName: "Law Firm Registry"` with the user's organization name (already have userId, can join to org)
- Line 101: Replace `PRODID:-//Law Firm Registry//EN` with org name

### T8: Update PDF DEFAULT_FIRM_NAME and email templates
**Files:** `src/lib/utils/generate-pdf.ts`, `src/lib/email/templates/invite.ts`, `src/lib/email/templates/welcome.ts`, `src/lib/email/templates/invoice-delivery.ts`

- `generate-pdf.ts` line 39: Change `DEFAULT_FIRM_NAME` to `siteConfig.name` (imported from site config) — this is only a fallback; callers already pass org-specific firm names
- Email templates: Replace "Law Firm Registry" and "The Law Firm Registry Team" with org name passed as parameter (these templates already accept org context in S07 work — verify and fix any remaining hardcoded references)

---

## Acceptance Criteria

- [ ] **AC1:** Root domain (`/`) serves SaaS marketing homepage with platform branding, pricing CTA, and signup links
- [ ] **AC2:** No hardcoded "Law Firm Registry" strings remain in user-facing pages (replaced with `siteConfig` or org-specific values)
- [ ] **AC3:** `/pricing` page displays plan tiers fetched from DB with feature comparison and signup CTAs
- [ ] **AC4:** `/features` page lists all features grouped by category with plan availability
- [ ] **AC5:** Root layout metadata updated for SaaS positioning
- [ ] **AC6:** Auth layout fallback uses `siteConfig.name` and `siteConfig.tagline`
- [ ] **AC7:** Sidebar displays dynamic org abbreviation instead of "LFR"
- [ ] **AC8:** iCal export uses org name instead of "Law Firm Registry"
- [ ] **AC9:** PDF default firm name uses `siteConfig.name` as fallback
- [ ] **AC10:** Email templates use org name from context (no hardcoded "Law Firm Registry Team")
- [ ] **AC11:** Intake page heading uses org name from subdomain context
- [ ] **AC12:** All signup CTAs link to `/signup` with optional `?plan={slug}` pre-selection

---

## Technical Design Notes

### Site Config Pattern
A simple `siteConfig` object is preferred over env vars or DB lookups for marketing site content. Reasons:
- Marketing copy changes infrequently
- No runtime DB dependency for public pages
- Easy to make env-driven later if needed
- Keeps the marketing site fast (static generation possible)

### Pricing Page Data Flow
```
/pricing (server component)
  → getPublicPlans() query
    → SELECT from plans WHERE isActive = true ORDER BY monthlyPrice ASC
  → Render plan cards with CTA → /signup?plan={slug}
```

### Sidebar Abbreviation Logic
```typescript
function getOrgAbbreviation(orgName: string): string {
  return orgName.split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 3);
}
// "Kamau & Associates" → "K&A" → "K&A" (3 chars)
// "Smith Legal" → "SL"
```

### Scope Boundaries
- This story does NOT create a marketing layout group `(marketing)` — the root `page.tsx` stays at `/` for simplicity
- Blog, docs, and changelog pages are out of scope
- Dynamic per-tenant landing pages (subdomain homepages) are out of scope — subdomain requests go straight to login
