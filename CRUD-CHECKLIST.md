# CRUD Implementation Checklist

Master checklist for filling all CRUD gaps across every module.
Mark items `[x]` as they are completed.

---

## Phase 0: Foundation — Upload & Photo Infrastructure

### 0.1 Avatar/Photo Upload Endpoint
- [x] Create `POST /api/upload/avatar` route — accepts images only (JPEG, PNG, WebP), max 2MB, returns URL
- [x] Allow all authenticated roles (not just admin/attorney) to upload avatars
- [ ] Add image resize/compression (optional, deferred — not critical)

### 0.2 Schema Migrations — Add Photo Fields
- [x] Add `photoUrl text` column to `attorneys` table
- [x] Add `photoUrl text` column to `clients` table
- [x] Add `logoUrl text` column to `suppliers` table

### 0.3 Reusable Avatar Upload Component
- [x] Create `<AvatarUpload />` component (preview, click-to-upload, drag-drop, remove)
- [x] Integrate with `/api/upload/avatar` endpoint
- [x] Show current photo with fallback initials

---

## Phase 1: Profile Photo Uploads

### 1.1 User Profile — Avatar Upload
- [x] Add avatar upload UI to `src/components/profile/profile-form.tsx`
- [x] Create `updateAvatar` server action in `src/lib/actions/profile.ts`
- [x] Wire up avatar preview + upload in profile form

### 1.2 Attorney — Photo Upload
- [x] Add `photoUrl` field to attorney-form.tsx create flow
- [x] Add `photoUrl` field to attorney-form.tsx edit flow
- [x] Update `createAttorney` action to accept `photoUrl` (via validator spread)
- [x] Update `updateAttorney` action to accept `photoUrl` (via validator spread)
- [x] Display attorney photo on detail page `/attorneys/[id]`
- [x] Display attorney photo in attorneys list table

### 1.3 Client — Photo Upload
- [x] Add `photoUrl` field to client-form.tsx create flow
- [x] Add `photoUrl` field to client-form.tsx edit flow
- [x] Update `createClient` action to accept `photoUrl` (via validator spread)
- [x] Update `updateClient` action to accept `photoUrl` (via validator spread)
- [x] Display client photo on detail page `/clients/[id]`
- [x] Display client photo in clients list table

### 1.4 Supplier — Logo Upload
- [x] Add `logoUrl` field to supplier form (create)
- [x] Add `logoUrl` field to supplier form (edit — see Phase 2)
- [x] Update `createSupplier` action to accept `logoUrl` (via validator spread)
- [x] Update `updateSupplier` action to accept `logoUrl` (via validator spread)
- [x] Display supplier logo on detail page `/suppliers/[id]`
- [x] Display supplier logo in suppliers list table

---

## Phase 2: Missing Edit UI (server action exists, form missing)

### 2.1 Deadlines — Edit Form
- [x] Create `<DeadlineEditSheet />` component (inline sheet, similar to task-edit-sheet)
- [x] Wire `updateDeadline` action to the edit sheet
- [x] Add "Edit" option to deadline row actions
- [x] Pre-populate form with existing deadline data

### 2.2 Calendar Events — Edit Form
- [x] Create `<EventEditDialog />` or reuse `EventForm` with edit mode
- [x] Pass existing event data to form for pre-population
- [x] Wire `updateEvent` action to the form submit
- [x] Add "Edit" button/action to event display (calendar event click or list row)

### 2.3 Suppliers — Edit Form + Page
- [x] Create `/suppliers/[id]/edit/page.tsx` edit page
- [x] Create or extend supplier form component to support edit mode (pre-populate fields)
- [x] Wire `updateSupplier` action to form submit
- [x] Add "Edit" link/button to supplier detail page
- [x] Add "Edit" option to supplier row actions in table

### 2.4 Documents — Full Edit Form
- [x] Create `<DocumentEditDialog />` or edit page for document metadata
- [x] Allow editing: title, description, category, caseId, clientId associations
- [x] Create `updateDocument` server action (not just status) in `src/lib/actions/documents.ts`
- [x] Allow re-uploading a new file version (creates documentVersion record)
- [x] Add "Edit" option to document row actions
- [x] Keep existing status-change workflow intact

---

## Phase 3: Missing Update Actions + UI

### 3.1 Time Entries — Update
- [x] Create `updateTimeEntry` server action in `src/lib/actions/time-expenses.ts`
- [x] Validate: cannot edit billed time entries
- [x] Create `<TimeEntryEditSheet />` component (inline sheet)
- [x] Pre-populate with existing time entry data
- [x] Add "Edit" option to time entry row actions

### 3.2 Expenses — Update + Receipt Upload
- [x] Create `updateExpense` server action in `src/lib/actions/time-expenses.ts`
- [x] Validate: cannot edit billed expenses
- [x] Create `<ExpenseEditSheet />` component (inline sheet)
- [x] Add receipt file upload to expense create form (`receiptUrl` field exists in schema)
- [x] Add receipt file upload to expense edit form
- [x] Add "Edit" option to expense row actions

### 3.3 Billing/Invoices — Edit Draft
- [x] Create `updateInvoice` server action (draft invoices only)
- [x] Allow editing: line items, client, case, due date, notes on draft invoices
- [x] Create `/billing/[id]/edit/page.tsx` edit page
- [x] Reuse `InvoiceForm` with edit mode + pre-populated data
- [x] Add "Edit" button to invoice detail page (visible only for draft)
- [x] Add "Edit" option to invoice row actions (draft only)

