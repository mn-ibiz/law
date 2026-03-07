import { pgTable, uuid, text, timestamp, index, boolean, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { clientType, clientStatus, kycStatus, riskLevel, contactType, conflictSeverity, leadSource } from "./enums";
import { users } from "./auth";
import { organizations } from "./organizations";

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    type: clientType("type").notNull().default("individual"),
    status: clientStatus("status").notNull().default("active"),
    // Individual fields
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    dateOfBirth: timestamp("date_of_birth", { withTimezone: true }),
    // Organization fields
    companyName: text("company_name"),
    industry: text("industry"),
    taxId: text("tax_id"),
    // Kenya-specific
    nationalId: text("national_id"),
    passportNumber: text("passport_number"),
    kraPin: text("kra_pin"),
    county: text("county"),
    poBox: text("po_box"),
    physicalAddress: text("physical_address"),
    nextOfKin: text("next_of_kin"),
    employer: text("employer"),
    photoUrl: text("photo_url"),
    // General
    address: text("address"),
    city: text("city"),
    state: text("state"),
    zipCode: text("zip_code"),
    referralSource: text("referral_source"),
    notes: text("notes"),
    isPep: boolean("is_pep").notNull().default(false),
    pepDetails: text("pep_details"),
    leadSource: leadSource("lead_source"),
    leadScore: integer("lead_score").notNull().default(0),
    followUpDate: timestamp("follow_up_date", { withTimezone: true }),
    lostReason: text("lost_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("clients_email_idx").on(table.email),
    index("clients_kra_pin_idx").on(table.kraPin),
    index("clients_status_idx").on(table.status),
    index("clients_user_id_idx").on(table.userId),
    index("clients_organization_id_idx").on(table.organizationId),
  ]
);

export const clientContacts = pgTable(
  "client_contacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    contactedBy: uuid("contacted_by").references(() => users.id, { onDelete: "set null" }),
    type: contactType("type").notNull(),
    subject: text("subject").notNull(),
    notes: text("notes"),
    contactDate: timestamp("contact_date", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("client_contacts_organization_id_idx").on(table.organizationId),
  ]
);

export const conflictChecks = pgTable(
  "conflict_checks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    clientId: uuid("client_id").references(() => clients.id, { onDelete: "set null" }),
    searchQuery: text("search_query").notNull(),
    result: conflictSeverity("result").notNull().default("clear"),
    matchDetails: text("match_details"),
    resolutionNotes: text("resolution_notes"),
    checkedBy: uuid("checked_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("conflict_checks_organization_id_idx").on(table.organizationId),
  ]
);

export const kycDocuments = pgTable(
  "kyc_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    documentType: text("document_type").notNull(),
    documentNumber: text("document_number"),
    fileUrl: text("file_url"),
    status: kycStatus("status").notNull().default("pending"),
    verifiedBy: uuid("verified_by").references(() => users.id, { onDelete: "set null" }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    expiryDate: timestamp("expiry_date", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("kyc_documents_organization_id_idx").on(table.organizationId),
  ]
);

export const clientRiskAssessments = pgTable(
  "client_risk_assessments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    riskLevel: riskLevel("risk_level").notNull().default("low"),
    factors: text("factors"),
    notes: text("notes"),
    assessedBy: uuid("assessed_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("client_risk_assessments_organization_id_idx").on(table.organizationId),
  ]
);

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, { fields: [clients.userId], references: [users.id] }),
  contacts: many(clientContacts),
  conflictChecks: many(conflictChecks),
  kycDocuments: many(kycDocuments),
  riskAssessments: many(clientRiskAssessments),
}));

export const clientContactsRelations = relations(clientContacts, ({ one }) => ({
  client: one(clients, { fields: [clientContacts.clientId], references: [clients.id] }),
  contactedByUser: one(users, { fields: [clientContacts.contactedBy], references: [users.id] }),
}));

export const conflictChecksRelations = relations(conflictChecks, ({ one }) => ({
  client: one(clients, { fields: [conflictChecks.clientId], references: [clients.id] }),
  checkedByUser: one(users, { fields: [conflictChecks.checkedBy], references: [users.id] }),
}));

export const kycDocumentsRelations = relations(kycDocuments, ({ one }) => ({
  client: one(clients, { fields: [kycDocuments.clientId], references: [clients.id] }),
  verifiedByUser: one(users, { fields: [kycDocuments.verifiedBy], references: [users.id] }),
}));

export const clientRiskAssessmentsRelations = relations(clientRiskAssessments, ({ one }) => ({
  client: one(clients, {
    fields: [clientRiskAssessments.clientId],
    references: [clients.id],
  }),
  assessedByUser: one(users, {
    fields: [clientRiskAssessments.assessedBy],
    references: [users.id],
  }),
}));
