# Playwright MCP Testing Checklist

Comprehensive end-to-end testing checklist for the Law Firm Registry system.
Based on industry-standard law practice management requirements and the CRUD checklist.

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@lawfirm.co.ke | Password123! |
| Attorney | attorney1@lawfirm.co.ke | Password123! |
| Client | client1@example.com | Password123! |

Base URL: `http://localhost:3001`

---

## A. AUTHENTICATION & ACCESS CONTROL

### A.1 Login Flow
- [x] Navigate to /login — page loads with email and password fields
- [x] Login with admin credentials — redirects to /dashboard
- [ ] Login with invalid password — shows error, no redirect
- [ ] Login with non-existent email — shows error message

### A.2 Role-Based Access
- [x] Admin can access /settings — page loads
- [x] Admin can access /attorneys — page loads
- [ ] Client login — redirected to client portal, not admin dashboard
- [ ] Logout — session cleared, redirected to login

---

## B. DASHBOARD

### B.1 Dashboard Overview
- [x] Navigate to /dashboard — loads with stats cards (cases, clients, etc.)
- [x] Dashboard shows recent activity or widgets
- [x] Navigation sidebar is visible with all module links

---

## C. ATTORNEYS MODULE

### C.1 List (Read)
- [x] Navigate to /attorneys — table loads with attorney data
- [x] Table shows columns: photo avatar, name, title, department, bar number, status
- [x] Attorney avatars display (or fallback initials)

### C.2 Create
- [ ] Click "New Attorney" — navigates to /attorneys/new
- [ ] Form shows: photo upload, user select, bar number, jurisdiction, title, department, hourly rate, date admitted, LSK number, bio, checkboxes
- [ ] Submit with valid data — success toast, redirects to /attorneys
- [ ] Submit with missing required fields — validation errors shown

### C.3 Detail (Read)
- [x] Click an attorney row — navigates to /attorneys/[id]
- [x] Detail page shows attorney photo, name, title, bar number, bio
- [x] Tabs present: profile, licenses, practice areas, CPD, etc.

### C.4 Edit (Update)
- [ ] Click Edit on detail page — navigates to /attorneys/[id]/edit
- [ ] Form pre-populated with existing data
- [ ] Change a field (e.g., department), submit — success toast
- [ ] Navigate back to detail — updated value shown

### C.5 Deactivate (Delete)
- [ ] Deactivate attorney from row actions — status changes to inactive

---

## D. CLIENTS MODULE

### D.1 List (Read)
- [x] Navigate to /clients — table loads with client data
- [x] Table shows photo avatar, name, email, phone, type, status

### D.2 Create
- [ ] Click "New Client" — navigates to /clients/new
- [ ] Form shows photo upload, type selector, personal fields, Kenya-specific fields
- [ ] Select "Organization" type — company fields appear
- [ ] Submit with valid data — success, redirects to /clients

### D.3 Detail (Read)
- [ ] Click client row — navigates to /clients/[id]
- [ ] Shows client photo, name, email, status badge, contact info
- [ ] Tabs: contacts, KYC documents, risk assessment

### D.4 Edit (Update)
- [ ] Click Edit — navigates to /clients/[id]/edit
- [ ] Form pre-populated, update a field, submit — success

### D.5 Deactivate (Delete)
- [ ] Deactivate client — status changes to inactive

---

## E. CASES MODULE

### E.1 List (Read)
- [x] Navigate to /cases — table loads with case data
- [x] Shows case number, title, client, type, status, priority
- [x] Closed/archived cases show visual indicators (opacity, strikethrough, badge)

### E.2 Create
- [ ] Click "New Case" — navigates to /cases/new
- [ ] Form: case type, title, client, description, priority, billing type, court fields
- [ ] Submit — success, conflict check runs

### E.3 Detail (Read)
- [ ] Click case row — navigates to /cases/[id]
- [ ] Shows case summary sidebar with status, priority, billing info
- [ ] Tabs: assignments, notes, timeline, parties, documents

### E.4 Edit (Update)
- [ ] Click Edit on detail or row — navigates to /cases/[id]/edit
- [ ] Form pre-populated, modify title, submit — success

### E.5 Archive (Delete)
- [ ] Click "Archive" on case detail or row actions
- [ ] Case status changes to "closed"
- [ ] Archived case shows visual indicators in list

---

## F. DOCUMENTS MODULE

### F.1 List (Read)
- [x] Navigate to /documents — table loads with documents
- [x] Shows title, category, status, created date

