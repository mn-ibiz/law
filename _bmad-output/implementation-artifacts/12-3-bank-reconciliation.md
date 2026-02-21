# Story 12.3: Bank Reconciliation

Status: ready-for-dev

## Story

As an Admin,
I want to reconcile bank transactions,
so that finances are accurate.

## Acceptance Criteria (ACs)

1. Bank account selection: Admin selects which bank account to reconcile from a list of configured accounts
2. Record bank transactions: manual entry or CSV import with fields — date, description, reference, debit amount, credit amount, balance
3. Match bank transactions to system transactions: payments received, trust deposits, expenses, petty cash replenishments
4. Auto-match capability: automatically match bank transactions to system transactions by reference number and amount
5. Manual match for items that auto-match cannot resolve: drag-and-drop or checkbox selection to pair bank transactions with system transactions
6. Unmatched items highlighted on both sides (bank transactions without system matches, system transactions without bank matches)
7. Reconciliation statement generated: bank balance, system balance, matched items count and total, unmatched items list, adjustment notes
8. Save reconciliation record with date and reconciled_by user
9. Bank accounts management: add, edit bank accounts with fields — name, bank name, account number, type (Client Account/Office Account/Petty Cash)

## Tasks / Subtasks

- [ ] **Task 1: Zod validation schemas** (AC 2, 9)
  - [ ] Create `src/lib/validators/bank-reconciliation.ts`
  - [ ] `bankAccountSchema`: name (required), bank name (required), account number (required), type enum (Client Account/Office Account/Petty Cash), branch ID (optional)
  - [ ] `bankTransactionSchema`: bank account ID (required), date (required), description (required), reference (optional), debit (optional, KES), credit (optional, KES), balance (optional, KES)
  - [ ] `bankTransactionCSVSchema`: validates CSV row structure
  - [ ] `reconciliationMatchSchema`: bank transaction ID, system transaction ID, match type (auto/manual)
  - [ ] `reconciliationSchema`: bank account ID, date, bank balance (KES), notes

- [ ] **Task 2: Server actions for bank accounts** (AC 9)
  - [ ] Create `src/lib/actions/bank-accounts.ts`
  - [ ] `createBankAccount(data)` — validate, insert, audit log
  - [ ] `updateBankAccount(id, data)` — validate, update, audit log
  - [ ] `deactivateBankAccount(id)` — soft-delete, audit log

- [ ] **Task 3: Server actions for bank transactions** (AC 2)
  - [ ] Create `src/lib/actions/bank-transactions.ts`
  - [ ] `addBankTransaction(data)` — validate, insert single transaction, audit log
  - [ ] `importBankTransactionsCSV(bankAccountId, file)` — parse CSV, validate each row, insert all valid rows, return import summary (imported count, error count, errors detail), audit log
  - [ ] CSV parser: handle common bank statement formats — detect columns (date, description, reference, debit, credit, balance), handle date formats (DD/MM/YYYY), handle KES amount formats (with commas, parentheses for debits)

- [ ] **Task 4: Auto-matching engine** (AC 3, 4)
  - [ ] Create `src/lib/utils/bank-reconciliation.ts`
  - [ ] `autoMatchTransactions(bankTransactions, systemTransactions)` — returns matched pairs and unmatched items
  - [ ] Matching rules (in priority order):
    1. Exact match on reference number AND amount
    2. Exact match on amount AND date (within 3-day tolerance)
    3. Exact match on reference number only (flag for review if amounts differ)
  - [ ] System transactions include: payments (from Story 11.4), trust transactions (from Story 12.1), expense disbursements, petty cash replenishments
  - [ ] Return structure: `{ matched: [{ bankTx, systemTx, matchType, confidence }], unmatchedBank: [...], unmatchedSystem: [...] }`

- [ ] **Task 5: Server actions for reconciliation** (AC 4, 5, 7, 8)
  - [ ] Create `src/lib/actions/bank-reconciliation.ts`
  - [ ] `runAutoMatch(bankAccountId, dateRange)` — fetch bank transactions and system transactions for the period, run auto-match, save preliminary matches
  - [ ] `confirmMatch(bankTransactionId, systemTransactionId)` — manually confirm or create a match pair
  - [ ] `unmatch(matchId)` — remove a match pairing
  - [ ] `saveReconciliation(bankAccountId, data)` — save final reconciliation record with date, bank balance, system balance, matched count, unmatched details, reconciled_by, notes, audit log
  - [ ] `getReconciliationHistory(bankAccountId)` — past reconciliations

- [ ] **Task 6: Data queries for bank reconciliation** (AC 1, 3, 6, 7)
  - [ ] Create `src/lib/queries/bank-reconciliation.ts`
  - [ ] `getBankAccounts()` — list all bank accounts with latest balance and last reconciliation date
  - [ ] `getBankAccountById(id)` — full details
  - [ ] `getBankTransactions(accountId, filters)` — paginated, filterable by date range, matched/unmatched status
  - [ ] `getSystemTransactions(dateRange)` — aggregate all system transactions (payments, trust, expenses) for matching
  - [ ] `getReconciliationSummary(accountId)` — bank balance, system balance, matched, unmatched counts
  - [ ] `getReconciliationById(id)` — full reconciliation details with all matches

- [ ] **Task 7: Bank accounts management page** (AC 9)
  - [ ] Create `src/app/(dashboard)/bank-accounts/page.tsx`
  - [ ] DataTable columns: name, bank, account number, type badge, branch, balance, last reconciliation date, actions
  - [ ] "Add Bank Account" button
  - [ ] Create `src/components/forms/bank-account-form.tsx`
  - [ ] Fields: name, bank name, account number, type dropdown, branch dropdown (optional)

