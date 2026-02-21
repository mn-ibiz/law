# Story 12.2: Petty Cash Management

Status: ready-for-dev

## Story

As an Admin,
I want to manage petty cash with approval workflow,
so that cash expenses are tracked.

## Acceptance Criteria (ACs)

1. Petty cash page organized per branch, showing the current petty cash status for each branch
2. Float configuration per branch: Admin can set the initial petty cash float amount (KES) for each branch
3. Transaction list per branch: date, description, amount (in/out), running balance, receipt reference, recorded by
4. Add transaction form: type (Replenishment/Expense), amount (KES), description, receipt file upload, category
5. Request and approval workflow: staff member submits request -> Admin approves -> funds disbursed
6. Running balance maintained: float amount minus expenses plus replenishments, auto-calculated
7. Reconciliation: compare physical cash count (manual entry) to system balance, with variance display
8. Monthly petty cash report showing all transactions, opening balance, closing balance, and category breakdown

## Tasks / Subtasks

- [ ] **Task 1: Zod validation schemas** (AC 2, 4, 5, 7)
  - [ ] Create `src/lib/validators/petty-cash.ts`
  - [ ] `pettyCashFloatSchema`: branch ID (required), float amount (KES, positive)
  - [ ] `pettyCashTransactionSchema`: branch ID (required), type enum (Replenishment/Expense), amount (KES, positive), description (required), category (Office Supplies/Transport/Tea & Meals/Stationery/Cleaning/Repairs/Communication/Printing/Courier/Miscellaneous), receipt file (optional, max 5MB)
  - [ ] `pettyCashRequestSchema`: branch ID, amount (KES), description, purpose, urgency
  - [ ] `pettyCashReconciliationSchema`: branch ID, physical count (KES), date, notes

- [ ] **Task 2: Server actions for petty cash management** (AC 2, 4, 5, 6)
  - [ ] Create `src/lib/actions/petty-cash.ts`
  - [ ] `setFloat(branchId, amount)` — admin-only, set or update float amount for branch, audit log
  - [ ] `addTransaction(data)` — validate, upload receipt if present, insert transaction, update running balance, audit log
  - [ ] For Expense type: validate sufficient balance (running balance must not go below zero)
  - [ ] For Replenishment type: increases the balance
  - [ ] `submitPettyCashRequest(data)` — create request with Pending status, notify branch admin
  - [ ] `approvePettyCashRequest(requestId)` — admin-only, approve and auto-create disbursement transaction, notify requester, audit log
  - [ ] `rejectPettyCashRequest(requestId, reason)` — admin-only, reject with reason, notify requester, audit log

- [ ] **Task 3: Petty cash reconciliation** (AC 7)
  - [ ] Add to `src/lib/actions/petty-cash.ts`:
  - [ ] `reconcilePettyCash(branchId, physicalCount, date, notes)` — compare physical count to system balance, store reconciliation record with variance, audit log
  - [ ] Variance = physical count - system balance
  - [ ] Flag significant variances (configurable threshold, e.g., > KES 500)

- [ ] **Task 4: Data queries** (AC 1, 3, 6, 7, 8)
  - [ ] Create `src/lib/queries/petty-cash.ts`
  - [ ] `getPettyCashByBranch(branchId)` — float, current balance, recent transactions
  - [ ] `getPettyCashSummary()` — all branches with float, balance, last reconciliation date
  - [ ] `getPettyCashTransactions(branchId, filters)` — paginated, filterable by type, category, date range
  - [ ] `getPettyCashBalance(branchId)` — calculated: float + replenishments - expenses
  - [ ] `getPettyCashRequests(branchId, status)` — pending/approved/rejected requests
  - [ ] `getReconciliationHistory(branchId)` — past reconciliation records
  - [ ] `getMonthlyReport(branchId, month, year)` — opening balance, transactions, closing balance, category breakdown

- [ ] **Task 5: Petty cash overview page** (AC 1, 2)
  - [ ] Create `src/app/(dashboard)/petty-cash/page.tsx`
  - [ ] Branch cards: each branch shows float amount, current balance, variance, last reconciliation date, transaction count this month
  - [ ] Admin can select branch to view details
  - [ ] "Set Float" button per branch (admin-only)
  - [ ] Color coding: green = balance healthy, yellow = balance < 20% of float, red = zero or negative

