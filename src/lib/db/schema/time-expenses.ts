import { pgTable, uuid, text, boolean, timestamp, numeric, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { expenseCategory, requisitionStatus } from "./enums";
import { users } from "./auth";
import { cases } from "./cases";
import { organizations } from "./organizations";

export const timeEntries = pgTable(
  "time_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    caseId: uuid("case_id").references(() => cases.id, { onDelete: "set null" }),
    description: text("description").notNull(),
    date: timestamp("date", { withTimezone: true }).notNull(),
    hours: numeric("hours", { precision: 5, scale: 2 }).notNull(),
    rate: numeric("rate", { precision: 10, scale: 2 }),
    amount: numeric("amount", { precision: 12, scale: 2 }),
    isBillable: boolean("is_billable").notNull().default(true),
    isBilled: boolean("is_billed").notNull().default(false),
    invoiceId: uuid("invoice_id"), // FK to invoices managed via ORM relations to avoid circular imports
    timerStart: timestamp("timer_start", { withTimezone: true }),
    timerEnd: timestamp("timer_end", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("time_entries_date_idx").on(table.date),
    index("time_entries_user_id_idx").on(table.userId),
    index("time_entries_case_id_idx").on(table.caseId),
    index("time_entries_organization_id_idx").on(table.organizationId),
  ]
);

export const expenses = pgTable(
  "expenses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    caseId: uuid("case_id").references(() => cases.id, { onDelete: "set null" }),
    category: expenseCategory("category").notNull(),
    description: text("description").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    date: timestamp("date", { withTimezone: true }).notNull(),
    receiptUrl: text("receipt_url"),
    isBillable: boolean("is_billable").notNull().default(true),
    isBilled: boolean("is_billed").notNull().default(false),
    invoiceId: uuid("invoice_id"), // FK to invoices managed via ORM relations to avoid circular imports
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("expenses_user_id_idx").on(table.userId),
    index("expenses_date_idx").on(table.date),
    index("expenses_organization_id_idx").on(table.organizationId),
  ]
);

export const requisitions = pgTable(
  "requisitions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    requisitionNumber: text("requisition_number").notNull(),
    requestedBy: uuid("requested_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    approvedBy: uuid("approved_by").references(() => users.id, { onDelete: "set null" }),
    caseId: uuid("case_id").references(() => cases.id, { onDelete: "set null" }),
    description: text("description").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    status: requisitionStatus("status").notNull().default("draft"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("requisitions_org_requisition_number_idx").on(table.organizationId, table.requisitionNumber),
    index("requisitions_organization_id_idx").on(table.organizationId),
  ]
);

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  user: one(users, { fields: [timeEntries.userId], references: [users.id] }),
  case: one(cases, { fields: [timeEntries.caseId], references: [cases.id] }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, { fields: [expenses.userId], references: [users.id] }),
  case: one(cases, { fields: [expenses.caseId], references: [cases.id] }),
}));

export const requisitionsRelations = relations(requisitions, ({ one }) => ({
  requestedByUser: one(users, { fields: [requisitions.requestedBy], references: [users.id] }),
  approvedByUser: one(users, { fields: [requisitions.approvedBy], references: [users.id] }),
  case: one(cases, { fields: [requisitions.caseId], references: [cases.id] }),
}));
