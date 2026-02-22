import { pgTable, uuid, text, boolean, timestamp, numeric, integer, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { auditAction } from "./enums";
import { users } from "./auth";

export const firmSettings = pgTable("firm_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  value: text("value"),
  description: text("description"),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const practiceAreas = pgTable("practice_areas", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const billingRates = pgTable("billing_rates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  ratePerHour: numeric("rate_per_hour", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("KES"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const emailTemplates = pgTable("email_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  variables: text("variables"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const smsTemplates = pgTable("sms_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  body: text("body").notNull(),
  variables: text("variables"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    action: auditAction("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    details: text("details"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("audit_log_created_at_idx").on(table.createdAt),
    index("audit_log_user_id_idx").on(table.userId),
    index("audit_log_entity_type_idx").on(table.entityType),
  ]
);

export const customFields = pgTable("custom_fields", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityType: text("entity_type").notNull(),
  fieldName: text("field_name").notNull(),
  fieldType: text("field_type").notNull(),
  fieldOptions: text("field_options"),
  isRequired: boolean("is_required").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  color: text("color"),
  entityType: text("entity_type"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const firmSettingsRelations = relations(firmSettings, ({ one }) => ({
  updatedByUser: one(users, { fields: [firmSettings.updatedBy], references: [users.id] }),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(users, { fields: [auditLog.userId], references: [users.id] }),
}));
