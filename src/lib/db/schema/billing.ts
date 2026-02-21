import { pgTable, uuid, text, timestamp, numeric, integer, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { invoiceStatus, paymentMethod, trustAccountType, trustTransactionType, quoteStatus } from "./enums";
import { users } from "./auth";
import { cases } from "./cases";
import { clients } from "./clients";

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceNumber: text("invoice_number").notNull().unique(),
    caseId: uuid("case_id").references(() => cases.id, { onDelete: "set null" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: invoiceStatus("status").notNull().default("draft"),
    subtotal: numeric("subtotal", { precision: 14, scale: 2 }).notNull().default("0"),
    vatRate: numeric("vat_rate", { precision: 5, scale: 2 }).default("16"),
    vatAmount: numeric("vat_amount", { precision: 14, scale: 2 }).notNull().default("0"),
    totalAmount: numeric("total_amount", { precision: 14, scale: 2 }).notNull().default("0"),
    paidAmount: numeric("paid_amount", { precision: 14, scale: 2 }).notNull().default("0"),
    currency: text("currency").notNull().default("KES"),
    dueDate: timestamp("due_date", { withTimezone: true }),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("invoices_invoice_number_idx").on(table.invoiceNumber),
    index("invoices_status_idx").on(table.status),
    index("invoices_client_id_idx").on(table.clientId),
  ]
);

export const invoiceLineItems = pgTable("invoice_line_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull().default("1"),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  timeEntryId: uuid("time_entry_id"),
  expenseId: uuid("expense_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "restrict" }),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  method: paymentMethod("method").notNull(),
  reference: text("reference"),
  mpesaTransactionId: text("mpesa_transaction_id"),
  receivedBy: uuid("received_by").references(() => users.id, { onDelete: "set null" }),
  paymentDate: timestamp("payment_date", { withTimezone: true }).defaultNow().notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const trustAccounts = pgTable("trust_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountName: text("account_name").notNull(),
  accountNumber: text("account_number").notNull().unique(),
  type: trustAccountType("type").notNull().default("client"),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "set null" }),
  balance: numeric("balance", { precision: 14, scale: 2 }).notNull().default("0"),
  bankName: text("bank_name"),
  branchName: text("branch_name"),
  currency: text("currency").notNull().default("KES"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const trustTransactions = pgTable("trust_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id")
    .notNull()
    .references(() => trustAccounts.id, { onDelete: "restrict" }),
  type: trustTransactionType("type").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  description: text("description").notNull(),
  reference: text("reference"),
  caseId: uuid("case_id").references(() => cases.id, { onDelete: "set null" }),
  performedBy: uuid("performed_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const quotes = pgTable("quotes", {
  id: uuid("id").primaryKey().defaultRandom(),
  quoteNumber: text("quote_number").notNull().unique(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "restrict" }),
  caseId: uuid("case_id").references(() => cases.id, { onDelete: "set null" }),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: quoteStatus("status").notNull().default("draft"),
  subtotal: numeric("subtotal", { precision: 14, scale: 2 }).notNull().default("0"),
  vatAmount: numeric("vat_amount", { precision: 14, scale: 2 }).notNull().default("0"),
  totalAmount: numeric("total_amount", { precision: 14, scale: 2 }).notNull().default("0"),
  validUntil: timestamp("valid_until", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const receipts = pgTable("receipts", {
  id: uuid("id").primaryKey().defaultRandom(),
  receiptNumber: text("receipt_number").notNull().unique(),
  paymentId: uuid("payment_id")
    .notNull()
    .references(() => payments.id, { onDelete: "restrict" }),
  issuedTo: text("issued_to").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const creditNotes = pgTable("credit_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  creditNoteNumber: text("credit_note_number").notNull().unique(),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "restrict" }),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  reason: text("reason").notNull(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  case: one(cases, { fields: [invoices.caseId], references: [cases.id] }),
  client: one(clients, { fields: [invoices.clientId], references: [clients.id] }),
  createdByUser: one(users, { fields: [invoices.createdBy], references: [users.id] }),
  lineItems: many(invoiceLineItems),
  payments: many(payments),
  creditNotes: many(creditNotes),
}));

export const invoiceLineItemsRelations = relations(invoiceLineItems, ({ one }) => ({
  invoice: one(invoices, { fields: [invoiceLineItems.invoiceId], references: [invoices.id] }),
}));

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  invoice: one(invoices, { fields: [payments.invoiceId], references: [invoices.id] }),
  receivedByUser: one(users, { fields: [payments.receivedBy], references: [users.id] }),
  receipts: many(receipts),
}));

export const trustAccountsRelations = relations(trustAccounts, ({ one, many }) => ({
  client: one(clients, { fields: [trustAccounts.clientId], references: [clients.id] }),
  transactions: many(trustTransactions),
}));

export const trustTransactionsRelations = relations(trustTransactions, ({ one }) => ({
  account: one(trustAccounts, {
    fields: [trustTransactions.accountId],
    references: [trustAccounts.id],
  }),
  case: one(cases, { fields: [trustTransactions.caseId], references: [cases.id] }),
  performedByUser: one(users, {
    fields: [trustTransactions.performedBy],
    references: [users.id],
  }),
}));

export const quotesRelations = relations(quotes, ({ one }) => ({
  client: one(clients, { fields: [quotes.clientId], references: [clients.id] }),
  case: one(cases, { fields: [quotes.caseId], references: [cases.id] }),
  createdByUser: one(users, { fields: [quotes.createdBy], references: [users.id] }),
}));

export const receiptsRelations = relations(receipts, ({ one }) => ({
  payment: one(payments, { fields: [receipts.paymentId], references: [payments.id] }),
}));

export const creditNotesRelations = relations(creditNotes, ({ one }) => ({
  invoice: one(invoices, { fields: [creditNotes.invoiceId], references: [invoices.id] }),
  createdByUser: one(users, { fields: [creditNotes.createdBy], references: [users.id] }),
}));