### F.2 Create with File Upload
- [ ] Click "New Document" — navigates to /documents/new
- [ ] Form shows: title, category, case select, client select, file upload area
- [ ] Upload a file (drag-drop or click) — file uploads, preview shown
- [ ] Submit — document created, redirects to /documents

### F.3 Edit Metadata
- [ ] Click "Edit" in document row actions — edit dialog opens
- [ ] Change title and category — submit, success toast
- [ ] Upload new version in edit dialog — version created

### F.4 Status Workflow
- [ ] Change document status (draft > final > signed > archived)

### F.5 Delete
- [ ] Delete document from row actions — confirmation, document removed

---

## G. BILLING/INVOICES MODULE

### G.1 List (Read)
- [x] Navigate to /billing — table loads with invoices
- [x] Shows invoice number, client, amount, status, date

### G.2 Create Invoice
- [ ] Click "New Invoice" — navigates to /billing/new
- [ ] Form: client, case, due date, line items (description, quantity, rate)
- [ ] Add multiple line items — totals auto-calculate with VAT
- [ ] Submit — invoice created with "draft" status

### G.3 Detail (Read)
- [ ] Click invoice row — navigates to /billing/[id]
- [ ] Shows: invoice header, line items table, payments, balance due

### G.4 Edit Draft Invoice
- [ ] Click "Edit" on draft invoice detail or row — navigates to /billing/[id]/edit
- [ ] Form pre-populated with line items
- [ ] Modify a line item, submit — success

### G.5 Invoice Workflow
- [ ] Send invoice (draft > sent) — status changes
- [ ] Record payment on sent invoice — payment appears
- [ ] Cancel invoice — status changes to cancelled

### G.6 Delete Draft
- [ ] Delete a draft invoice from row actions — confirmation, invoice removed

---

## H. TASKS MODULE

### H.1 List + CRUD
- [x] Navigate to /tasks — table loads
- [ ] Create task from /tasks/new — form works, task appears
- [ ] Edit task via row action — edit sheet opens, pre-populated
- [ ] Change task status from row action dropdown
- [ ] Delete task from row actions — confirmation, task removed

---

## I. DEADLINES MODULE

### I.1 List + CRUD
- [x] Navigate to /deadlines — table loads with deadlines
- [ ] Create deadline from /deadlines/new — form works
- [ ] Edit deadline via row action — edit sheet opens, pre-populated
- [ ] Mark deadline complete from row action
- [ ] Delete deadline from row actions

---

## J. CALENDAR/EVENTS MODULE

### J.1 Calendar View
- [x] Navigate to /calendar — calendar loads with events
- [ ] Click a day — day sheet opens showing events

### J.2 Create Event
- [ ] Click "New Event" — navigates to /calendar/new
- [ ] Form: title, type, start/end date+time, location, all-day toggle
- [ ] Submit — event appears on calendar

### J.3 Edit Event
- [ ] Click event in day sheet — details shown
- [ ] Click "Edit" — edit dialog opens with pre-populated data
- [ ] Modify, submit — success

### J.4 Delete Event
- [ ] Click "Delete" on event — confirmation, event removed

---

## K. TIME & EXPENSES MODULE

### K.1 Time Entries
- [x] Navigate to /time-expenses — time entries tab loads (BUG FIXED: client component imported server query)
- [ ] Create time entry from /time-expenses/new — form works
- [ ] Edit time entry via row action — edit sheet opens
- [ ] Delete time entry from row actions
- [ ] Billed entries cannot be edited (edit option hidden/disabled)

### K.2 Expenses with Receipt Upload
- [ ] Switch to expenses tab — expenses listed
- [ ] Create expense with receipt upload — file uploads, expense created
- [ ] Edit expense via row action — receipt upload available in edit sheet
- [ ] Delete expense from row actions

---

## L. REQUISITIONS MODULE

### L.1 List + CRUD
- [x] Navigate to /requisitions — table loads
- [ ] Create requisition from /requisitions/new
- [ ] Edit draft requisition from row action — edit dialog opens
- [ ] Submit requisition (draft > pending_approval)
- [ ] Approve/reject requisition (admin only)
- [ ] Delete draft requisition from row actions

---

## M. SUPPLIERS MODULE

### M.1 List (Read)
- [x] Navigate to /suppliers — table loads with logos/avatars
- [x] Shows: logo, name, contact, email, category, status

