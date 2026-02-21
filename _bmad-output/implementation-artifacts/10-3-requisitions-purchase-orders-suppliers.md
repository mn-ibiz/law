# Story 10.3: Requisition System, Purchase Orders & Supplier Management

Status: ready-for-dev

## Story

As an Attorney/Admin,
I want to submit requisitions for approval and manage suppliers,
so that spending is controlled.

## Acceptance Criteria (ACs)

1. Requisition list page with DataTable: filter by status, requester, case, and date range
2. Requisition form: case (optional), description (required), amount in KES (required), supplier (searchable dropdown or create new inline), urgency level, supporting document upload
3. Approval workflow: Pending -> Approved -> Paid / Rejected with enforced status transitions
4. Notifications sent on requisition submit (to approver), approve (to requester), and reject (to requester)
5. Purchase order generation from an approved requisition: auto-generated PO number, line items, supplier details, authorized-by signature field
6. Supplier management: full CRUD with fields for name, contact person, phone, email, KRA PIN, bank details (bank name, account name, account number, branch), category
7. Supplier invoice tracking: invoice number, date, amount in KES, due date, status (Pending/Paid), linked to supplier and optionally to requisition

## Tasks / Subtasks

- [ ] **Task 1: Zod validation schemas** (AC 2, 5, 6, 7)
  - [ ] Create `src/lib/validators/requisitions.ts`
  - [ ] `requisitionSchema`: description (required, min 10 chars), amount (required, positive number), case ID (optional), supplier ID (optional), urgency (Low/Medium/High/Urgent), supporting document (optional file)
  - [ ] `purchaseOrderSchema`: requisition ID, line items array (description, qty, unit price), notes
  - [ ] Create `src/lib/validators/suppliers.ts`
  - [ ] `supplierSchema`: name (required), contact person, phone (+254 validation), email, KRA PIN (format validation: A/P + 9 digits + letter), bank name, bank account name, bank account number, bank branch, category (Legal Services/Courier/Stationery/IT/Transport/Expert Witness/Process Server/Other)
  - [ ] `supplierInvoiceSchema`: supplier ID (required), invoice number, date, amount (KES), due date, status enum, requisition ID (optional)

- [ ] **Task 2: Server actions for requisitions** (AC 2, 3, 4)
  - [ ] Create `src/lib/actions/requisitions.ts`
  - [ ] `createRequisition(formData)` — validate, upload supporting doc if present, insert with status Pending, create notification for admin/approvers, audit log
  - [ ] `approveRequisition(id)` — check admin/partner role, update status to Approved, notify requester, audit log
  - [ ] `rejectRequisition(id, reason)` — check admin/partner role, require rejection reason, update status to Rejected, notify requester, audit log
  - [ ] `markRequisitionPaid(id, paymentDetails)` — update status to Paid, record payment date and reference, audit log

- [ ] **Task 3: Server actions for purchase orders** (AC 5)
  - [ ] Add to `src/lib/actions/requisitions.ts` or create `src/lib/actions/purchase-orders.ts`
  - [ ] `generatePurchaseOrder(requisitionId, lineItems)` — validate requisition is Approved, generate PO number (PO-YYYY-NNNN), create PO record with supplier details and line items, audit log
  - [ ] `getPurchaseOrderPDF(poId)` — generate PDF with PO details, firm letterhead, supplier info, line items table, authorized-by field

- [ ] **Task 4: Server actions for suppliers** (AC 6)
  - [ ] Create `src/lib/actions/suppliers.ts`
  - [ ] `createSupplier(data)` — validate, insert, audit log
  - [ ] `updateSupplier(id, data)` — validate, update, audit log
  - [ ] `deleteSupplier(id)` — soft-delete (check no active requisitions), audit log

- [ ] **Task 5: Server actions for supplier invoices** (AC 7)
  - [ ] Create `src/lib/actions/supplier-invoices.ts`
  - [ ] `createSupplierInvoice(data)` — validate, insert, audit log
  - [ ] `updateSupplierInvoice(id, data)` — validate, update, audit log
  - [ ] `markSupplierInvoicePaid(id, paymentDate, reference)` — update status to Paid, audit log

- [ ] **Task 6: Data queries** (AC 1, 6, 7)
  - [ ] Create `src/lib/queries/requisitions.ts`
  - [ ] `getRequisitions(filters)` — paginated, filterable by status, requester, case, date range
  - [ ] `getRequisitionById(id)` — full details including supplier and supporting doc
  - [ ] Create `src/lib/queries/suppliers.ts`
  - [ ] `getSuppliers(filters)` — paginated, searchable by name, filterable by category
  - [ ] `getSupplierById(id)` — full details with invoice history
  - [ ] `searchSuppliers(query)` — for combobox dropdown
  - [ ] Create `src/lib/queries/supplier-invoices.ts`
  - [ ] `getSupplierInvoices(filters)` — filterable by supplier, status, date range

- [ ] **Task 7: Requisition list page** (AC 1)
  - [ ] Create `src/app/(dashboard)/requisitions/page.tsx`
  - [ ] DataTable columns: date, requester, description (truncated), case (link), supplier, amount (KES), urgency badge, status badge, actions
  - [ ] Filter bar: status dropdown, requester dropdown (admin), case dropdown, date range
  - [ ] "New Requisition" button
  - [ ] Admin/partner view: Approve/Reject action buttons on Pending items