- [ ] **Task 6: Petty cash branch detail page** (AC 3, 4, 6, 7)
  - [ ] Create `src/app/(dashboard)/petty-cash/[branchId]/page.tsx`
  - [ ] Branch info header: name, float, current balance, status
  - [ ] Tabs: Transactions, Requests, Reconciliation, Reports
  - [ ] **Transactions Tab**: DataTable with date, description, type badge (Replenishment=green, Expense=red), category badge, amount (KES), running balance, receipt download link, recorded by
  - [ ] "Add Transaction" button
  - [ ] **Requests Tab**: list of petty cash requests with status, approve/reject buttons for admin
  - [ ] **Reconciliation Tab**: current system balance, physical count input, reconcile button, reconciliation history table
  - [ ] **Reports Tab**: monthly report (see Task 8)

- [ ] **Task 7: Petty cash forms** (AC 4, 5)
  - [ ] Create `src/components/forms/petty-cash-transaction-form.tsx`
  - [ ] Type toggle: Replenishment / Expense
  - [ ] Amount input (KES)
  - [ ] Description textarea
  - [ ] Category dropdown (shown for Expense type)
  - [ ] Receipt file upload (optional, uses storage abstraction from Story 9.1)
  - [ ] Create `src/components/forms/petty-cash-request-form.tsx`
  - [ ] Amount, description, purpose, urgency dropdown
  - [ ] Create `src/components/forms/petty-cash-reconciliation-form.tsx`
  - [ ] Physical count input (KES), date, notes
  - [ ] Shows system balance for comparison and auto-calculates variance

- [ ] **Task 8: Monthly report generation** (AC 8)
  - [ ] Create `src/lib/utils/petty-cash-report.ts`
  - [ ] Generate report data: opening balance, list of transactions, replenishments total, expenses total, closing balance, expenses by category (pie chart data)
  - [ ] Create report page component within branch detail
  - [ ] Month/year selector
  - [ ] Print-friendly CSS
  - [ ] CSV export of transactions
  - [ ] Optional: PDF export using jsPDF

## Dev Notes

- Petty cash is a critical feature for Kenyan law firms where many small expenses (court filing fees, transport, photocopying) are paid in cash
- Each branch operates its own petty cash fund; the float is the initial amount given to the branch (e.g., KES 20,000)
- Running balance calculation: `balance = float + SUM(replenishments) - SUM(expenses)`
- When balance runs low, a replenishment transaction tops it back up to the float amount
- The request/approval workflow is for staff requesting petty cash disbursement; once approved, an Expense transaction is auto-created
- Reconciliation compares the physical cash count (done by hand) with the system balance; any variance could indicate unrecorded transactions or errors
- Receipt uploads use the same storage abstraction from Story 9.1
- Categories should be Kenya-relevant: Office Supplies, Transport (matatu/taxi), Tea & Meals, Stationery, Cleaning, Repairs, Communication (airtime), Printing, Courier, Miscellaneous
- All amounts in KES with proper formatting
- Admin-only access for most operations; attorneys can submit requests but cannot add transactions directly
- Consider adding a warning when petty cash balance drops below 20% of float

### Project Structure Notes

Files to create:
- `src/lib/validators/petty-cash.ts` — Zod schemas
- `src/lib/actions/petty-cash.ts` — server actions
- `src/lib/queries/petty-cash.ts` — data queries
- `src/lib/utils/petty-cash-report.ts` — monthly report generation
- `src/app/(dashboard)/petty-cash/page.tsx` — petty cash overview page
- `src/app/(dashboard)/petty-cash/[branchId]/page.tsx` — branch detail page
- `src/components/forms/petty-cash-transaction-form.tsx` — transaction form
- `src/components/forms/petty-cash-request-form.tsx` — request form
- `src/components/forms/petty-cash-reconciliation-form.tsx` — reconciliation form

Files to modify:
- `src/app/(dashboard)/layout.tsx` — add Petty Cash nav item under Finance section

### References

- [Source: a.md - Module 18: Financial Management — Petty Cash Management]
- [Source: epics.md - Epic 12, Story 12.2]
- [Source: a.md - Feature Gap Analysis: #23 Petty Cash Management — from WakiliCMS]

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
