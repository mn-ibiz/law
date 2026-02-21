# Story 12.1: Trust / Client Account Management

Status: ready-for-dev

## Story

As an Admin,
I want trust accounts with per-client tracking and safeguards,
so that client funds are properly separated per the Advocates Act.

## Acceptance Criteria (ACs)

1. Trust accounts page: list displaying account name, bank, account number, type (IOLTA/Client Trust/Operating), and current balance (KES)
2. Create trust account form with fields: account name, bank name, account number, account type (IOLTA/Client Trust/Operating)
3. Trust account detail page showing: account information, per-client balance table, and full transaction ledger
4. Per-client balance table: client name, case reference, balance (KES) — showing each client's individual balance within the trust account
5. Transaction ledger: date, client, case, transaction type (Deposit/Withdrawal/Transfer/Interest/Fee), amount (KES), running balance, description, reference number
6. Trust transaction form: account (required), client (required), case (optional), type (Deposit/Withdrawal/Transfer/Interest/Fee), amount (KES), description, reference, date, related fee note (optional)
7. **Compliance safeguard (CRITICAL):** Cannot withdraw more than a client's available balance within the trust account — server-side hard block with clear error message
8. **Compliance safeguard (CRITICAL):** Per-client sub-ledger maintains individual running balances; client funds cannot be mixed between clients
9. Running balance auto-calculated on every transaction, maintained per-client and per-account
10. Three-way reconciliation view: bank balance (manual entry by admin), book balance (sum of all transactions), client balances sum (total of all per-client balances) — with discrepancy highlighting when any of the three do not match

## Tasks / Subtasks

- [ ] **Task 1: Zod validation schemas** (AC 2, 6)
  - [ ] Create `src/lib/validators/trust-accounts.ts`
  - [ ] `trustAccountSchema`: name (required), bank name (required), account number (required), type enum (IOLTA/Client Trust/Operating)
  - [ ] `trustTransactionSchema`: account ID (required), client ID (required), case ID (optional), type enum (Deposit/Withdrawal/Transfer/Interest/Fee), amount (required, positive number), description (required), reference (optional), date (required, defaults today), related fee note ID (optional)
  - [ ] `bankBalanceEntrySchema`: account ID, bank balance amount, as-of date — for three-way reconciliation

- [ ] **Task 2: Server actions for trust accounts** (AC 2)
  - [ ] Create `src/lib/actions/trust-accounts.ts`
  - [ ] `createTrustAccount(data)` — validate, insert, audit log
  - [ ] `updateTrustAccount(id, data)` — validate, update, audit log
  - [ ] `deactivateTrustAccount(id)` — check zero balance across all clients, soft-delete, audit log

- [ ] **Task 3: Server actions for trust transactions with compliance safeguards** (AC 6, 7, 8, 9)
  - [ ] Add to `src/lib/actions/trust-accounts.ts`:
  - [ ] `createTrustTransaction(data)` — validate, perform compliance checks, insert transaction, update running balances, audit log
  - [ ] **Withdrawal compliance check (CRITICAL):**
    - [ ] Query client's current balance in this trust account
    - [ ] If withdrawal amount > client balance, reject with error "Insufficient client trust balance. Available: KES X. Requested: KES Y."
    - [ ] This check MUST be server-side; cannot rely on client-side validation alone
    - [ ] Use database transaction to ensure atomicity (read balance + insert transaction + update balance in one transaction)
  - [ ] **Deposit:** add to client's running balance
  - [ ] **Transfer:** deduct from source client, add to destination client (or between accounts)
  - [ ] **Interest:** add to account (may be distributed to clients or held)
  - [ ] **Fee:** deduct from client (e.g., bank charges)
  - [ ] `updateBankBalance(accountId, bankBalance, asOfDate)` — for three-way reconciliation

- [ ] **Task 4: Per-client balance calculation** (AC 4, 8, 9)
  - [ ] Create `src/lib/queries/trust-accounts.ts`
  - [ ] `getTrustAccounts()` — list all trust accounts with total balances
  - [ ] `getTrustAccountById(id)` — full account details
  - [ ] `getClientBalances(accountId)` — aggregate transactions by client to compute per-client balances: `SUM(deposits + interest) - SUM(withdrawals + fees + transfers_out)` per client
  - [ ] `getClientTrustBalance(accountId, clientId)` — single client's balance (used in withdrawal validation and payment drawdown)
  - [ ] `getTrustTransactions(accountId, filters)` — paginated ledger with running balance, filterable by client, case, type, date range
  - [ ] `getThreeWayReconciliation(accountId)` — returns { bankBalance, bookBalance, clientBalancesSum, discrepancies }

- [ ] **Task 5: Running balance computation** (AC 9)
  - [ ] Implement running balance as a calculated field in the transaction ledger query
  - [ ] Option A: Use SQL window function `SUM(CASE WHEN type IN ('Deposit','Interest') THEN amount ELSE -amount END) OVER (ORDER BY date, id)` for account-level running balance
  - [ ] Option B: Store running balance on each transaction record (computed at insert time)
  - [ ] Recommend Option B for performance; the computed balance is set during `createTrustTransaction` within the same DB transaction
  - [ ] Per-client running balance tracked separately: `SUM by client_id`

