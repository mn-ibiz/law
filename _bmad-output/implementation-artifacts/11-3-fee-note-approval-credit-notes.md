# Story 11.3: Fee Note Approval Workflow & Credit Notes

Status: ready-for-dev

## Story

As a Partner/Admin,
I want fee notes to go through approval,
so that billing accuracy is ensured.

## Acceptance Criteria (ACs)

1. Fee note approval workflow: Draft -> Pending Approval -> Approved (-> Sent) / Rejected (-> Draft with rejection notes)
2. Approve and Reject buttons visible to Partners and Admins on fee notes in "Pending Approval" status
3. Rejection requires notes explaining the reason, which are attached to the fee note record
4. Notifications sent on approval and rejection events to the fee note creator
5. Credit Notes: created linked to an original fee note, with auto-generated number CN-YYYY-NNNN
6. Credit note creation with fields: reason (Billing Error/Discount/Partial Write-off/Full Write-off/Other), amount (KES), description
7. Credit note amount reduces the outstanding balance on the original fee note
8. Credit note PDF generation
9. Invoice aging report: Current / 30 days / 60 days / 90+ days outstanding, grouped by client, with collection rate percentage, average days to payment, and write-off summary

## Tasks / Subtasks

- [ ] **Task 1: Update fee note status workflow** (AC 1)
  - [ ] Modify `src/lib/actions/fee-notes.ts`
  - [ ] Add `submitForApproval(id)` — changes status from Draft to Pending Approval, notifies partners/admins
  - [ ] Add `approveFeeNote(id)` — check partner/admin role, change status to Approved, notify creator, audit log
  - [ ] Add `rejectFeeNote(id, notes)` — check partner/admin role, require notes, change status back to Draft with rejection notes stored, notify creator, audit log
  - [ ] Update `sendFeeNote(id)` — can only send when status is Approved (not directly from Draft)
  - [ ] Add status transition validation to enforce: Draft -> Pending Approval -> Approved -> Sent or Pending Approval -> Rejected (-> Draft)

- [ ] **Task 2: Zod schemas for credit notes** (AC 5, 6)
  - [ ] Add to `src/lib/validators/billing.ts`:
  - [ ] `creditNoteSchema`: fee note ID (required), reason enum (Billing Error/Discount/Partial Write-off/Full Write-off/Other), amount (required, positive, cannot exceed outstanding balance), description (required)

- [ ] **Task 3: Server actions for credit notes** (AC 5, 6, 7)
  - [ ] Create `src/lib/actions/credit-notes.ts`
  - [ ] `createCreditNote(data)` — validate, check amount does not exceed fee note outstanding balance, generate CN-YYYY-NNNN number, insert record, update fee note outstanding balance, audit log
  - [ ] `getCreditNotesByFeeNote(feeNoteId)` — for display on fee note detail
  - [ ] Add CN number generation to `src/lib/utils/numbering.ts`

- [ ] **Task 4: Data queries for credit notes and aging** (AC 5, 9)
  - [ ] Add to `src/lib/queries/fee-notes.ts`:
  - [ ] `getCreditNotes(filters)` — paginated, filterable by fee note, client, date range
  - [ ] `getCreditNoteById(id)` — full details
  - [ ] Create `src/lib/queries/billing-reports.ts`:
  - [ ] `getInvoiceAgingReport(filters)` — calculates aging buckets (Current, 1-30, 31-60, 61-90, 90+) based on due date vs today
  - [ ] `getCollectionRate(dateRange)` — (total paid / total invoiced) * 100
  - [ ] `getAverageDaysToPayment(dateRange)` — average difference between payment date and invoice date
  - [ ] `getWriteOffSummary(dateRange)` — total credit notes by reason type

- [ ] **Task 5: Approval UI on fee note detail page** (AC 1, 2, 3, 4)
  - [ ] Modify `src/app/(dashboard)/billing/fee-notes/[id]/page.tsx`
  - [ ] Add "Submit for Approval" button (visible to creator when status is Draft)
  - [ ] Add "Approve" button (visible to partner/admin when status is Pending Approval)
  - [ ] Add "Reject" button (visible to partner/admin when status is Pending Approval) — opens Dialog with required notes textarea
  - [ ] Display rejection notes on fee note detail when status is Draft after rejection (alert banner)
  - [ ] Approval status timeline showing who submitted, approved, or rejected with timestamps

