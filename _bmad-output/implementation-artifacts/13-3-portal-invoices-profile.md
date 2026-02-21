# Story 13.3: Portal Invoice Viewing & Profile

Status: ready-for-dev

## Story

As a Client,
I want to view invoices and manage my profile,
so that I can track my finances and keep my contact information updated.

## Acceptance Criteria (ACs)

1. My Invoices page displays a list of fee notes/invoices with columns: fee note number, date, due date, amount (KES), status (badge), and balance due.
2. Invoices can be filtered by status (Draft/Sent/Paid/Partial/Overdue/Void) and by date range.
3. Invoice detail page displays: header (firm info, fee note number, date, due date), client info, case reference, line items table (description, quantity, unit price, total), subtotal, VAT amount, total, payment history list, and balance due.
4. Client can download the fee note/invoice as a PDF from the detail page.
5. Invoice detail page displays payment instructions including: bank details (bank name, account name, account number, branch, Swift code) and M-Pesa Paybill/Till number, as configured in firm settings.
6. No edit capability exists on any invoice page; there are no edit, delete, or payment recording buttons.
7. Overdue invoices are visually highlighted (red text, red badge, or red border) on the list page.
8. Profile management page allows the client to update their contact information: phone number, email, physical address, postal address.
9. Profile management page allows the client to change their password (current password required, new password with confirmation, min 8 chars with uppercase + lowercase + number).
10. Profile page displays the client's KYC verification status as a read-only badge (Pending/Verified/Expired/Rejected); clients cannot edit KYC status.
11. All monetary amounts are displayed in KES format with comma separators.

## Tasks / Subtasks

- [ ] **Task 1: Build My Invoices List Page** (AC 1, AC 2, AC 7, AC 11)
  - [ ] Create `src/app/(portal)/portal/invoices/page.tsx`
  - [ ] Create `src/lib/queries/portal-invoices.ts` with `getClientInvoices(clientId, filters?)` returning fee note number, date, due date, amount, status, balance
  - [ ] Display invoices in a table or card list with shadcn Badge for status
  - [ ] Implement status filter dropdown (Draft, Sent, Paid, Partial, Overdue, Void)
  - [ ] Implement date range filter with date pickers
  - [ ] Highlight overdue invoices: apply red styling (red text on amount, red badge, or red left border) when status is "Overdue" or due date is past and not fully paid
  - [ ] Format all KES amounts using the shared currency formatter
  - [ ] Add empty state: "No invoices found"

- [ ] **Task 2: Build Invoice Detail Page** (AC 3, AC 4, AC 5, AC 6, AC 11)
  - [ ] Create `src/app/(portal)/portal/invoices/[id]/page.tsx`
  - [ ] Create `src/lib/queries/portal-invoice-detail.ts` with `getClientInvoiceDetail(invoiceId, clientId)` returning full invoice with line items and payment history
  - [ ] Display invoice header: firm name, address, KRA PIN (from `firm_settings`), fee note number, date, due date
  - [ ] Display client info: name, address, KRA PIN
  - [ ] Display case reference: case number and title
  - [ ] Display line items table: description, quantity, unit price (KES), line total (KES)
  - [ ] Display totals section: subtotal, VAT (16% or per line), total, amount paid, balance due
  - [ ] Display payment history: list of payments with date, amount, method, reference
  - [ ] Display payment instructions section:
    - Bank details from `firm_settings`: bank name, account name, account number, branch, Swift code
    - M-Pesa: Paybill/Till number from `firm_settings`
  - [ ] Add "Download PDF" button that triggers PDF download via API
  - [ ] No edit, delete, or "Record Payment" buttons on the page
  - [ ] Return 404 if invoice does not belong to the authenticated client

- [ ] **Task 3: Invoice PDF Download Endpoint** (AC 4)
  - [ ] Create or update `src/app/api/invoices/[id]/pdf/route.ts` with client-scoped access check
  - [ ] Verify session, role is Client, invoice belongs to this client
  - [ ] Generate or retrieve the fee note PDF (using jsPDF or @react-pdf/renderer)
  - [ ] Return PDF with `Content-Type: application/pdf` and `Content-Disposition: attachment` headers