- [ ] **Task 6: Trust accounts list page** (AC 1)
  - [ ] Create `src/app/(dashboard)/trust-accounts/page.tsx`
  - [ ] DataTable columns: account name, bank, account number, type badge, total balance (KES), client count, actions
  - [ ] Summary cards: total trust funds held, number of accounts, total clients with trust balances
  - [ ] "New Trust Account" button
  - [ ] Admin-only access enforcement

- [ ] **Task 7: Trust account detail page** (AC 3, 4, 5, 10)
  - [ ] Create `src/app/(dashboard)/trust-accounts/[id]/page.tsx`
  - [ ] **Account Info Card**: name, bank, number, type, total balance
  - [ ] **Per-Client Balances Table** (AC 4): client name (link), case references, balance (KES), "New Transaction" button per client
  - [ ] **Transaction Ledger** (AC 5): DataTable with date, client, case, type badge, description, reference, debit/credit columns, running balance — filterable by client, type, date range
  - [ ] **Three-Way Reconciliation Section** (AC 10):
    - [ ] Bank Balance input field (manual entry with date)
    - [ ] Book Balance (auto-calculated from transactions)
    - [ ] Client Balances Sum (auto-calculated from per-client balances)
    - [ ] Discrepancy display: if all three match, show green checkmark; if any differ, show red warning with difference amounts
  - [ ] "Record Transaction" button

- [ ] **Task 8: Trust transaction form** (AC 6)
  - [ ] Create `src/components/forms/trust-transaction-form.tsx`
  - [ ] Account dropdown (auto-filled if opened from account detail)
  - [ ] Client searchable combobox (required)
  - [ ] Case searchable combobox (optional, filtered by selected client)
  - [ ] Transaction type dropdown (Deposit/Withdrawal/Transfer/Interest/Fee)
  - [ ] Amount input (KES)
  - [ ] Description textarea (required)
  - [ ] Reference number text input
  - [ ] Date picker (defaults today)
  - [ ] Related fee note dropdown (optional, filtered by client)
  - [ ] **If Withdrawal:** display current client balance prominently; disable submit if amount > balance
  - [ ] Form rendered in Dialog/Sheet

- [ ] **Task 9: Three-way reconciliation logic** (AC 10)
  - [ ] Create `src/lib/utils/trust-reconciliation.ts`
  - [ ] `calculateReconciliation(bankBalance, transactions, clientBalances)` — compare three figures
  - [ ] Flag discrepancies with explanatory messages
  - [ ] Track reconciliation history (date, bank balance entered, book balance, client sum, reconciled by)

- [ ] **Task 10: Trust account compliance warnings** (AC 7, 8)
  - [ ] Add compliance warning banners to trust account pages
  - [ ] Warning if any client has a negative balance (should never happen with safeguards, but defensive)
  - [ ] Warning if book balance differs from client balances sum (data integrity issue)
  - [ ] Info banner reminding: "Client funds must be kept separate per the Advocates (Accounts) Rules"

## Dev Notes

- **Advocates (Accounts) Rules (L.N. 137/1966) compliance is the single most critical aspect of this story.** The rules mandate:
  1. Client money accounts MUST be separate from the advocate's own money
  2. Detailed record-keeping of all client fund transactions
  3. Per-client sub-ledger tracking — funds for Client A cannot be used for Client B's matters
  4. Prescribed rules for payments into and out of client accounts
  5. Preservation of accounting records
- The withdrawal safeguard MUST use a database transaction to prevent race conditions: read client balance and insert transaction atomically
- In Drizzle ORM, use `db.transaction(async (tx) => { ... })` for atomic trust operations
- Trust account types: IOLTA (Interest on Lawyers' Trust Accounts) is the standard interest-bearing trust account; Client Trust is a non-interest or specific client account; Operating is the firm's own account (not for client funds)
- The three-way reconciliation is an auditing tool: Bank Balance (from bank statement) should equal Book Balance (sum of all transactions) should equal Client Balances Sum (sum of all per-client balances)
- For the Trust Account Drawdown payment method (Story 11.4), this story provides the queries and validation — `getClientTrustBalance(accountId, clientId)` must be accurate and real-time
- All amounts in KES; trust balances must never go negative at the client level
- Consider adding an audit log entry with a special flag for trust transactions for regulatory reporting

### Project Structure Notes

Files to create:
- `src/lib/validators/trust-accounts.ts` — Zod schemas
- `src/lib/actions/trust-accounts.ts` — server actions with compliance safeguards
- `src/lib/queries/trust-accounts.ts` — data queries including per-client balances
- `src/lib/utils/trust-reconciliation.ts` — three-way reconciliation logic
- `src/app/(dashboard)/trust-accounts/page.tsx` — trust accounts list page
- `src/app/(dashboard)/trust-accounts/[id]/page.tsx` — trust account detail page
- `src/components/forms/trust-transaction-form.tsx` — trust transaction form

Files to modify:
- `src/app/(dashboard)/layout.tsx` — add Trust Accounts nav item under Finance section

### References

- [Source: a.md - Module 10: Trust / IOLTA Accounting]
- [Source: a.md - Kenya Legal Requirements: #4 Client Account Rules — Advocates (Accounts) Rules, L.N. 137/1966]
- [Source: epics.md - Epic 12, Story 12.1]
- [Source: a.md - Feature Gap Analysis: trust accounting compliance]

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
