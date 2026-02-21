# Story 17.3: Trust Account & Financial Reports

Status: ready-for-dev

## Story

As an Admin,
I want trust account and financial reports,
so that compliance and finances are monitored across the firm.

## Acceptance Criteria (ACs)

1. **Trust Balance by Client:** Table showing each client with their current trust account balance, the trust account name, and last transaction date. Sortable by client name and balance amount.
2. **Trust Transaction History:** Filterable ledger showing all trust transactions with columns: date, client, case, transaction type (Deposit/Withdrawal/Transfer/Interest/Fee), amount (debit/credit), running balance, description, and reference. Filters for client, case, account, date range, and transaction type.
3. **Three-Way Reconciliation Summary:** Report showing bank balance (manual entry or from last reconciliation), book balance (system-calculated), sum of all client balances, and any discrepancy highlighted in red with the variance amount.
4. **Petty Cash Transactions per Branch:** Table/report showing petty cash transactions per branch with: date, description, amount (in/out), running balance, recorded by. Filter by branch and date range.
5. **Petty Cash Reconciliation Status:** Summary showing each branch's petty cash float, current system balance, last reconciliation date, and reconciliation status (Reconciled/Pending/Discrepancy).
6. **Bank Reconciliation Summary:** Report showing matched vs unmatched transaction counts and amounts, per bank account, with reconciliation date and reconciled_by.
7. **Branch-Specific Financial Reports:** Ability to view all financial metrics (trust, petty cash, revenue) filtered by a specific branch.
8. **Consolidated Firm-Wide Totals:** Aggregated totals across all branches displayed as summary cards at the top of financial reports.
9. **CSV Export:** All tables and reports have CSV export functionality for the current filtered view.

## Tasks / Subtasks

- [ ] **Task 1: Implement trust report queries** (AC 1, 2, 3)
  - Create `src/lib/queries/reports/trust.ts` with:
    - `getTrustBalanceByClient(filters)` - per-client trust balances from trust_transactions, grouped by client with SUM
    - `getTrustTransactionHistory(filters)` - full transaction ledger with running balance (window function), filtered by client/case/account/date/type
    - `getThreeWayReconciliation(accountId)` - bank balance from last reconciliation, book balance from transactions, client balances sum, discrepancy calculation

- [ ] **Task 2: Build trust report components** (AC 1, 2, 3)
  - Create `src/components/reports/trust/trust-balance-by-client.tsx` - DataTable with client name, account, balance (KES), last transaction date
  - Create `src/components/reports/trust/trust-transaction-ledger.tsx` - DataTable with all ledger columns, inline filters, running balance column
  - Create `src/components/reports/trust/three-way-reconciliation.tsx` - summary card showing bank balance, book balance, client balances sum, discrepancy (highlighted red if non-zero)

- [ ] **Task 3: Implement petty cash report queries** (AC 4, 5)
  - Create `src/lib/queries/reports/petty-cash.ts` with:
    - `getPettyCashTransactions(branchId, filters)` - transactions list with running balance
    - `getPettyCashReconciliationStatus()` - per-branch float, current balance, last reconciliation, status

- [ ] **Task 4: Build petty cash report components** (AC 4, 5)
  - Create `src/components/reports/financial/petty-cash-transactions.tsx` - DataTable with branch filter, date range, in/out columns
  - Create `src/components/reports/financial/petty-cash-reconciliation-status.tsx` - summary table with status badges (green=Reconciled, yellow=Pending, red=Discrepancy)

- [ ] **Task 5: Implement bank reconciliation report query** (AC 6)
  - Add `getBankReconciliationSummary(filters)` to `src/lib/queries/reports/financial.ts` returning matched/unmatched counts and amounts per bank account

- [ ] **Task 6: Build bank reconciliation report component** (AC 6)
  - Create `src/components/reports/financial/bank-reconciliation-summary.tsx` - table with account name, matched count/amount, unmatched count/amount, last reconciliation date, reconciled_by