- [ ] **Task 4: Build Profile Management Page** (AC 8, AC 9, AC 10)
  - [ ] Create `src/app/(portal)/portal/profile/page.tsx`
  - [ ] Create `src/lib/queries/portal-profile.ts` with `getClientProfile(clientId)` returning client details and KYC status
  - [ ] Display profile form (react-hook-form + Zod) with editable fields: phone (+254 validated), email, physical address, postal address (P.O. Box)
  - [ ] Create `src/lib/validators/portal-profile.ts` with Zod schema for profile update (phone regex for +254, email format)
  - [ ] Create `src/lib/actions/portal-profile.ts` with `updateClientProfile(formData)` server action
  - [ ] Build password change form: current password (required), new password (min 8 chars, uppercase + lowercase + number), confirm password (must match)
  - [ ] Create `src/lib/validators/change-password.ts` with Zod schema for password change
  - [ ] Create `src/lib/actions/change-password.ts` with `changePassword(formData)` server action that verifies current password with bcrypt, hashes new password, updates `users` table
  - [ ] Display KYC status badge (Pending = yellow, Verified = green, Expired = orange, Rejected = red) as read-only; no edit controls for KYC
  - [ ] Show toast notifications on successful update or error

- [ ] **Task 5: Firm Settings Data for Payment Instructions** (AC 5)
  - [ ] Create `src/lib/queries/firm-settings.ts` (if not existing) with `getFirmPaymentDetails()` returning bank details and M-Pesa info from `firm_settings` table
  - [ ] Ensure the query retrieves: bank name, account name, account number, branch, Swift code, M-Pesa Paybill/Till number

## Dev Notes

- **Architecture:** Invoice pages use Server Components for initial data fetch. Profile page uses a Client Component form with react-hook-form for the editable sections, submitting via Server Actions.
- **PDF Generation:** Use jsPDF or @react-pdf/renderer for invoice PDF generation. The PDF layout should match the Kenya fee note format defined in Epic 11.2 (firm logo, KRA PIN, line items, VAT breakdown, payment details). Consider reusing a shared PDF generation function from `src/lib/utils/pdf.ts`.
- **Firm Settings:** Payment instruction data (bank details, M-Pesa) is stored as key-value pairs in the `firm_settings` table. Query these at render time for the invoice detail page.
- **Password Validation:** Password requirements: minimum 8 characters, at least one uppercase letter, one lowercase letter, and one number. The Zod schema should enforce this regex: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/`.
- **Phone Validation:** Kenya phone format: `+254` followed by 9 digits. Zod regex: `/^\+254\d{9}$/`.
- **Security:** All queries must scope by `clientId` from the session. The invoice PDF endpoint must verify ownership. Profile update action must verify the session user matches the target client.
- **KES Formatting:** Reuse the shared `formatCurrency()` utility. Example output: "KES 1,250,000.00".

### Project Structure Notes

**Files to Create:**
- `src/app/(portal)/portal/invoices/page.tsx` — My Invoices list page
- `src/app/(portal)/portal/invoices/[id]/page.tsx` — Invoice detail page
- `src/app/(portal)/portal/profile/page.tsx` — Profile management page
- `src/lib/queries/portal-invoices.ts` — Client invoices query functions
- `src/lib/queries/portal-invoice-detail.ts` — Invoice detail with line items and payments
- `src/lib/queries/portal-profile.ts` — Client profile query
- `src/lib/queries/firm-settings.ts` — Firm payment details query (if not existing)
- `src/lib/validators/portal-profile.ts` — Zod schema for profile update
- `src/lib/validators/change-password.ts` — Zod schema for password change
- `src/lib/actions/portal-profile.ts` — Server Action for profile update
- `src/lib/actions/change-password.ts` — Server Action for password change

**Files to Modify:**
- `src/app/api/invoices/[id]/pdf/route.ts` — Add client role access check (create if not existing)

### References

- [Source: epics.md — Epic 13, Story 13.3: Portal Invoice Viewing & Profile]
- [Source: a.md — Module 11: Client Portal — Invoice viewing, Profile management]
- [Source: a.md — Module 9: Billing & Invoicing — Invoice PDF Layout, Form Fields]
- [Source: a.md — Module 18: Financial Management — Fee Notes, M-Pesa Payment Integration, Kenya Payment Methods]
- [Source: a.md — Module 14: Settings & Configuration — Firm Settings]
- [Source: epics.md — Epic 11.2: Kenya VAT Handling & Fee Note PDF]

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
