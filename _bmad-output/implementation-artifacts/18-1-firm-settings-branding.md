# Story 18.1: Firm Settings & Branding

Status: ready-for-dev

## Story

As an Admin,
I want to configure firm-wide settings including branding, tax, billing, and payment details,
so that the system reflects our firm's identity and Kenya-specific defaults.

## Acceptance Criteria (ACs)

1. **Firm Settings Page:** A dedicated settings page exists at `/(dashboard)/settings` accessible only to Admin users.
2. **Firm Identity Fields:** Form fields for: firm name, physical address, postal address (P.O. Box), phone number, email, website URL.
3. **Logo Upload:** Upload firm logo (PNG/JPG/SVG, max 2MB) that is used on fee note PDFs, the client portal header, and the login page. Preview of current logo shown. Replace/remove capability.
4. **KRA PIN:** Field for firm's Kenya Revenue Authority PIN, displayed on generated fee note PDFs.
5. **Default Tax Rate:** Configurable default tax rate, preset to 16% (Kenya standard VAT rate). Used as default when creating fee note line items.
6. **Default Billing Increment:** Configurable billing time increment (6 min / 15 min / 30 min) for rounding time entries. Default is 6 minutes (0.1 hour).
7. **Default Payment Terms:** Text field for default payment terms displayed on fee notes (e.g., "Payment due within 30 days of invoice date").
8. **Fiscal Year Start Month:** Dropdown to set the firm's fiscal year start month (default January) for financial reporting alignment.
9. **Date Format:** Configurable date format, default DD/MM/YYYY (Kenya standard). Options: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD.
10. **Currency:** Default currency set to KES (Kenya Shillings). Display-only or selectable for future multi-currency.
11. **Default County:** Dropdown of all 47 Kenya counties for the firm's default county.
12. **M-Pesa Configuration:** Fields for M-Pesa Paybill number or Till number. These values are displayed on fee note PDFs and client portal payment instructions.
13. **Bank Details:** Fields for bank name, account name, account number, branch, and Swift code. Displayed on fee note PDFs for bank transfer payments.
14. **Key-Value Storage:** All settings stored as key-value pairs in the `firm_settings` table (key VARCHAR, value TEXT/JSONB) rather than a wide single-row table.
15. **Save and Validation:** Form validates required fields (firm name, email) with Zod. Save button persists all settings. Success toast on save. Audit log entry on settings change.

## Tasks / Subtasks

- [ ] **Task 1: Create firm settings page route and layout** (AC 1)
  - Create `src/app/(dashboard)/settings/page.tsx` as the main settings landing page
  - Create `src/app/(dashboard)/settings/layout.tsx` with settings sidebar navigation (Firm, Users, Practice Areas, Custom Fields, Tags, Audit Log, Import/Export)
  - Add "Settings" to main sidebar navigation under System group with Lucide `Settings` icon
  - Ensure RBAC middleware restricts `/settings` to Admin role

