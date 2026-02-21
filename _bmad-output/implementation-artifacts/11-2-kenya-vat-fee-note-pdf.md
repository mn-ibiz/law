# Story 11.2: Kenya VAT Handling & Fee Note PDF

Status: ready-for-dev

## Story

As an Admin/Attorney,
I want correct Kenya VAT and professional PDFs,
so that billing complies with KRA.

## Acceptance Criteria (ACs)

1. VAT applied at 16% standard rate for applicable line items
2. Per-line item tax treatment: Standard (16%), Exempt, Zero-rated — selectable on each line item
3. Professional fees are VAT-applicable by default; disbursements may be exempt
4. Separate subtotals displayed: taxable amount, exempt amount, and VAT amount
5. Firm KRA PIN displayed on every fee note
6. Fee Note PDF layout containing: firm logo + name + address + KRA PIN, fee note number + date + due date, client name + address + KRA PIN, case reference, line items table with columns, subtotal/VAT/total, amount paid/balance due, payment terms, bank details, M-Pesa Paybill/Till number, notes, footer
7. PDF actions: download as file, preview in browser, and email (placeholder that prepares the email but uses a future email integration)
8. Receipt PDF generation with number format RC-YYYY-NNNN
9. All amounts displayed in KES with proper formatting throughout

## Tasks / Subtasks

- [ ] **Task 1: VAT calculation engine** (AC 1, 2, 3, 4)
  - [ ] Create `src/lib/utils/vat.ts`
  - [ ] `calculateLineItemTax(unitPrice, qty, taxTreatment): { amount, taxAmount, total }` — applies 16% for Standard, 0 for Exempt/Zero-rated
  - [ ] `calculateFeeNoteTotals(lineItems): { taxableSubtotal, exemptSubtotal, zeroRatedSubtotal, vatAmount, grandTotal }` — aggregates across all items
  - [ ] `VAT_RATE = 0.16` constant
  - [ ] Default tax treatment rules: Professional Fees -> Standard, Disbursements -> Exempt (configurable)

- [ ] **Task 2: Update fee note form with VAT controls** (AC 2, 3, 4)
  - [ ] Modify `src/components/forms/fee-note-form.tsx` (from Story 11.1)
  - [ ] Add tax treatment dropdown per line item (Standard 16% / Exempt / Zero-rated)
  - [ ] Auto-set default tax treatment based on line item type
  - [ ] Display per-line tax amount column
  - [ ] Totals section: taxable subtotal, exempt subtotal, VAT @ 16%, grand total
  - [ ] Live recalculation on any line item change

- [ ] **Task 3: Fee Note PDF generation** (AC 5, 6, 9)
  - [ ] Create `src/lib/utils/fee-note-pdf.ts`
  - [ ] Use `jsPDF` or `@react-pdf/renderer` for PDF generation
  - [ ] PDF layout sections:
    - [ ] **Header**: firm logo (from firm_settings), firm name, physical address, P.O. Box, phone, email, KRA PIN
    - [ ] **Fee Note Info**: number (FN-YYYY-NNNN), date (DD/MM/YYYY format), due date
    - [ ] **Client Info**: client name, address, KRA PIN (if available)
    - [ ] **Case Reference**: case number and title
    - [ ] **Line Items Table**: columns — Description, Qty, Unit Price (KES), Tax, Amount (KES)
    - [ ] **Totals**: Taxable Subtotal, Exempt Subtotal, VAT @ 16%, **Total Due (KES)** (bold, larger)
    - [ ] **Payments**: Amount Paid, **Balance Due** (bold)
    - [ ] **Payment Terms**: from fee note or firm default
    - [ ] **Bank Details**: bank name, account name, account number, branch, Swift code (from firm_settings)
    - [ ] **M-Pesa Details**: Paybill/Till number (from firm_settings)
    - [ ] **Notes**: any fee note-specific notes
    - [ ] **Footer**: "This is a computer-generated document" or firm-specific footer text
  - [ ] KES formatting with thousands separators throughout the PDF

- [ ] **Task 4: Receipt PDF generation** (AC 8, 9)
  - [ ] Create `src/lib/utils/receipt-pdf.ts`
  - [ ] Receipt PDF layout:
    - [ ] Firm header (same as fee note)
    - [ ] "OFFICIAL RECEIPT" title
    - [ ] Receipt number (RC-YYYY-NNNN)
    - [ ] Date of receipt
    - [ ] Received from (client name)
    - [ ] Amount in words and figures (KES)
    - [ ] Payment method and reference
    - [ ] For (fee note reference)
    - [ ] Received by (user name)
    - [ ] Firm stamp area / authorized signature line
  - [ ] Amount-to-words utility for KES

