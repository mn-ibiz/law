import { pgTable, uuid, text, boolean, timestamp, integer, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { filingStatus, serviceMethod } from "./enums";
import { users } from "./auth";
import { cases } from "./cases";

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
    caseId: uuid("case_id")
      .notNull()
      .references(() => cases.id, { onDelete: "cascade" }),
    courtId: uuid("court_id").references(() => courts.id, { onDelete: "set null" }),
    courtStationId: uuid("court_station_id").references(() => courtStations.id, {
      onDelete: "set null",
    }),
    filedBy: uuid("filed_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    filingType: text("filing_type").notNull(),
    filingNumber: text("filing_number"),
    status: filingStatus("status").notNull().default("pending"),
    filingDate: timestamp("filing_date", { withTimezone: true }),
    documentUrl: text("document_url"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("court_filings_case_id_idx").on(table.caseId)]
);

export const serviceOfDocuments = pgTable("service_of_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
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
});

export const courtsRelations = relations(courts, ({ many }) => ({
  stations: many(courtStations),
  filings: many(courtFilings),
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
