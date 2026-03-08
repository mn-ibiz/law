# Story SAAS.7: Configuration Internationalization & Per-Tenant Settings

Status: code-review

## Story

As a **law firm in any jurisdiction**,
I want **my currency, locale, VAT rate, and legal system configuration to be specific to my firm**,
so that **the platform works correctly for my country and practice**.

## Acceptance Criteria

1. **AC1:** `APP_LOCALE` constant replaced with per-org locale fetched from organization record
2. **AC2:** `formatKES()` replaced with generic `formatCurrency(amount, currency, locale)` that reads org config
3. **AC3:** VAT rate (hardcoded 16%) moved to per-org `firmSettings`
4. **AC4:** Invoice/quote/receipt/credit note/case/requisition/trust number prefixes configurable per org
5. **AC5:** Currency defaults changed from hardcoded "KES" to org setting in billing schemas
6. **AC6:** All 100+ `formatKES` and 120+ `APP_LOCALE` usages updated to use tenant-aware formatting
7. **AC7:** Kenya-specific fields (lskNumber, kraPin, nationalId, commissionerForOaths, seniorCounsel) remain in schema but display conditionally based on org jurisdiction
8. **AC8:** Compliance thresholds (CPD units) made per-org configurable via firmSettings
9. **AC9:** PDF generation uses org branding, currency, and locale
10. **AC10:** Email FROM address configurable per org via firmSettings
11. **AC11:** SMS sender ID configurable per org via firmSettings
12. **AC12:** `localStorage` keys prefixed with orgId to prevent cross-org state bleed (3 keys: sidebar-collapsed, recent-searches, law-firm-timer)
13. **AC13:** Tenant config helper created to cache org settings (locale, currency, timezone, vatRate) for request lifecycle

## Current Implementation Status

**~5% of this story is implemented.** Analysis:

### ALREADY DONE

- **Organizations schema has locale/currency/timezone columns** — `src/lib/db/schema/organizations.ts` lines 22-24: `timezone`, `locale`, `currency` fields exist with Kenya defaults.
- **firmSettings table exists** — Generic key-value store at `src/lib/db/schema/settings.ts` with `upsertFirmSetting()` action and `getFirmSettings()` query. Ready to store per-org config like VAT rate, number prefixes, email FROM, SMS sender ID.
- **firmSettings already org-scoped** — Has `organizationId` FK and unique index on `(organizationId, key)`.
- **Invoice schema has currency field** — `invoices.currency` exists, defaults to "KES".
- **billingRates schema has currency field** — defaults to "KES".
- **plans schema has currency field** — defaults to "KES".
- **Invoice PDF accepts currency param** — `InvoicePDFData` interface has `currency?: string` but the internal `fmtKES()` helper ignores it.

### GAPS TO FIX

| # | Gap | Severity | Scope | Fix |
|---|-----|----------|-------|-----|
| G1 | `formatKES()` hardcoded to KES | HIGH | 33 files, 100 usages | Create `formatCurrency(amount, currency, locale)`, replace all usages |
| G2 | `APP_LOCALE` global constant | HIGH | 49 files, 120 usages | Create tenant locale helper, replace all usages |
| G3 | VAT rate hardcoded to 16% | HIGH | billing.ts action line 38, billing schema default | Read from firmSettings, default to org country rate |
| G4 | 7 number prefixes hardcoded | MEDIUM | 5 files (billing queries/actions, cases, time-expenses, trust) | Read from firmSettings with defaults |
| G5 | localStorage keys not org-prefixed | MEDIUM | 3 files, 3 keys | Prefix with orgId from session |
| G6 | PDF generators hardcode KES/en-KE | MEDIUM | 2 files (generate-pdf.ts, generate-invoice-pdf.ts) | Pass org currency/locale as parameters |
| G7 | Email FROM not per-org | LOW | send-email.ts | Look up firmSettings for org-specific FROM, fallback to env |
| G8 | SMS sender ID not per-org | LOW | send-sms.ts | Look up firmSettings for org-specific sender, fallback to env |
| G9 | Kenya-specific fields always shown | LOW | attorney-form.tsx, client forms | Conditionally render based on org.country |
| G10 | CPD thresholds hardcoded | LOW | compliance queries | Read from firmSettings |
| G11 | No tenant config helper | HIGH | N/A | Create cached helper to load org settings per request |