- [ ] **Task 7: Implement branch-specific and consolidated queries** (AC 7, 8)
  - Add branch filter parameter to all trust and financial queries
  - Create `getConsolidatedFinancialSummary()` in `src/lib/queries/reports/financial.ts` aggregating totals across branches (total trust balances, total petty cash, total revenue)

- [ ] **Task 8: Build consolidated summary cards** (AC 8)
  - Create `src/components/reports/financial/consolidated-summary.tsx` - row of shadcn Cards showing firm-wide totals: Total Trust Balances, Total Petty Cash, Total Bank Balances, all in KES

- [ ] **Task 9: Assemble trust and financial report pages** (AC 1-9)
  - Create `src/app/(dashboard)/reports/trust/page.tsx` with trust balance, ledger, three-way reconciliation
  - Create `src/app/(dashboard)/reports/financial/page.tsx` with petty cash, bank reconciliation, consolidated summary
  - Both pages include filter bar, CSV export buttons, loading skeletons
  - Add Trust and Financial tabs to reports layout navigation

- [ ] **Task 10: CSV export for all report sections** (AC 9)
  - Wire CSV export button to each table/section using the shared `csv-export.ts` utility from Story 17.1
  - Ensure trust ledger exports include running balance column

## Dev Notes

- **Running Balance:** Use PostgreSQL window functions (`SUM() OVER (ORDER BY date)`) for running balance in trust transaction ledger. Alternatively, compute in application layer if pagination is needed.
- **Three-Way Reconciliation:** This is a critical compliance feature. The three values (bank balance, book balance, client sub-ledger sum) must always be shown together. Any discrepancy must be visually prominent. Bank balance is sourced from the most recent `bank_reconciliations` record for that trust account.
- **Client Sub-Ledger:** Trust balances per client are derived from `trust_transactions` where each transaction is linked to a client. The sum of all client balances should equal the book balance of the trust account.
- **Branch Filtering:** All financial queries must accept an optional `branchId` parameter. When null, show consolidated. When set, filter transactions/accounts by branch.
- **Petty Cash Float:** Each branch has a configured petty cash float (set in branch settings). The current balance is float minus expenses plus replenishments.
- **Performance:** Trust transaction ledger may be large. Implement server-side pagination with cursor-based approach. Add indexes on `trust_transactions.account_id`, `trust_transactions.client_id`, `trust_transactions.transaction_date`.
- **KES Formatting:** Reuse `formatKES()` from Story 17.1's `src/lib/utils/format.ts`.

### Project Structure Notes

**New files to create:**
- `src/app/(dashboard)/reports/trust/page.tsx`
- `src/app/(dashboard)/reports/financial/page.tsx`
- `src/components/reports/trust/trust-balance-by-client.tsx`
- `src/components/reports/trust/trust-transaction-ledger.tsx`
- `src/components/reports/trust/three-way-reconciliation.tsx`
- `src/components/reports/financial/petty-cash-transactions.tsx`
- `src/components/reports/financial/petty-cash-reconciliation-status.tsx`
- `src/components/reports/financial/bank-reconciliation-summary.tsx`
- `src/components/reports/financial/consolidated-summary.tsx`
- `src/lib/queries/reports/trust.ts`
- `src/lib/queries/reports/petty-cash.ts`
- `src/lib/queries/reports/financial.ts`

**Files to modify:**
- `src/app/(dashboard)/reports/layout.tsx` (add Trust and Financial nav tabs)

### References

- [Source: a.md -- Law Firm Registry Implementation Plan]
- [Source: epics.md -- Epic 17: Reports & Analytics, Story 17.3]
- [Source: epics.md -- Epic 12: Trust Accounts & Financial Operations] (for data model context)
- Drizzle ORM window functions: use `sql` template literal for raw SQL with window functions

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
