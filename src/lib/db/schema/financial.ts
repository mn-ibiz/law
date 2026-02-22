import { pgTable, uuid, text, timestamp, numeric, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { pettyCashType, reconciliationStatus } from "./enums";
import { users } from "./auth";

export const pettyCashTransactions = pgTable("petty_cash_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: pettyCashType("type").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description").notNull(),
  category: text("category"),
  receiptUrl: text("receipt_url"),
  performedBy: uuid("performed_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  approvedBy: uuid("approved_by").references(() => users.id, { onDelete: "set null" }),
  transactionDate: timestamp("transaction_date", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bankAccounts = pgTable("bank_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountName: text("account_name").notNull(),
  accountNumber: text("account_number").notNull().unique(),
  bankName: text("bank_name").notNull(),
  branchName: text("branch_name"),
  swiftCode: text("swift_code"),
  currency: text("currency").notNull().default("KES"),
  currentBalance: numeric("current_balance", { precision: 14, scale: 2 }).notNull().default("0"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bankTransactions = pgTable("bank_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  bankAccountId: uuid("bank_account_id")
    .notNull()
    .references(() => bankAccounts.id, { onDelete: "restrict" }),
  type: text("type").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  description: text("description"),
  reference: text("reference"),
  transactionDate: timestamp("transaction_date", { withTimezone: true }).notNull(),
  isReconciled: boolean("is_reconciled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bankReconciliations = pgTable("bank_reconciliations", {
  id: uuid("id").primaryKey().defaultRandom(),
  bankAccountId: uuid("bank_account_id")
    .notNull()
    .references(() => bankAccounts.id, { onDelete: "restrict" }),
  statementDate: timestamp("statement_date", { withTimezone: true }).notNull(),
  statementBalance: numeric("statement_balance", { precision: 14, scale: 2 }).notNull(),
  systemBalance: numeric("system_balance", { precision: 14, scale: 2 }).notNull(),
  difference: numeric("difference", { precision: 14, scale: 2 }).notNull().default("0"),
  status: reconciliationStatus("status").notNull().default("pending"),
  reconciledBy: uuid("reconciled_by").references(() => users.id, { onDelete: "set null" }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const pettyCashTransactionsRelations = relations(pettyCashTransactions, ({ one }) => ({
  performedByUser: one(users, {
    fields: [pettyCashTransactions.performedBy],
    references: [users.id],
  }),
  approvedByUser: one(users, {
    fields: [pettyCashTransactions.approvedBy],
    references: [users.id],
  }),
}));

export const bankAccountsRelations = relations(bankAccounts, ({ many }) => ({
  transactions: many(bankTransactions),
  reconciliations: many(bankReconciliations),
}));

export const bankTransactionsRelations = relations(bankTransactions, ({ one }) => ({
  bankAccount: one(bankAccounts, {
    fields: [bankTransactions.bankAccountId],
    references: [bankAccounts.id],
  }),
}));

export const bankReconciliationsRelations = relations(bankReconciliations, ({ one }) => ({
  bankAccount: one(bankAccounts, {
    fields: [bankReconciliations.bankAccountId],
    references: [bankAccounts.id],
  }),
  reconciledByUser: one(users, {
    fields: [bankReconciliations.reconciledBy],
    references: [users.id],
  }),
}));