## Tasks / Subtasks

### Task 1: Tenant Config Helper & formatCurrency (AC: #2, #13)

- [ ] T1.1: Create `src/lib/utils/tenant-config.ts` with `getOrgConfig(organizationId)` — fetches and caches org locale, currency, timezone, and key firmSettings (vatRate, number prefixes) for the request lifecycle using React `cache()`
- [ ] T1.2: Create `formatCurrency(amount: number, currency: string, locale: string): string` in `src/lib/utils/format.ts` alongside existing `formatKES()`
- [ ] T1.3: Create `formatDate(date: Date | string, locale: string, options?: Intl.DateTimeFormatOptions): string` helper for consistent date formatting
- [ ] T1.4: Deprecate `formatKES()` — keep as thin wrapper calling `formatCurrency(amount, "KES", "en-KE")` to avoid breaking intermediate builds

### Task 2: Replace formatKES Across Codebase (AC: #2, #6)

- [ ] T2.1: Update all 33 files importing `formatKES` to import `formatCurrency` from `@/lib/utils/format`
- [ ] T2.2: In server components — call `getOrgConfig(organizationId)` to get currency/locale, pass to `formatCurrency()`
- [ ] T2.3: In client components — receive currency/locale as props from parent server component
- [ ] T2.4: Files to update (grouped by area):
  - **Dashboard:** admin-dashboard.tsx, client-dashboard.tsx, attorney-dashboard.tsx, charts/*.tsx, widgets/*.tsx
  - **Billing:** billing/page.tsx, billing/[id]/page.tsx, billing/new/page.tsx, billing/quotes/page.tsx, billing/quotes/new/page.tsx, invoice-columns.tsx, payment-dialog.tsx, quote-form.tsx, invoice-form.tsx
  - **Cases:** cases/[id]/page.tsx, cases/page.tsx
  - **Time & Expenses:** time-expenses/page.tsx, time-expenses/new/page.tsx
  - **Trust:** trust-accounts/page.tsx, trust-accounts/[id]/page.tsx
  - **Petty Cash:** petty-cash/page.tsx
  - **Suppliers:** suppliers/[id]/page.tsx, suppliers/page.tsx
  - **Requisitions:** requisitions/page.tsx
  - **Reports:** reports/page.tsx
  - **Portal:** portal/invoices/page.tsx
  - **Settings:** settings/firm/page.tsx

### Task 3: Replace APP_LOCALE Across Codebase (AC: #1, #6)

- [ ] T3.1: Update all 49 files importing `APP_LOCALE` to use org locale from config
- [ ] T3.2: In server components — use `getOrgConfig(organizationId).locale` for `toLocaleDateString()`, `toLocaleString()`, etc.
- [ ] T3.3: In client components — receive locale as prop, or read from a client-side context
- [ ] T3.4: Consider creating a `<TenantConfigProvider>` React context in dashboard layout to make locale/currency available to all client components without prop drilling
- [ ] T3.5: Files to update include all pages/components that call `.toLocaleDateString(APP_LOCALE, ...)` or `.toLocaleString(APP_LOCALE, ...)`

### Task 4: VAT Rate & Number Prefixes Configurability (AC: #3, #4)

- [ ] T4.1: Seed default firmSettings for VAT rate: key `vatRate`, default `16` for KE orgs
- [ ] T4.2: Update `createInvoice()` in billing.ts to read VAT rate from `getOrgConfig()` instead of hardcoded `16`
- [ ] T4.3: Seed default firmSettings for number prefixes: keys `prefix.invoice` (INV), `prefix.quote` (QT), `prefix.receipt` (RCT), `prefix.creditNote` (CN), `prefix.requisition` (REQ), `prefix.trustAccount` (TRUST), `prefix.case` (CASE)
- [ ] T4.4: Update `generateInvoiceNumber()` (billing.ts) to read prefix from config
- [ ] T4.5: Update `generateCaseNumber()` (cases.ts) to read prefix from config
- [ ] T4.6: Update quote/receipt/creditNote/requisition/trust number generation to read prefixes from config
- [ ] T4.7: Add VAT rate and number prefix settings to firm settings UI page

### Task 5: localStorage Key Prefixing (AC: #12)

- [ ] T5.1: Update `src/components/layout/sidebar.tsx` — prefix `sidebar-collapsed` key with orgId from session
- [ ] T5.2: Update `src/components/shared/command-search.tsx` — prefix `recent-searches` key with orgId
- [ ] T5.3: Update `src/components/time-tracking/timer-widget.tsx` — prefix `law-firm-timer` key with orgId
- [ ] T5.4: Each component needs access to organizationId (from session or context provider)

### Task 6: PDF Generation Internationalization (AC: #9)

- [ ] T6.1: Update `src/lib/utils/generate-pdf.ts` — accept currency/locale parameters, remove `APP_LOCALE` import, replace hardcoded "KES" in `formatCellValue()`
- [ ] T6.2: Update `src/lib/utils/generate-invoice-pdf.ts` — replace `fmtKES()` with `formatCurrency()` using the `currency` field from `InvoicePDFData`, remove hardcoded "en-KE"
- [ ] T6.3: Update all callers of PDF generation to pass org currency/locale

### Task 7: Email FROM & SMS Sender Per-Org (AC: #10, #11)

- [ ] T7.1: Update `src/lib/email/send-email.ts` — accept optional `from` parameter, look up firmSettings key `email.from` for org-specific FROM when organizationId is provided
- [ ] T7.2: Update `src/lib/sms/send-sms.ts` — accept optional `senderId` parameter, look up firmSettings key `sms.senderId` for org-specific sender
- [ ] T7.3: Update email/SMS callers that have org context to pass organizationId for per-org FROM/sender lookup

### Task 8: Kenya-Specific Field Conditionality (AC: #7, #8)

- [ ] T8.1: Update attorney form (`src/components/forms/attorney-form.tsx`) — conditionally show lskNumber, commissionerForOaths, seniorCounsel fields based on org.country === "KE"
- [ ] T8.2: Update client forms — conditionally show kraPin, nationalId based on org.country
- [ ] T8.3: Update attorney/client detail pages — conditionally display Kenya-specific fields
- [ ] T8.4: Add firmSettings keys for CPD thresholds: `cpd.totalRequired` (default 5), `cpd.lskRequired` (default 2) — read in compliance queries
- [ ] T8.5: Schema fields remain unchanged (nullable, optional) — only UI display changes

## Dev Notes

### Architecture Decisions

1. **Tenant config via React `cache()`:** Create `getOrgConfig()` that queries org record + relevant firmSettings, cached per-request using `cache()`. This avoids repeated DB queries within a single render pass. Server components call this directly; client components receive values as props.

2. **No React context for server components:** Server components can't use React context. The pattern is: server component calls `getOrgConfig(orgId)`, passes locale/currency as props to client children. For deeply nested client trees, a `<TenantConfigProvider>` wrapping the dashboard layout passes config via context.

3. **Gradual replacement strategy for formatKES:** Keep `formatKES()` as a deprecated wrapper initially. Replace file-by-file. This allows incremental migration without breaking the build.

4. **firmSettings for configurable values:** VAT rate, number prefixes, email FROM, SMS sender ID stored in firmSettings (key-value). This avoids schema migrations for each new config option. Keys: `vatRate`, `prefix.invoice`, `prefix.quote`, `prefix.receipt`, `prefix.creditNote`, `prefix.requisition`, `prefix.trustAccount`, `prefix.case`, `email.from`, `sms.senderId`, `cpd.totalRequired`, `cpd.lskRequired`.

5. **localStorage prefixing:** Use pattern `${orgId}:key` (e.g., `abc123:sidebar-collapsed`). Components get orgId from session/context. On org switch, each org gets independent state.

6. **Currency/locale flow for client components:** Dashboard layout fetches org config once, passes to `<TenantConfigProvider>`. All client components within the dashboard can `useOrgConfig()` to get currency/locale without prop drilling.

### Key Files to Create

| File | Purpose |
|------|---------|
| `src/lib/utils/tenant-config.ts` | Cached org config helper (locale, currency, timezone, vatRate, prefixes) |
| `src/components/providers/tenant-config-provider.tsx` | React context provider for client components |

### Key Files to Modify

| File | Change |
|------|--------|
| `src/lib/utils/format.ts` | Add `formatCurrency()`, `formatDate()`, deprecate `formatKES()` |
| 33 files importing formatKES | Replace with formatCurrency |
| 49 files importing APP_LOCALE | Replace with org locale |
| `src/lib/actions/billing.ts` | VAT rate from config, number prefixes from config |
| `src/lib/queries/billing.ts` | Invoice number prefix from config |
| `src/lib/queries/cases.ts` | Case number prefix from config |
| `src/lib/actions/time-expenses.ts` | Requisition prefix from config |
| `src/lib/actions/trust.ts` | Trust account prefix from config |
| `src/lib/utils/generate-pdf.ts` | Accept currency/locale params |
| `src/lib/utils/generate-invoice-pdf.ts` | Use formatCurrency instead of fmtKES |
| `src/lib/email/send-email.ts` | Per-org FROM address |
| `src/lib/sms/send-sms.ts` | Per-org sender ID |
| `src/components/layout/sidebar.tsx` | Prefix localStorage key |
| `src/components/shared/command-search.tsx` | Prefix localStorage key |
| `src/components/time-tracking/timer-widget.tsx` | Prefix localStorage key |
| `src/components/forms/attorney-form.tsx` | Conditional Kenya fields |
| `src/app/(dashboard)/layout.tsx` | Add TenantConfigProvider |

### Scope Estimate

This is a high-touch story affecting 60+ files. The bulk of the work is mechanical replacement (formatKES → formatCurrency, APP_LOCALE → org locale), but the config infrastructure (tenant-config helper, context provider) is architecturally significant.

### Out of Scope

- **Court type configuration per org (AC8 from epic):** Courts remain global. Org-specific court filtering deferred.
- **Custom email templates per org:** Email templates remain shared. Per-org FROM address is in scope.
- **Per-org phone number format:** Phone validation remains generic. Country-specific validation deferred.

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

- ~5% implemented (org schema has locale/currency/timezone, firmSettings table exists)
- 100+ formatKES usages across 33 files need replacement
- 120+ APP_LOCALE usages across 49 files need replacement
- 3 localStorage keys need org-prefixing
- 7 number prefixes hardcoded across 5 files
- VAT rate hardcoded in billing action
- PDF generators hardcode KES/en-KE
- Email/SMS sender not per-org configurable
- Kenya-specific fields always displayed regardless of org country

### File List

Files to CREATE:
- `src/lib/utils/tenant-config.ts`
- `src/components/providers/tenant-config-provider.tsx`

Files to MODIFY (primary):
- `src/lib/utils/format.ts`
- `src/lib/constants/locale.ts`
- `src/lib/actions/billing.ts`
- `src/lib/queries/billing.ts`
- `src/lib/queries/cases.ts`
- `src/lib/actions/time-expenses.ts`
- `src/lib/actions/trust.ts`
- `src/lib/utils/generate-pdf.ts`
- `src/lib/utils/generate-invoice-pdf.ts`
- `src/lib/email/send-email.ts`
- `src/lib/sms/send-sms.ts`
- `src/components/layout/sidebar.tsx`
- `src/components/shared/command-search.tsx`
- `src/components/time-tracking/timer-widget.tsx`
- `src/components/forms/attorney-form.tsx`
- `src/app/(dashboard)/layout.tsx`

Files to MODIFY (formatKES/APP_LOCALE replacement — 60+ files):
- All dashboard, billing, cases, time-expenses, trust, suppliers, requisitions, petty-cash, reports, portal pages and components that use formatKES or APP_LOCALE