### 3.4 Courts — Update + Delete
- [x] Create `updateCourt` server action in `src/lib/actions/courts.ts`
- [x] Create `deleteCourt` (soft delete: toggle active) server action
- [x] Create `<CourtEditDialog />` component
- [x] Add "Edit" and "Delete" options to court row actions
- [x] Pre-populate form with existing court data

### 3.5 Court Filings — Full Edit + File Upload
- [x] Create `updateCourtFiling` server action (full field edit, not just status)
- [x] Create `deleteCourtFiling` server action
- [x] Add file upload for `documentUrl` field in court filing create form
- [x] Add file upload for `documentUrl` field in court filing edit form
- [x] Create `<CourtFilingEditDialog />` component
- [x] Add "Edit" and "Delete" options to filing row actions

### 3.6 Court Rules — Update
- [x] Create `updateCourtRule` server action
- [x] Create `<CourtRuleEditDialog />` component
- [x] Add "Edit" option to court rule row actions

### 3.7 Cause Lists — Update + Delete
- [x] Create `updateCauseList` server action (date, judge, court, notes)
- [x] Create `deleteCauseList` server action
- [x] Create `updateCauseListEntry` server action
- [x] Create `deleteCauseListEntry` server action
- [x] Create `<CauseListEditDialog />` component
- [x] Add "Edit" and "Delete" options to cause list row actions
- [x] Add "Edit" and "Remove" options to cause list entry rows

### 3.8 Trust Accounts — Edit Account Details
- [x] Create `updateTrustAccount` server action (name, type, bank details — NOT balance)
- [x] Create `<TrustAccountEditDialog />` component
- [x] Add "Edit" button to trust account detail page
- [x] Pre-populate with existing account data

### 3.9 Requisitions — Edit Draft
- [x] Create `updateRequisition` server action (draft status only)
- [x] Allow editing: description, amount, category, vendor on draft requisitions
- [x] Create `<RequisitionEditDialog />` component
- [x] Add "Edit" option to requisition row actions (visible only for draft)

### 3.10 Bring-Ups — Full Edit
- [x] Create `updateBringUp` server action (pending bring-ups only)
- [x] Allow editing: title, description, date, priority, caseId
- [x] Create `<BringUpEditDialog />` component
- [x] Add "Edit" option to bring-up row actions (pending only)

---

## Phase 4: Missing Delete Actions

### 4.1 Cases — Soft Delete / Archive
- [x] Create `archiveCase` server action (sets status to "closed")
- [x] Add "Archive" option to case row actions
- [x] Add "Archive" button to case detail page
- [x] Show archived cases with visual indicator in list (opacity + strikethrough + badge)
- [x] Prevent archiving cases with active trust balances

### 4.2 Supplier Invoices — Delete
- [x] Create `deleteSupplierInvoice` server action (unpaid only)
- [x] Add "Delete" option to supplier invoice row actions
- [x] Add confirmation dialog before deletion

### 4.3 Courts — Soft Delete
- [x] (Covered in 3.4 above — toggle active)

### 4.4 Service of Documents — Edit + Delete
- [x] Create `updateServiceOfDocument` server action
- [x] Create `deleteServiceOfDocument` server action
- [x] Add file upload for `proofOfServiceUrl` field in create form
- [x] Add file upload for `proofOfServiceUrl` field in edit form
- [x] Add "Edit" and "Delete" options to service of documents row actions

---

## Phase 5: File Upload on Existing Forms

### 5.1 Expense Receipt Upload (create form)
- [x] (Covered in 3.2 — add receipt upload to expense form)

### 5.2 Court Filing Document Upload (create form)
- [x] (Covered in 3.5 — add document upload to filing form)

### 5.3 Service of Documents — Proof of Service Upload
- [x] (Covered in 4.4 — add proof upload to service form)

### 5.4 Petty Cash — Receipt Upload
- [x] Add receipt file upload to petty cash transaction create dialog (`receiptUrl` field exists)
- [x] Display receipt link/thumbnail in transaction list

### 5.5 Supplier Invoice — File Upload
- [x] Add file upload to supplier invoice create form (`fileUrl` field exists)
- [x] Display file link on supplier invoice row/detail

### 5.6 Messages — File Attachment
- [x] Add `attachmentUrl text` and `attachmentName text` columns to messages table
- [x] Add file upload to message compose form
- [x] Display attachment link in message detail view
- [x] Allow downloading attachments from message thread

---

## Phase 6: Intentionally Immutable (No Changes Needed)

These modules are intentionally create-only for audit/compliance purposes:

- [x] **Petty Cash Transactions** — ledger entries are immutable (edit/delete not needed)
- [x] **Conflict Checks** — compliance records are immutable
- [x] **Messages (content)** — sent message content should not be editable
- [x] **Trust Transactions** — deposit/withdrawal records are immutable
- [x] **Payments** — payment records are immutable after recording

---

## Progress Tracker

| Phase | Total Items | Completed | Remaining |
|-------|------------|-----------|-----------|
| Phase 0 | 8 | 7 | 1 |
| Phase 1 | 17 | 17 | 0 |
| Phase 2 | 17 | 17 | 0 |
| Phase 3 | 39 | 39 | 0 |
| Phase 4 | 8 | 8 | 0 |
| Phase 5 | 6 | 6 | 0 |
| Phase 6 | 5 | 5 | 0 |
| **TOTAL** | **100** | **99** | **1** |

---

## Remaining Items (1)

1. Phase 0: Image resize/compression (optional enhancement, not critical for functionality)
