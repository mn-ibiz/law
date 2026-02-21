# Story 11.1: Quotes & Fee Note Generation

Status: ready-for-dev

## Story

As an Admin/Attorney,
I want to create quotes and fee notes with auto-populated items,
so that billing follows the Kenya Quote -> Fee Note -> Receipt workflow.

## Acceptance Criteria (ACs)

1. Quotes page with list, create functionality: client, case, itemized line items, subtotal, tax, total, validity period, notes
2. Quote status workflow: Draft -> Sent -> Accepted -> Rejected -> Converted
3. Quote PDF generation with firm branding
4. "Convert to Fee Note" button on accepted quotes that creates a fee note pre-populated with quote line items
5. Fee Notes page with list showing: fee note number (FN-YYYY-NNNN), client, case, date, due date, amount (KES), status, amount paid
6. New fee note form: client (required), case (required), date, due date (default +30 days from date), billing type auto-filled from case settings
7. "Pull Unbilled Items" button that auto-populates line items from unbilled time entries and expenses for the selected case
8. Line items with fields: description, quantity, unit price (KES), total (auto-calculated), linked source (time entry or expense reference)
9. Kenya-specific line item types: Professional Fees, Disbursements, Instruction Fees, Filing Fees, Commissioner for Oaths Fees, Search Fees, Stamp Duty
10. Fee note status workflow: Draft -> Sent -> Paid/Partial/Overdue -> Void
11. Time entries and expenses automatically marked as "Invoiced" when included in a fee note

## Tasks / Subtasks

- [ ] **Task 1: Zod validation schemas for quotes and fee notes** (AC 1, 6, 8, 9)
  - [ ] Create `src/lib/validators/billing.ts`
  - [ ] `quoteSchema`: client ID (required), case ID (required), line items array, validity date, notes, status
  - [ ] `feeNoteSchema`: client ID (required), case ID (required), date (default today), due date (default +30), billing type, notes, payment terms
  - [ ] `lineItemSchema`: description (required), quantity (default 1, positive), unit price (KES, positive), item type enum (Professional Fees/Disbursements/Instruction Fees/Filing Fees/Commissioner for Oaths Fees/Search Fees/Stamp Duty), tax treatment (Standard 16%/Exempt/Zero-rated), linked_time_entry_id (optional), linked_expense_id (optional)

- [ ] **Task 2: Auto-number generation utility** (AC 5)
  - [ ] Create or add to `src/lib/utils/numbering.ts`
  - [ ] `generateFeeNoteNumber()` — format FN-YYYY-NNNN, queries last number and increments
  - [ ] `generateQuoteNumber()` — format QT-YYYY-NNNN
  - [ ] `generateReceiptNumber()` — format RC-YYYY-NNNN (used in Story 11.4)
  - [ ] Ensure uniqueness with DB constraint and retry logic

- [ ] **Task 3: Server actions for quotes** (AC 1, 2, 3, 4)
  - [ ] Create `src/lib/actions/quotes.ts`
  - [ ] `createQuote(data)` — validate, generate number, insert quote + line items, audit log
  - [ ] `updateQuote(id, data)` — check Draft status, validate, update, audit log
  - [ ] `sendQuote(id)` — update status to Sent, create notification, audit log
  - [ ] `acceptQuote(id)` — update status to Accepted, audit log
  - [ ] `rejectQuote(id, reason)` — update status to Rejected, audit log
  - [ ] `convertQuoteToFeeNote(quoteId)` — validate Accepted status, create fee note with quote line items, update quote status to Converted, audit log

- [ ] **Task 4: Server actions for fee notes** (AC 5, 6, 7, 10, 11)
  - [ ] Create `src/lib/actions/fee-notes.ts`
  - [ ] `createFeeNote(data)` — validate, generate FN-YYYY-NNNN number, insert with line items, audit log
  - [ ] `updateFeeNote(id, data)` — check Draft status, validate, update, audit log
  - [ ] `addLineItem(feeNoteId, item)` — add single line item, recalculate totals
  - [ ] `removeLineItem(feeNoteId, lineItemId)` — remove item, recalculate totals
  - [ ] `pullUnbilledItems(feeNoteId, caseId)` — fetch unbilled time entries + expenses, create line items for each, link source IDs
  - [ ] `sendFeeNote(id)` — update status to Sent, create notification, audit log
  - [ ] `voidFeeNote(id, reason)` — update status to Void, unlink time entries/expenses (reset invoiced flag), audit log
  - [ ] `markTimeEntriesAndExpensesInvoiced(feeNoteId)` — called on send, marks all linked entries as invoiced

- [ ] **Task 5: Data queries for quotes and fee notes** (AC 1, 5)
  - [ ] Create `src/lib/queries/quotes.ts`
  - [ ] `getQuotes(filters)` — paginated, filterable by status, client, case, date range
  - [ ] `getQuoteById(id)` — full details with line items
  - [ ] Create `src/lib/queries/fee-notes.ts`
  - [ ] `getFeeNotes(filters)` — paginated, filterable by status, client, case, date range, overdue flag
  - [ ] `getFeeNoteById(id)` — full details with line items, payments, linked time entries/expenses
  - [ ] `getFeeNotesByClient(clientId)` — for client billing tab and portal
  - [ ] `getFeeNotesByCase(caseId)` — for case billing tab
  - [ ] `getOverdueFeeNotes()` — fee notes past due date with outstanding balance

- [ ] **Task 6: Quotes list page** (AC 1, 2)
  - [ ] Create `src/app/(dashboard)/billing/quotes/page.tsx`
  - [ ] DataTable columns: quote number, client (link), case (link), date, validity, subtotal (KES), tax (KES), total (KES), status badge, actions
  - [ ] Filter bar: status, client, case, date range
  - [ ] Status badge colors: Draft=gray, Sent=blue, Accepted=green, Rejected=red, Converted=purple
  - [ ] "New Quote" button