- [ ] **Task 8: Bank reconciliation page** (AC 1, 2, 3, 4, 5, 6)
  - [ ] Create `src/app/(dashboard)/bank-reconciliation/page.tsx`
  - [ ] Step 1: Select bank account from dropdown
  - [ ] Step 2: Select date range for reconciliation period
  - [ ] Step 3: Import/add bank transactions (if not already imported)
  - [ ] Step 4: View matching workspace

- [ ] **Task 9: Reconciliation matching workspace** (AC 4, 5, 6)
  - [ ] Create `src/components/shared/reconciliation-workspace.tsx` as Client Component
  - [ ] Split-panel layout:
    - [ ] **Left panel: Bank Transactions** — list of bank transactions for the period (date, description, reference, debit/credit, matched status)
    - [ ] **Right panel: System Transactions** — list of system transactions for the period (date, type, description, reference, amount, matched status)
  - [ ] Matched items shown with green background and link to their match pair
  - [ ] Unmatched items shown with yellow/red highlight
  - [ ] "Auto-Match" button: runs auto-matching algorithm, highlights results
  - [ ] Manual matching: select a bank transaction, then select a system transaction, click "Match" to pair them
  - [ ] "Unmatch" button to remove incorrect matches
  - [ ] Summary bar: total bank transactions, total system transactions, matched count, unmatched count

- [ ] **Task 10: CSV import for bank transactions** (AC 2)
  - [ ] Create `src/components/forms/bank-csv-import-form.tsx`
  - [ ] File upload (CSV only)
  - [ ] Column mapping UI: for each required field (date, description, reference, debit, credit), user selects which CSV column maps to it
  - [ ] Preview first 5 rows after mapping
  - [ ] Import button with progress indicator
  - [ ] Import result summary: imported, skipped, errors

- [ ] **Task 11: Reconciliation statement and save** (AC 7, 8)
  - [ ] Create `src/components/shared/reconciliation-statement.tsx`
  - [ ] Display: bank balance (from statement), system balance (calculated), difference
  - [ ] Matched items total
  - [ ] List of unmatched bank items (potential deposits in transit or bank errors)
  - [ ] List of unmatched system items (potential outstanding checks or recording errors)
  - [ ] Adjustment notes textarea
  - [ ] "Save Reconciliation" button — saves record with timestamp and reconciled_by
  - [ ] After save: reconciliation summary becomes read-only record

- [ ] **Task 12: Reconciliation history** (AC 8)
  - [ ] Add reconciliation history tab/section to bank account detail
  - [ ] Table: reconciliation date, period, bank balance, system balance, matched count, unmatched count, reconciled by, status badge

## Dev Notes

- Bank reconciliation is a core accounting function; for Kenyan law firms it is particularly important for trust (client) accounts where regulatory compliance requires accurate records
- The CSV import is the most common way bank transactions enter the system; Kenya bank statements typically export as CSV with columns for date, description, reference, debit, credit, and running balance
- Common Kenya bank date formats: DD/MM/YYYY, DD-MMM-YYYY (e.g., 15-Jan-2026); the CSV parser should handle multiple formats
- Kenya bank amount formats may include: comma-separated thousands (1,500.00), parentheses for debits ((1,500.00)), or separate debit/credit columns
- The auto-matching engine should be conservative — only auto-match with high confidence; uncertain matches should be flagged for manual review
- System transactions span multiple tables: payments (from fee notes), trust transactions, expense reimbursements, petty cash replenishments; the query needs to aggregate from all sources
- Bank account types align with Kenya legal practice: Client Account (trust/IOLTA — mandated separate), Office Account (firm's operating account), Petty Cash (for petty cash tracking reconciliation)
- The reconciliation workspace is the most complex UI component; it should be responsive but optimized for desktop use (dual-panel layout)
- Consider using a transaction matching score (0-100) for auto-matches to allow configurable confidence thresholds
- All amounts in KES with `Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' })`
- Admin-only access for all bank reconciliation features

### Project Structure Notes

Files to create:
- `src/lib/validators/bank-reconciliation.ts` — Zod schemas
- `src/lib/actions/bank-accounts.ts` — bank account CRUD
- `src/lib/actions/bank-transactions.ts` — bank transaction entry and CSV import
- `src/lib/actions/bank-reconciliation.ts` — reconciliation matching and saving
- `src/lib/queries/bank-reconciliation.ts` — data queries
- `src/lib/utils/bank-reconciliation.ts` — auto-matching engine
- `src/lib/utils/csv-parser.ts` — CSV parsing utility for bank statements
- `src/app/(dashboard)/bank-accounts/page.tsx` — bank accounts management
- `src/app/(dashboard)/bank-reconciliation/page.tsx` — reconciliation workspace
- `src/components/forms/bank-account-form.tsx` — bank account form
- `src/components/forms/bank-csv-import-form.tsx` — CSV import form
- `src/components/shared/reconciliation-workspace.tsx` — matching workspace
- `src/components/shared/reconciliation-statement.tsx` — reconciliation statement

Files to modify:
- `src/app/(dashboard)/layout.tsx` — add Bank Accounts and Bank Reconciliation nav items under Finance section

### References

- [Source: a.md - Module 18: Financial Management — Bank Reconciliation]
- [Source: epics.md - Epic 12, Story 12.3]
- [Source: a.md - Feature Gap Analysis: #24 Bank Reconciliation — from WakiliCMS, AJS, LexPro]
- [Source: a.md - Kenya Legal Requirements: #4 Client Account Rules — record-keeping requirements]

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