- [ ] **Task 8: Requisition form** (AC 2)
  - [ ] Create `src/components/forms/requisition-form.tsx`
  - [ ] Description textarea (required)
  - [ ] Amount input with KES prefix
  - [ ] Case searchable combobox (optional)
  - [ ] Supplier combobox with "Create New" option that opens inline supplier form
  - [ ] Urgency dropdown (Low/Medium/High/Urgent)
  - [ ] Supporting document file upload
  - [ ] Form rendered in Sheet/Dialog

- [ ] **Task 9: Requisition detail and approval UI** (AC 3, 4, 5)
  - [ ] Create `src/app/(dashboard)/requisitions/[id]/page.tsx`
  - [ ] Display all requisition details, supporting document preview/download
  - [ ] Status workflow buttons: Approve / Reject (with reason dialog) for admin/partner
  - [ ] "Generate PO" button (visible when status = Approved)
  - [ ] "Mark as Paid" button with payment details dialog
  - [ ] Activity timeline showing status changes

- [ ] **Task 10: Purchase order generation and PDF** (AC 5)
  - [ ] Create `src/lib/utils/purchase-order-pdf.ts`
  - [ ] PO PDF layout: firm letterhead, PO number, date, supplier details, line items table (description, qty, unit price, total), subtotal, authorized by field, terms
  - [ ] Use `jsPDF` or `@react-pdf/renderer` for PDF generation
  - [ ] Download and preview actions on requisition detail page

- [ ] **Task 11: Supplier management page** (AC 6)
  - [ ] Create `src/app/(dashboard)/suppliers/page.tsx`
  - [ ] DataTable columns: name, contact, phone, email, KRA PIN, category badge, invoice count, actions
  - [ ] "New Supplier" button
  - [ ] Create `src/app/(dashboard)/suppliers/[id]/page.tsx` — supplier detail with tabs: Profile, Invoices, Requisitions

- [ ] **Task 12: Supplier form** (AC 6)
  - [ ] Create `src/components/forms/supplier-form.tsx`
  - [ ] Fields: name, contact person, phone (+254), email, KRA PIN, bank details section (bank name, account name, account number, branch), category dropdown
  - [ ] Form rendered in Sheet/Dialog and also as inline form in requisition flow

- [ ] **Task 13: Supplier invoice tracking** (AC 7)
  - [ ] Create `src/components/forms/supplier-invoice-form.tsx`
  - [ ] Fields: supplier (auto-filled in supplier context), invoice number, date, amount (KES), due date, linked requisition (optional)
  - [ ] Add invoice list tab on supplier detail page
  - [ ] Status actions: Mark as Paid with payment date and reference

## Dev Notes

- Requisition approval should be restricted to Admin and Partner roles; check `session.user.role` and potentially attorney title in authorization logic
- PO numbering follows the pattern PO-YYYY-NNNN, similar to case and invoice number auto-generation
- KRA PIN format validation: starts with A (individual) or P (company), followed by 9 digits and a letter (e.g., A123456789B or P051234567A)
- The "Create New" supplier option in the requisition form should open an inline form or Dialog rather than navigating away from the requisition flow
- Supporting documents for requisitions use the same storage abstraction from Story 9.1
- Notifications for requisition approval/rejection should create in-app notification records; email notifications are a future integration
- Supplier bank details are sensitive; ensure they are only visible to Admin role
- All KES amounts formatted with `Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' })`
- The supplier invoice tracking is separate from the firm's fee notes/billing system — these are invoices the firm receives from external suppliers

### Project Structure Notes

Files to create:
- `src/lib/validators/requisitions.ts` — Zod schemas for requisitions and POs
- `src/lib/validators/suppliers.ts` — Zod schemas for suppliers and their invoices
- `src/lib/actions/requisitions.ts` — requisition and PO server actions
- `src/lib/actions/suppliers.ts` — supplier CRUD server actions
- `src/lib/actions/supplier-invoices.ts` — supplier invoice server actions
- `src/lib/queries/requisitions.ts` — requisition data queries
- `src/lib/queries/suppliers.ts` — supplier data queries
- `src/lib/queries/supplier-invoices.ts` — supplier invoice queries
- `src/lib/utils/purchase-order-pdf.ts` — PO PDF generation
- `src/app/(dashboard)/requisitions/page.tsx` — requisition list page
- `src/app/(dashboard)/requisitions/[id]/page.tsx` — requisition detail page
- `src/app/(dashboard)/suppliers/page.tsx` — supplier list page
- `src/app/(dashboard)/suppliers/[id]/page.tsx` — supplier detail page
- `src/components/forms/requisition-form.tsx` — requisition form
- `src/components/forms/supplier-form.tsx` — supplier form
- `src/components/forms/supplier-invoice-form.tsx` — supplier invoice form

Files to modify:
- `src/app/(dashboard)/layout.tsx` — add Requisitions and Suppliers nav items

### References

- [Source: a.md - Module 18: Financial Management — Requisition System, Supplier/Vendor Management]
- [Source: epics.md - Epic 10, Story 10.3]
- [Source: a.md - Feature Gap Analysis: #12 Requisition System, #22 Supplier/Vendor Management]

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
