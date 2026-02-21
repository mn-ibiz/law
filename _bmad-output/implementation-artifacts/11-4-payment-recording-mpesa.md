# Story 11.4: Payment Recording & M-Pesa Integration

Status: ready-for-dev

## Story

As an Admin/Attorney,
I want to record payments including M-Pesa,
so that revenue is tracked and reconcilable.

## Acceptance Criteria (ACs)

1. Record payment from fee note detail: amount in KES (default to outstanding balance), date, payment method (M-Pesa/Bank Transfer-RTGS-EFT/Cheque/Cash/Pesalink/Credit Card/Trust Account Drawdown), reference number
2. M-Pesa specific fields shown when M-Pesa is selected: transaction code (required, alphanumeric ~10 characters), phone number (+254 format)
3. Partial payments supported with running balance calculation; fee note status auto-updates to Partial when partially paid, Paid when fully paid
4. Payment list page showing all payments across all fee notes
5. M-Pesa configuration in firm settings: Paybill number and/or Till number (displayed on fee note PDFs)
6. Receipt auto-generation with number format RC-YYYY-NNNN when payment is recorded
7. Payment reversal (admin only) with required reason, which restores the fee note outstanding balance
8. Trust Account Drawdown: when selected as payment method, deducts from the client's trust account balance

## Tasks / Subtasks

- [ ] **Task 1: Zod validation schemas for payments** (AC 1, 2)
  - [ ] Create `src/lib/validators/payments.ts`
  - [ ] `paymentSchema`: fee note ID (required), amount (required, positive, cannot exceed outstanding balance), date (required, defaults today), payment method enum (M-Pesa/Bank Transfer/Cheque/Cash/Pesalink/Credit Card/Trust Account Drawdown), reference number (required for non-cash methods)
  - [ ] Conditional validation: if method is M-Pesa, require `mpesa_transaction_code` (alphanumeric, 10 chars) and `mpesa_phone` (+254 format)
  - [ ] Conditional validation: if method is Trust Account Drawdown, require `trust_account_id`
  - [ ] `paymentReversalSchema`: payment ID, reason (required, min 10 chars)

- [ ] **Task 2: Server actions for payment recording** (AC 1, 2, 3, 6, 8)
  - [ ] Create `src/lib/actions/payments.ts`
  - [ ] `recordPayment(data)` — validate, check amount does not exceed outstanding balance, insert payment record, update fee note paid amount and status (Partial/Paid), auto-generate receipt (RC-YYYY-NNNN), audit log
  - [ ] If M-Pesa: validate and store transaction code + phone
  - [ ] If Trust Account Drawdown: call trust withdrawal action (from Story 12.1), validate sufficient client trust balance, deduct from trust, link payment to trust transaction
  - [ ] `reversePayment(paymentId, reason)` — admin-only check, mark payment as reversed, restore fee note outstanding balance, update fee note status back to Sent/Partial, void associated receipt, create reverse trust transaction if applicable, audit log

- [ ] **Task 3: Receipt auto-generation** (AC 6)
  - [ ] Add to `src/lib/actions/payments.ts`:
  - [ ] On successful payment recording, auto-create receipt record with RC-YYYY-NNNN number
  - [ ] Receipt data: number, date, client, fee note reference, amount, payment method, reference, received by (current user)
  - [ ] Receipt PDF generated on demand using `src/lib/utils/receipt-pdf.ts` (from Story 11.2)

- [ ] **Task 4: Data queries for payments** (AC 4)
  - [ ] Create `src/lib/queries/payments.ts`
  - [ ] `getPayments(filters)` — paginated, filterable by date range, client, payment method, fee note
  - [ ] `getPaymentsByFeeNote(feeNoteId)` — for fee note detail payment history
  - [ ] `getPaymentsByClient(clientId)` — for client billing tab
  - [ ] `getPaymentById(id)` — full payment details including receipt info
  - [ ] `getReceipts(filters)` — paginated list of receipts
  - [ ] `getReceiptById(id)` — full receipt details for PDF generation