- [ ] **Task 7: Quote form** (AC 1, 8, 9)
  - [ ] Create `src/components/forms/quote-form.tsx`
  - [ ] Client combobox (required), case combobox (required, filtered by client)
  - [ ] Validity date picker
  - [ ] Dynamic line items table with add/remove rows
  - [ ] Each row: item type dropdown, description, quantity, unit price (KES), total (auto), tax treatment
  - [ ] Subtotal, tax, total calculated in real-time
  - [ ] Notes textarea
  - [ ] Full-page form or large Dialog

- [ ] **Task 8: Fee notes list page** (AC 5)
  - [ ] Create `src/app/(dashboard)/billing/fee-notes/page.tsx`
  - [ ] DataTable columns: number (FN-YYYY-NNNN), client (link), case (link), date, due date, amount (KES), paid (KES), balance (KES), status badge, actions
  - [ ] Filter bar: status, client, case, date range, overdue toggle
  - [ ] Status badge colors: Draft=gray, Sent=blue, Partial=orange, Paid=green, Overdue=red, Void=gray strikethrough
  - [ ] Overdue highlighting (row background)
  - [ ] Summary cards: total outstanding, total overdue, total collected this month
  - [ ] "New Fee Note" button

- [ ] **Task 9: Fee note form with pull unbilled items** (AC 6, 7, 8, 9)
  - [ ] Create `src/components/forms/fee-note-form.tsx`
  - [ ] Client combobox (required), case combobox (required)
  - [ ] Date picker, due date picker (auto-sets +30 days)
  - [ ] Billing type display (auto-filled from case)
  - [ ] **"Pull Unbilled Items" button**: fetches unbilled time entries and expenses for the case, creates line items automatically
  - [ ] Dynamic line items table: item type, description, quantity, unit price, tax treatment, total, source reference (read-only badge showing "Time Entry" or "Expense")
  - [ ] Add/remove manual line items
  - [ ] Subtotal, VAT calculation (per Story 11.2), total
  - [ ] Payment terms text area (default from firm settings)
  - [ ] Notes textarea

- [ ] **Task 10: Fee note detail page** (AC 5, 10)
  - [ ] Create `src/app/(dashboard)/billing/fee-notes/[id]/page.tsx`
  - [ ] Header: fee note number, status badge, status action buttons
  - [ ] Client and case info cards
  - [ ] Line items table with full details
  - [ ] Subtotal / VAT / Total section
  - [ ] Payment history table (populated by Story 11.4)
  - [ ] Balance due display (prominent)
  - [ ] Actions: Edit (if Draft), Send, Void, Record Payment (Story 11.4), Generate PDF (Story 11.2), Create Credit Note (Story 11.3)

- [ ] **Task 11: Billing navigation setup** (AC 1, 5)
  - [ ] Create `src/app/(dashboard)/billing/page.tsx` — billing overview/landing page or redirect to fee notes
  - [ ] Add billing section to sidebar nav: Quotes, Fee Notes, Payments (Story 11.4)

## Dev Notes

- "Fee Note" is the Kenya-standard term for invoice; the system should use "Fee Note" everywhere in the UI, while the database table can still be named `invoices` for compatibility
- The "Pull Unbilled Items" feature is critical for attorney productivity — it should query all time entries and expenses for the selected case that are not yet linked to any fee note
- Line item types map to Kenya billing conventions: Professional Fees = attorney time, Disbursements = out-of-pocket expenses, Instruction Fees = initial engagement fee, Filing Fees = court filing costs, etc.
- Tax treatment per line item will be fully implemented in Story 11.2; this story should include the field but can default to Standard 16%
- When a fee note is voided, all linked time entries and expenses must have their `invoiced` flag reset so they can be included in a new fee note
- The billing type from the case determines behavior: Hourly cases pull time entries, Flat Fee cases have a single line item, Contingency cases calculate from settlement amount, Retainer draws from trust
- All KES formatting: `new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' })`
- Fee note numbers are globally unique and auto-incremented per calendar year

### Project Structure Notes

Files to create:
- `src/lib/validators/billing.ts` — Zod schemas for quotes, fee notes, line items
- `src/lib/utils/numbering.ts` — auto-number generation (FN, QT, RC, PO)
- `src/lib/actions/quotes.ts` — quote server actions
- `src/lib/actions/fee-notes.ts` — fee note server actions
- `src/lib/queries/quotes.ts` — quote data queries
- `src/lib/queries/fee-notes.ts` — fee note data queries
- `src/app/(dashboard)/billing/page.tsx` — billing landing page
- `src/app/(dashboard)/billing/quotes/page.tsx` — quotes list page
- `src/app/(dashboard)/billing/fee-notes/page.tsx` — fee notes list page
- `src/app/(dashboard)/billing/fee-notes/[id]/page.tsx` — fee note detail page
- `src/components/forms/quote-form.tsx` — quote form
- `src/components/forms/fee-note-form.tsx` — fee note form

Files to modify:
- `src/lib/actions/time-entries.ts` — add `markAsInvoiced` capability
- `src/lib/actions/expenses.ts` — add `markAsInvoiced` capability
- `src/app/(dashboard)/layout.tsx` — add billing section nav items

### References

- [Source: a.md - Module 9: Billing & Invoicing]
- [Source: a.md - Module 18: Financial Management — Fee Notes, Quotes workflow]
- [Source: epics.md - Epic 11, Story 11.1]
- [Source: a.md - Feature Gap Analysis: #8 Fee Notes + Quotes]

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
