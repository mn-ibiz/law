import { pgTable, uuid, text, boolean, timestamp, numeric, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { supplierInvoiceStatus } from "./enums";
import { users } from "./auth";
import { organizations } from "./organizations";

export const suppliers = pgTable(
  "suppliers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    contactPerson: text("contact_person"),
    email: text("email"),
    phone: text("phone"),
    address: text("address"),
    kraPin: text("kra_pin"),
    bankName: text("bank_name"),
    bankAccountNumber: text("bank_account_number"),
    bankBranch: text("bank_branch"),
    category: text("category"),
    logoUrl: text("logo_url"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("suppliers_organization_id_idx").on(table.organizationId),
  ]
);

export const supplierInvoices = pgTable(
  "supplier_invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    supplierId: uuid("supplier_id")
      .notNull()
      .references(() => suppliers.id, { onDelete: "restrict" }),
    invoiceNumber: text("invoice_number").notNull(),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    vatAmount: numeric("vat_amount", { precision: 14, scale: 2 }).default("0"),
    totalAmount: numeric("total_amount", { precision: 14, scale: 2 }).notNull(),
    description: text("description"),
    invoiceDate: timestamp("invoice_date", { withTimezone: true }).notNull(),
    dueDate: timestamp("due_date", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    status: supplierInvoiceStatus("status").notNull().default("pending"),
    fileUrl: text("file_url"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("supplier_invoices_organization_id_idx").on(table.organizationId),
  ]
);

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  invoices: many(supplierInvoices),
}));

export const supplierInvoicesRelations = relations(supplierInvoices, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierInvoices.supplierId],
    references: [suppliers.id],
  }),
  createdByUser: one(users, {
    fields: [supplierInvoices.createdBy],
    references: [users.id],
  }),
}));