- [ ] **Task 5: Payment recording form** (AC 1, 2)
  - [ ] Create `src/components/forms/payment-form.tsx`
  - [ ] Amount input (KES, pre-filled with outstanding balance)
  - [ ] Date picker (defaults today)
  - [ ] Payment method dropdown with all 7 options
  - [ ] Reference number text input
  - [ ] **Conditional M-Pesa fields** (shown when M-Pesa selected):
    - [ ] Transaction code input (required, alphanumeric validation)
    - [ ] Phone number input with +254 prefix and formatting
  - [ ] **Conditional Trust Drawdown fields** (shown when Trust Account Drawdown selected):
    - [ ] Trust account dropdown (filtered to client's trust accounts)
    - [ ] Display current trust balance for selected account
    - [ ] Warning if amount exceeds available trust balance
  - [ ] Notes textarea
  - [ ] Form rendered in Dialog, accessible from fee note detail "Record Payment" button

- [ ] **Task 6: Payment list page** (AC 4)
  - [ ] Create `src/app/(dashboard)/billing/payments/page.tsx`
  - [ ] DataTable columns: date, receipt number (link), fee note number (link), client (link), amount (KES), method badge, reference, M-Pesa code (if applicable), status (Active/Reversed), actions
  - [ ] Filter bar: date range, client, payment method
  - [ ] Summary cards: total received this month, total received today, by payment method breakdown
  - [ ] "Record Payment" button (opens fee note selection first)

- [ ] **Task 7: Payment reversal UI** (AC 7)
  - [ ] Add "Reverse Payment" button on payment list (admin only, hidden for non-admin)
  - [ ] Reversal Dialog with required reason textarea
  - [ ] Reversed payments shown with strikethrough styling and "Reversed" badge
  - [ ] Reversal details visible: reason, reversed by, reversal date

- [ ] **Task 8: Fee note detail payment integration** (AC 1, 3)
  - [ ] Update `src/app/(dashboard)/billing/fee-notes/[id]/page.tsx`
  - [ ] Payment history section: table showing all payments (date, amount, method, reference, receipt link, status)
  - [ ] Balance summary: total amount, total paid, total credits, balance due (prominent)
  - [ ] "Record Payment" button (opens payment form Dialog)
  - [ ] Payment status badge updates: Draft/Sent/Partial/Paid/Overdue

- [ ] **Task 9: M-Pesa configuration in firm settings** (AC 5)
  - [ ] Add M-Pesa fields to firm settings form (if not already present):
    - [ ] M-Pesa Paybill Number
    - [ ] M-Pesa Till Number
    - [ ] M-Pesa Account Reference format
  - [ ] These values are displayed on fee note PDFs (Story 11.2)
  - [ ] Add query to fetch M-Pesa settings for display on payment instructions

- [ ] **Task 10: Safaricom Daraja API abstraction (future-ready)** (AC 2)
  - [ ] Create `src/lib/payments/mpesa.ts` — abstraction layer
  - [ ] Define interface: `validateTransaction(code): Promise<TransactionDetails>`, `initiateSTKPush(phone, amount, reference): Promise<STKResponse>`
  - [ ] Placeholder implementation that returns mock data
  - [ ] Environment variables: `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`, `MPESA_ENV` (sandbox/production)
  - [ ] Note: Full Daraja integration is a future enhancement; current implementation records transactions manually

- [ ] **Task 11: Trust Account Drawdown integration** (AC 8)
  - [ ] When payment method is "Trust Account Drawdown":
  - [ ] Query client's available trust balance (from Story 12.1 queries)
  - [ ] Validate sufficient funds server-side (hard block)
  - [ ] Create trust withdrawal transaction linked to this payment
  - [ ] Deduct from client's trust sub-ledger balance
  - [ ] Link payment record to trust transaction ID

## Dev Notes

- M-Pesa is the dominant payment method in Kenya; the transaction code is a unique identifier issued by Safaricom for every transaction (format: typically starts with letters followed by alphanumeric, e.g., "QHK7J9T2LP")
- Safaricom Daraja API integration for STK push (prompting the client to pay) and transaction validation is a future enhancement; this story implements manual recording of M-Pesa payments with the transaction code as proof
- The Daraja API abstraction should be structured for easy future implementation: sandbox URL `https://sandbox.safaricom.co.ke`, production URL `https://api.safaricom.co.ke`
- Trust Account Drawdown is a critical Kenya-specific feature per the Advocates (Accounts) Rules; when a client has funds in trust, the firm can draw down against a fee note rather than requiring a separate payment
- Payment reversal is admin-only and should be rare; it is used for incorrect recordings, bounced cheques, or M-Pesa transaction disputes
- Receipt auto-generation means every payment creates a receipt; receipts are never manually created
- All amounts in KES with `Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' })`
- The +254 phone format should strip leading 0 if entered as 07... and prepend +254
- Payment methods should be stored as enum values in the database; display labels can differ

### Project Structure Notes

Files to create:
- `src/lib/validators/payments.ts` — Zod schemas with conditional validation
- `src/lib/actions/payments.ts` — payment recording and reversal server actions
- `src/lib/queries/payments.ts` — payment and receipt data queries
- `src/lib/payments/mpesa.ts` — Safaricom Daraja API abstraction (future-ready)
- `src/app/(dashboard)/billing/payments/page.tsx` — payments list page
- `src/components/forms/payment-form.tsx` — payment recording form

Files to modify:
- `src/app/(dashboard)/billing/fee-notes/[id]/page.tsx` — add payment history and record payment button
- `src/app/(dashboard)/layout.tsx` — add Payments nav item under Billing
- `.env.local` — add `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`, `MPESA_ENV`

### References

- [Source: a.md - Module 9: Billing & Invoicing — Payment recording, payment methods]
- [Source: a.md - Module 18: Financial Management — M-Pesa Payment Integration, payment methods list]
- [Source: epics.md - Epic 11, Story 11.4]
- [Source: a.md - Feature Gap Analysis: #1 M-Pesa Payment Integration — MUST-HAVE]
- [Source: a.md - Kenya Legal Requirements: #4 Client Account Rules — trust drawdown]

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