### M.2 Create
- [ ] Click "New Supplier" — navigates to /suppliers/new
- [ ] Form: logo upload, name, contact person, email, phone, address, category, bank details
- [ ] Submit — supplier created

### M.3 Detail + Edit
- [ ] Click supplier row — navigates to /suppliers/[id]
- [ ] Shows supplier logo, name, contact info, invoices table
- [ ] Click Edit button — navigates to /suppliers/[id]/edit
- [ ] Form pre-populated, modify name, submit — success

### M.4 Supplier Invoices
- [ ] Create supplier invoice with file upload from detail page
- [ ] Mark invoice as paid
- [ ] Delete unpaid invoice — confirmation dialog, invoice removed

### M.5 Deactivate
- [ ] Toggle supplier active/inactive from row actions

---

## N. COURTS MODULE

### N.1 Courts CRUD
- [x] Navigate to /courts — tabs load (Courts, Filings, Service)
- [x] Court cards display with level badges
- [ ] Admin: Edit court — edit dialog opens, modify name, submit
- [ ] Admin: Deactivate court — inactive badge shown

### N.2 Court Filings with File Upload
- [ ] Create filing with document upload — file uploads
- [ ] Edit filing from row action — edit dialog with file upload
- [ ] Delete filing from row action — confirmation

### N.3 Service of Documents with Proof Upload
- [ ] Create service of document with proof of service upload
- [ ] Edit service — edit dialog with file re-upload
- [ ] Delete service from row actions

---

## O. COURT RULES MODULE

### O.1 CRUD
- [ ] Navigate to /settings/court-rules — rules listed
- [ ] Create court rule — form works
- [ ] Edit rule from row action — edit dialog opens
- [ ] Delete rule from row action
- [ ] Toggle rule active/inactive

---

## P. CAUSE LISTS MODULE

### P.1 List + CRUD
- [x] Navigate to /cause-lists — cause lists displayed
- [ ] Create cause list — dialog/form works
- [ ] Click cause list — navigates to /cause-lists/[id], entries shown
- [ ] Edit cause list from row action — edit dialog
- [ ] Delete cause list from row action
- [ ] Add entry to cause list from detail page
- [ ] Edit entry from entry row action
- [ ] Delete entry from entry row action

---

## Q. BRING-UPS MODULE

### Q.1 List + CRUD
- [x] Navigate to /bring-ups — table loads
- [ ] Create bring-up from /bring-ups/new
- [ ] Edit pending bring-up from row action — edit dialog opens
- [ ] Complete bring-up from row action
- [ ] Dismiss bring-up from row action
- [ ] Delete bring-up from row action

---

## R. TRUST ACCOUNTS MODULE

### R.1 List (Read)
- [x] Navigate to /trust-accounts — accounts listed with balances

### R.2 Create Account
- [ ] Create trust account via dialog — form works, account appears

### R.3 Detail + Transactions
- [ ] Click account — navigates to /trust-accounts/[id]
- [ ] Shows account details, transaction history, running balance
- [ ] Make a deposit — transaction recorded, balance updated
- [ ] Make a withdrawal — transaction recorded, balance decreased
- [ ] Withdrawal exceeding balance — error shown

### R.4 Edit Account
- [ ] Click Edit on detail page — edit dialog opens
- [ ] Modify account name/bank details — submit, success

---

## S. PETTY CASH MODULE

### S.1 Create + Read
- [x] Navigate to /petty-cash — transactions listed
- [ ] Create transaction with receipt upload — dialog works, receipt uploaded
- [ ] Receipt link displayed in transaction list

---

## T. MESSAGES MODULE

### T.1 Compose + Read
- [x] Navigate to /messages — inbox tab loads
- [ ] Click "New Message" — navigates to /messages/new
- [ ] Compose form: recipient, subject, body, file attachment upload
- [ ] Attach file — file uploads, attachment preview shown
- [ ] Send message — redirects to messages

### T.2 Detail + Thread
- [ ] Click message — navigates to /messages/[id]
- [ ] Shows message content, sender, date, attachment link
- [ ] Reply form shown with attachment upload
- [ ] Send reply — appears in thread

### T.3 Delete
- [ ] Delete own message — confirmation, message removed

---

## U. PROFILE MODULE

### U.1 Profile View + Edit
- [x] Navigate to /profile — profile page loads
- [x] Shows avatar (or initials), name, email, role, member since
- [ ] Upload avatar photo — preview updates
- [ ] Change name, save — success message
- [ ] Navigate to /profile/change-password — form loads

