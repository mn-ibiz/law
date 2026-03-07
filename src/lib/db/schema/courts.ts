import { pgTable, uuid, text, boolean, timestamp, integer, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { filingStatus, serviceMethod } from "./enums";
import { users } from "./auth";
import { cases } from "./cases";
import { organizations } from "./organizations";

export const courts = pgTable("courts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  level: text("level").notNull(),
  jurisdiction: text("jurisdiction"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const courtStations = pgTable("court_stations", {
  id: uuid("id").primaryKey().defaultRandom(),
  courtId: uuid("court_id")
    .notNull()
    .references(() => courts.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  location: text("location"),
  county: text("county"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const courtFilings = pgTable(
  "court_filings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    caseId: uuid("case_id")
      .notNull()
      .references(() => cases.id, { onDelete: "cascade" }),
    courtId: uuid("court_id").references(() => courts.id, { onDelete: "set null" }),
    courtStationId: uuid("court_station_id").references(() => courtStations.id, {
      onDelete: "set null",
    }),
    filedBy: uuid("filed_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    filingType: text("filing_type").notNull(),
    filingNumber: text("filing_number"),
    status: filingStatus("status").notNull().default("pending"),
    filingDate: timestamp("filing_date", { withTimezone: true }),
    documentUrl: text("document_url"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("court_filings_case_id_idx").on(table.caseId),
    index("court_filings_organization_id_idx").on(table.organizationId),
  ]
);

export const serviceOfDocuments = pgTable(
  "service_of_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    caseId: uuid("case_id")
      .notNull()
      .references(() => cases.id, { onDelete: "cascade" }),
    documentTitle: text("document_title").notNull(),
    servedTo: text("served_to").notNull(),
    method: serviceMethod("method").notNull(),
    servedBy: uuid("served_by").references(() => users.id, { onDelete: "set null" }),
    serviceDate: timestamp("service_date", { withTimezone: true }),
    proofOfServiceUrl: text("proof_of_service_url"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("service_of_documents_organization_id_idx").on(table.organizationId),
  ]
);

export const causeLists = pgTable(
  "cause_lists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    courtId: uuid("court_id").references(() => courts.id, { onDelete: "set null" }),
    date: timestamp("date", { withTimezone: true }).notNull(),
    judge: text("judge"),
    courtRoom: text("court_room"),
    notes: text("notes"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("cause_lists_date_idx").on(table.date),
    index("cause_lists_organization_id_idx").on(table.organizationId),
  ]
);

export const causeListEntries = pgTable(
  "cause_list_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    causeListId: uuid("cause_list_id")
      .notNull()
      .references(() => causeLists.id, { onDelete: "cascade" }),
    caseId: uuid("case_id").references(() => cases.id, { onDelete: "set null" }),
    caseNumber: text("case_number"),
    parties: text("parties"),
    matter: text("matter"),
    time: text("time"),
    order: integer("order").notNull().default(0),
    outcome: text("outcome"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("cause_list_entries_organization_id_idx").on(table.organizationId),
  ]
);

export const courtRules = pgTable(
  "court_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    courtId: uuid("court_id").references(() => courts.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    triggerEvent: text("trigger_event").notNull().default("hearing_date"),
    offsetDays: integer("offset_days").notNull(),
    deadlineTitle: text("deadline_title").notNull(),
    priority: text("priority").notNull().default("high"),
    isStatutory: boolean("is_statutory").notNull().default(true),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("court_rules_organization_id_idx").on(table.organizationId),
  ]
);

export type CourtRule = InferSelectModel<typeof courtRules>;

export const courtsRelations = relations(courts, ({ many }) => ({
  stations: many(courtStations),
  filings: many(courtFilings),
  causeLists: many(causeLists),
  courtRules: many(courtRules),
}));

export const courtStationsRelations = relations(courtStations, ({ one }) => ({
  court: one(courts, { fields: [courtStations.courtId], references: [courts.id] }),
}));

export const courtFilingsRelations = relations(courtFilings, ({ one }) => ({
  case: one(cases, { fields: [courtFilings.caseId], references: [cases.id] }),
  court: one(courts, { fields: [courtFilings.courtId], references: [courts.id] }),
  courtStation: one(courtStations, {
    fields: [courtFilings.courtStationId],
    references: [courtStations.id],
  }),
  filedByUser: one(users, { fields: [courtFilings.filedBy], references: [users.id] }),
}));

export const serviceOfDocumentsRelations = relations(serviceOfDocuments, ({ one }) => ({
  case: one(cases, { fields: [serviceOfDocuments.caseId], references: [cases.id] }),
  servedByUser: one(users, { fields: [serviceOfDocuments.servedBy], references: [users.id] }),
}));

export const causeListsRelations = relations(causeLists, ({ one, many }) => ({
  court: one(courts, { fields: [causeLists.courtId], references: [courts.id] }),
  createdByUser: one(users, { fields: [causeLists.createdBy], references: [users.id] }),
  entries: many(causeListEntries),
}));

export const causeListEntriesRelations = relations(causeListEntries, ({ one }) => ({
  causeList: one(causeLists, { fields: [causeListEntries.causeListId], references: [causeLists.id] }),
  case: one(cases, { fields: [causeListEntries.caseId], references: [cases.id] }),
}));

export const courtRulesRelations = relations(courtRules, ({ one }) => ({
  court: one(courts, { fields: [courtRules.courtId], references: [courts.id] }),
}));