- [ ] **Task 6: Credit note form and UI** (AC 5, 6, 7)
  - [ ] Create `src/components/forms/credit-note-form.tsx`
  - [ ] Fields: reason dropdown, amount (KES, max = outstanding balance), description textarea
  - [ ] Display original fee note number and current outstanding balance
  - [ ] Accessible from fee note detail page via "Create Credit Note" button
  - [ ] Add credit notes section to fee note detail page showing list of linked credit notes

- [ ] **Task 7: Credit note PDF generation** (AC 8)
  - [ ] Create `src/lib/utils/credit-note-pdf.ts`
  - [ ] PDF layout: firm header (same as fee note), "CREDIT NOTE" title, CN number, date, original fee note reference, client details, reason, amount (KES), description, firm signature/authorized by
  - [ ] API route: `src/app/api/billing/credit-notes/[id]/pdf/route.ts`

- [ ] **Task 8: Invoice aging report page** (AC 9)
  - [ ] Create `src/app/(dashboard)/reports/billing-aging/page.tsx`
  - [ ] Summary cards: total outstanding, total overdue, collection rate %, avg days to payment
  - [ ] Aging table: client name, current, 1-30 days, 31-60 days, 61-90 days, 90+ days, total outstanding
  - [ ] Color coding: current=green, 30=yellow, 60=orange, 90+=red
  - [ ] Write-off summary section: total write-offs by reason (Billing Error, Discount, Partial Write-off, Full Write-off, Other)
  - [ ] Filters: date range, client, attorney
  - [ ] CSV export button
  - [ ] Print-friendly CSS for the report

- [ ] **Task 9: Notification integration** (AC 4)
  - [ ] Create in-app notifications for:
    - [ ] Fee note submitted for approval (to partners/admins)
    - [ ] Fee note approved (to creator)
    - [ ] Fee note rejected (to creator, including rejection reason)
  - [ ] Use existing notification system from Epic 14 if available, or create notification records directly

## Dev Notes

- The approval workflow adds a step between Draft and Sent; this is standard practice in Kenyan law firms where a Partner must review fee notes before they go to clients
- Partners are identified by the attorney `title` field being "Partner"; Admins always have approval rights
- Rejection notes should be stored as a JSON array on the fee note record to track multiple rejection/resubmission cycles
- Credit note amounts must be validated server-side: the total of all credit notes for a fee note cannot exceed the original fee note total
- The aging report is one of the most important financial reports; it should be accessible from both the Reports section and the Billing section
- Collection rate formula: `(total_payments_received / total_fee_notes_sent) * 100` for the given date range
- Average days to payment: `AVG(payment_date - fee_note_date)` for paid fee notes in the date range
- Write-off tracking uses credit note reasons; "Full Write-off" and "Partial Write-off" are classified as write-offs for reporting
- The aging report should calculate buckets based on due date, not invoice date: Current = not yet due, 30 = 1-30 days past due, etc.

### Project Structure Notes

Files to create:
- `src/lib/actions/credit-notes.ts` — credit note server actions
- `src/lib/queries/billing-reports.ts` — aging report and billing analytics queries
- `src/lib/utils/credit-note-pdf.ts` — credit note PDF generation
- `src/app/api/billing/credit-notes/[id]/pdf/route.ts` — credit note PDF API route
- `src/components/forms/credit-note-form.tsx` — credit note form
- `src/app/(dashboard)/reports/billing-aging/page.tsx` — aging report page

Files to modify:
- `src/lib/actions/fee-notes.ts` — add approval workflow actions
- `src/lib/validators/billing.ts` — add credit note schema
- `src/lib/utils/numbering.ts` — add CN number generation
- `src/app/(dashboard)/billing/fee-notes/[id]/page.tsx` — add approval buttons, credit notes section

### References

- [Source: a.md - Module 9: Billing & Invoicing — Invoice aging, credit notes/write-offs]
- [Source: a.md - Module 18: Financial Management — Fee note approval workflow]
- [Source: epics.md - Epic 11, Story 11.3]
- [Source: a.md - Module 13: Reports & Analytics — Billing & AR Report]

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