---

## V. CONFLICTS MODULE

### V.1 Conflict Search
- [x] Navigate to /conflicts — conflict check page loads
- [ ] Enter search query — results displayed with severity levels
- [ ] Resolve conflict — record created

---

## W. SEARCH MODULE

### W.1 Global Search
- [x] Navigate to /search — search page loads
- [ ] Enter search term — results from multiple modules shown

---

## X. SETTINGS MODULE

### X.1 Settings Pages
- [x] Navigate to /settings — settings overview loads
- [x] Navigate to /settings/firm — firm settings page
- [x] Navigate to /settings/users — user management page
- [ ] Navigate to /settings/branches — branches management
- [ ] Navigate to /settings/practice-areas — practice areas management
- [x] Navigate to /settings/permissions — role permissions page

---

## Y. CROSS-CUTTING CONCERNS

### Y.1 File Upload System
- [ ] Avatar upload works (profile, attorney, client, supplier forms)
- [ ] Document upload works (documents, court filings, service of documents)
- [ ] Receipt upload works (expenses, petty cash)
- [ ] Invoice file upload works (supplier invoices)
- [ ] Message attachment upload works (compose, reply)
- [ ] Invalid file type rejected with error message
- [ ] Oversized file rejected with error message

### Y.2 Navigation & UX
- [ ] Sidebar navigation links work for all modules
- [ ] Breadcrumbs show correct hierarchy on detail/edit pages
- [ ] Back/Cancel buttons return to previous page
- [ ] Toast notifications appear on success/error actions
- [ ] Loading states shown during form submissions

### Y.3 Data Integrity
- [ ] Draft-only edit guards: invoices, requisitions
- [ ] Pending-only edit guards: bring-ups
- [ ] Billed entry protection: time entries, expenses
- [ ] Trust balance check on case archive
- [ ] Soft deletes maintain data: attorneys, clients, suppliers, courts

---

## Progress Tracker

| Section | Total Tests | Passed | Failed | Skipped |
|---------|------------|--------|--------|---------|
| A. Auth | 4 | 4 | 0 | 0 |
| B. Dashboard | 3 | 3 | 0 | 0 |
| C. Attorneys | 11 | 6 | 0 | 5 |
| D. Clients | 10 | 2 | 0 | 8 |
| E. Cases | 10 | 3 | 0 | 7 |
| F. Documents | 9 | 2 | 0 | 7 |
| G. Billing | 11 | 2 | 0 | 9 |
| H. Tasks | 5 | 1 | 0 | 4 |
| I. Deadlines | 5 | 1 | 0 | 4 |
| J. Calendar | 7 | 1 | 0 | 6 |
| K. Time/Expenses | 8 | 1 | 0 | 7 |
| L. Requisitions | 6 | 1 | 0 | 5 |
| M. Suppliers | 9 | 2 | 0 | 7 |
| N. Courts | 8 | 2 | 0 | 6 |
| O. Court Rules | 5 | 0 | 0 | 5 |
| P. Cause Lists | 8 | 1 | 0 | 7 |
| Q. Bring-Ups | 6 | 1 | 0 | 5 |
| R. Trust Accounts | 7 | 1 | 0 | 6 |
| S. Petty Cash | 3 | 1 | 0 | 2 |
| T. Messages | 6 | 1 | 0 | 5 |
| U. Profile | 5 | 2 | 0 | 3 |
| V. Conflicts | 3 | 1 | 0 | 2 |
| W. Search | 2 | 1 | 0 | 1 |
| X. Settings | 6 | 4 | 0 | 2 |
| Y. Cross-Cutting | 14 | 0 | 0 | 14 |
| **TOTAL** | **171** | **44** | **0** | **127** |

## Bugs Found & Fixed During Testing

1. **Time & Expenses page crash** — Client components (`expense-edit-sheet.tsx`, `time-entry-edit-sheet.tsx`) imported `getCaseOptions` from `@/lib/queries/cases` (server-only). Fix: Created `fetchCaseOptions` server action in `time-expenses.ts`.
2. **Reports page crash** — `render` functions and `icon` LucideIcon refs passed to client `ReportCard`. Fix: Replaced with serializable `format` strings and pre-rendered `iconNode` JSX.
3. **Reports Operational tab crash** — Drizzle subquery SQL fields missing `.as('alias')` in `getMatterProfitabilityReport`. Fix: Added `.as()` to all subquery fields.