- [ ] **Task 5: KES amount-to-words utility** (AC 9)
  - [ ] Add to `src/lib/utils/currency.ts`
  - [ ] `amountToWords(amount: number): string` — e.g., 150000 -> "Kenya Shillings One Hundred and Fifty Thousand Only"
  - [ ] `formatKES(amount: number): string` — standard KES formatting helper
  - [ ] Handle cents/decimal amounts

- [ ] **Task 6: PDF preview and download actions** (AC 7)
  - [ ] Create API route `src/app/api/billing/fee-notes/[id]/pdf/route.ts`
  - [ ] GET request returns PDF as response with `Content-Type: application/pdf`
  - [ ] Query param `?action=download` sets `Content-Disposition: attachment`
  - [ ] Query param `?action=preview` sets `Content-Disposition: inline`
  - [ ] Auth check: user must have access to this fee note

- [ ] **Task 7: Receipt PDF API route** (AC 8)
  - [ ] Create API route `src/app/api/billing/receipts/[id]/pdf/route.ts`
  - [ ] Same download/preview pattern as fee note PDF

- [ ] **Task 8: PDF action buttons on fee note detail** (AC 7)
  - [ ] Add to `src/app/(dashboard)/billing/fee-notes/[id]/page.tsx`:
  - [ ] "Download PDF" button — triggers download
  - [ ] "Preview PDF" button — opens in new tab
  - [ ] "Email Fee Note" button — placeholder that shows toast "Email integration coming soon" or prepares mailto: link with subject and attachment reference

- [ ] **Task 9: Firm settings integration** (AC 5, 6)
  - [ ] Create `src/lib/queries/firm-settings.ts` (if not already created)
  - [ ] `getFirmSettings()` — fetch all settings for PDF generation
  - [ ] Required settings: firm name, address, phone, email, logo URL, KRA PIN, bank details (name, account name, number, branch, Swift), M-Pesa Paybill/Till number, default payment terms, default tax rate
  - [ ] Ensure firm settings page (Epic 18) includes all these fields

## Dev Notes

- Kenya VAT is 16% as of 2026; this should be configurable via firm settings but default to 16%
- The Kenya Revenue Authority (KRA) requires the supplier's (firm's) KRA PIN on all tax invoices/fee notes; the client's KRA PIN is optional but recommended for B2B billing
- Date format on PDFs should be DD/MM/YYYY per Kenya convention, not US format
- For `jsPDF`, use the `autoTable` plugin for the line items table; for `@react-pdf/renderer`, define a React component that renders as PDF
- `jsPDF` is recommended over `@react-pdf/renderer` for server-side generation in API routes since it does not require a React rendering context
- The firm logo in the PDF should be loaded from the stored URL; handle cases where no logo is uploaded (text-only header)
- M-Pesa Paybill/Till number display on the PDF is critical — many Kenyan clients pay via M-Pesa and need this information on the fee note
- Receipt PDFs are generated automatically when payments are recorded (Story 11.4)
- All currency: KES (Kenya Shillings). No multi-currency support needed for now.

### Project Structure Notes

Files to create:
- `src/lib/utils/vat.ts` — VAT calculation engine
- `src/lib/utils/fee-note-pdf.ts` — fee note PDF generation
- `src/lib/utils/receipt-pdf.ts` — receipt PDF generation
- `src/lib/utils/currency.ts` — KES formatting and amount-to-words
- `src/app/api/billing/fee-notes/[id]/pdf/route.ts` — fee note PDF API
- `src/app/api/billing/receipts/[id]/pdf/route.ts` — receipt PDF API
- `src/lib/queries/firm-settings.ts` — firm settings queries (if not exists)

Files to modify:
- `src/components/forms/fee-note-form.tsx` — add VAT controls per line item
- `src/app/(dashboard)/billing/fee-notes/[id]/page.tsx` — add PDF action buttons
- `src/lib/validators/billing.ts` — add tax treatment to line item schema

### References

- [Source: a.md - Module 9: Billing & Invoicing — Invoice PDF Layout]
- [Source: a.md - Module 18: Financial Management — Kenya VAT handling, Fee Note details]
- [Source: epics.md - Epic 11, Story 11.2]
- [Source: a.md - Kenya Legal Requirements: #9 KRA Compliance — VAT at 16%]
- [Source: a.md - Feature Gap Analysis: #2 KES Currency + VAT 16%]

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