- [ ] **Task 2: Create firm settings form schema** (AC 2-13, 15)
  - Create `src/lib/validators/firm-settings.ts` with Zod schema covering all fields:
    - `firmName` (required string)
    - `physicalAddress`, `postalAddress`, `phone`, `email` (required email), `website` (optional URL)
    - `kraPin` (optional, Kenya KRA format validation)
    - `defaultTaxRate` (number, default 16)
    - `billingIncrement` (enum: 6, 15, 30)
    - `paymentTerms` (string)
    - `fiscalYearStartMonth` (1-12)
    - `dateFormat` (enum: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
    - `currency` (default KES)
    - `defaultCounty` (string from Kenya 47 counties)
    - `mpesaPaybill`, `mpesaTill` (optional strings)
    - `bankName`, `bankAccountName`, `bankAccountNumber`, `bankBranch`, `bankSwift` (optional strings)

- [ ] **Task 3: Implement firm settings server actions** (AC 14, 15)
  - Create `src/lib/actions/firm-settings.ts` with:
    - `getFirmSettings()` - reads all key-value pairs from `firm_settings` table, returns as typed object
    - `updateFirmSettings(data)` - upserts each field as a key-value pair in `firm_settings` table
  - Use Drizzle `onConflictDoUpdate` for upsert behavior
  - Call `createAuditLog()` on every settings update with old vs new values

- [ ] **Task 4: Implement logo upload** (AC 3)
  - Create `src/lib/actions/logo-upload.ts` with server action for logo upload
  - Validate file type (PNG, JPG, SVG) and size (max 2MB)
  - Storage: Vercel Blob (demo) or local filesystem `/public/uploads/` (production), controlled by env var `STORAGE_PROVIDER`
  - Store logo URL/path in `firm_settings` with key `logoUrl`
  - Return preview URL after upload

- [ ] **Task 5: Build firm settings form component** (AC 2-13, 15)
  - Create `src/components/settings/firm-settings-form.tsx` as a client component
  - Use `react-hook-form` with Zod resolver for the settings schema
  - Organized sections with shadcn Cards:
    - **Firm Identity:** name, address, phone, email, website, logo upload with preview
    - **Tax & Billing:** KRA PIN, default tax rate, billing increment, payment terms
    - **Regional:** fiscal year start, date format, currency, default county
    - **Payment Methods:** M-Pesa Paybill/Till, bank details (name, account, branch, Swift)
  - Kenya counties dropdown using a constants file with all 47 counties
  - Save button with loading state, success/error toast notifications

- [ ] **Task 6: Create Kenya counties constant** (AC 11)
  - Create `src/lib/constants/kenya-counties.ts` with all 47 Kenya county names as a typed array
  - Reusable across the application wherever county selection is needed

- [ ] **Task 7: Build settings utility for consuming settings** (AC 14)
  - Create `src/lib/utils/settings.ts` with:
    - `getSetting(key: string): Promise<string | null>` - fetches a single setting
    - `getSettings(keys: string[]): Promise<Record<string, string>>` - fetches multiple settings
    - `getTypedSettings(): Promise<FirmSettings>` - returns all settings as a typed object
  - Cache settings in-memory or use Next.js `unstable_cache` for performance (settings change rarely)

- [ ] **Task 8: Integrate logo into PDF generation and portal** (AC 3)
  - Update fee note PDF template (from Epic 11) to use the uploaded logo URL
  - Update portal layout header to display firm logo
  - Update login page to display firm logo
  - Fallback to text firm name if no logo uploaded

## Dev Notes

- **Key-Value Storage Pattern:** The `firm_settings` table uses a key-value design: `{ id, key: string, value: text, updated_at, updated_by }`. This is more flexible than a wide single-row table and allows adding new settings without schema migrations. For complex values (like bank details object), store as JSON string in the value column.
- **Kenya-Specific Defaults:**
  - Tax rate: 16% (Kenya VAT)
  - Currency: KES (Kenya Shillings)
  - Date format: DD/MM/YYYY
  - Phone format: +254
  - M-Pesa is the dominant mobile payment method in Kenya; Paybill and Till numbers are essential for client payments
  - KRA PIN format: typically A followed by 9 digits then a letter (e.g., A123456789B)
- **Logo Storage:** Use the storage abstraction pattern. In development/demo (Vercel), use Vercel Blob. In production (Windows Server), store in a local uploads directory. The `STORAGE_PROVIDER` env var switches between them.
- **Audit Log:** Every settings change must create an audit log entry showing the old value and new value for each changed field. Use the `createAuditLog()` utility function.
- **Caching:** Firm settings are read frequently (every PDF generation, every page load for logo). Cache aggressively. Use `revalidateTag('firm-settings')` on update.
- **M-Pesa Integration:** At this stage, M-Pesa details are display-only (shown on PDFs and payment instructions). Actual M-Pesa API integration for automatic payment verification would be a future enhancement.

### Project Structure Notes

**New files to create:**
- `src/app/(dashboard)/settings/page.tsx`
- `src/app/(dashboard)/settings/layout.tsx`
- `src/components/settings/firm-settings-form.tsx`
- `src/lib/validators/firm-settings.ts`
- `src/lib/actions/firm-settings.ts`
- `src/lib/actions/logo-upload.ts`
- `src/lib/utils/settings.ts`
- `src/lib/constants/kenya-counties.ts`

**Files to modify:**
- Sidebar navigation component (add Settings link under System group)
- RBAC middleware (ensure Admin-only access to /settings)
- Fee note PDF template (inject logo from settings)
- Portal layout (display firm logo)
- Login page (display firm logo)

### References

- [Source: a.md -- Law Firm Registry Implementation Plan]
- [Source: epics.md -- Epic 18: Settings & Configuration, Story 18.1]
- [Source: epics.md -- Epic 11: Billing & Fee Notes, Story 11.2] (fee note PDF uses firm settings)
- Kenya Revenue Authority (KRA) PIN format
- Kenya M-Pesa Paybill/Till number system
- Kenya 47 counties list (County Governments Act 2012)

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
