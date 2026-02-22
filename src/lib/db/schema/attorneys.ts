import { pgTable, pgEnum, uuid, text, boolean, timestamp, numeric, index, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { attorneyTitle, licenseStatus } from "./enums";
import { users } from "./auth";
import { practiceAreas } from "./settings";

export const attorneys = pgTable(
  "attorneys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" })
      .unique(),
    barNumber: text("bar_number").notNull().unique(),
    jurisdiction: text("jurisdiction").notNull(),
    title: attorneyTitle("title").notNull().default("associate"),
    department: text("department"),
    hourlyRate: numeric("hourly_rate", { precision: 10, scale: 2 }),
    dateAdmitted: timestamp("date_admitted", { withTimezone: true }),
    bio: text("bio"),
    lskNumber: text("lsk_number"),
    commissionerForOaths: boolean("commissioner_for_oaths").default(false),
    notaryPublic: boolean("notary_public").default(false),
    seniorCounsel: boolean("senior_counsel").default(false),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("attorneys_bar_number_idx").on(table.barNumber),
    index("attorneys_lsk_number_idx").on(table.lskNumber),
    index("attorneys_user_id_idx").on(table.userId),
  ]
);

export const attorneyPracticeAreas = pgTable(
  "attorney_practice_areas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    attorneyId: uuid("attorney_id")
      .notNull()
      .references(() => attorneys.id, { onDelete: "cascade" }),
    practiceAreaId: uuid("practice_area_id")
      .notNull()
      .references(() => practiceAreas.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("attorney_practice_areas_unique").on(table.attorneyId, table.practiceAreaId),
  ]
);

export const attorneyLicenses = pgTable("attorney_licenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  attorneyId: uuid("attorney_id")
    .notNull()
    .references(() => attorneys.id, { onDelete: "cascade" }),
  jurisdiction: text("jurisdiction").notNull(),
  licenseNumber: text("license_number").notNull(),
  status: licenseStatus("status").notNull().default("active"),
  issueDate: timestamp("issue_date", { withTimezone: true }),
  expiryDate: timestamp("expiry_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const practisingCertificates = pgTable("practising_certificates", {
  id: uuid("id").primaryKey().defaultRandom(),
  attorneyId: uuid("attorney_id")
    .notNull()
    .references(() => attorneys.id, { onDelete: "cascade" }),
  year: text("year").notNull(),
  certificateNumber: text("certificate_number"),
  issueDate: timestamp("issue_date", { withTimezone: true }),
  expiryDate: timestamp("expiry_date", { withTimezone: true }),
  status: licenseStatus("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cpdRecords = pgTable("cpd_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  attorneyId: uuid("attorney_id")
    .notNull()
    .references(() => attorneys.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  provider: text("provider"),
  units: numeric("units", { precision: 5, scale: 2 }).notNull(),
  completionDate: timestamp("completion_date", { withTimezone: true }).notNull(),
  certificateUrl: text("certificate_url"),
  isLskProgram: boolean("is_lsk_program").notNull().default(false),
  year: text("year").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const disciplinaryStatus = pgEnum("disciplinary_status", [
  "pending",
  "resolved",
  "dismissed",
]);

export const disciplinaryRecords = pgTable("disciplinary_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  attorneyId: uuid("attorney_id")
    .notNull()
    .references(() => attorneys.id, { onDelete: "cascade" }),
  date: timestamp("date", { withTimezone: true }).notNull(),
  caseReference: text("case_reference").notNull(),
  status: disciplinaryStatus("status").notNull().default("pending"),
  outcome: text("outcome"),
  notes: text("notes"),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const attorneysRelations = relations(attorneys, ({ one, many }) => ({
  user: one(users, { fields: [attorneys.userId], references: [users.id] }),
  practiceAreas: many(attorneyPracticeAreas),
  licenses: many(attorneyLicenses),
  practisingCertificates: many(practisingCertificates),
  cpdRecords: many(cpdRecords),
  disciplinaryRecords: many(disciplinaryRecords),
}));

export const attorneyPracticeAreasRelations = relations(attorneyPracticeAreas, ({ one }) => ({
  attorney: one(attorneys, {
    fields: [attorneyPracticeAreas.attorneyId],
    references: [attorneys.id],
  }),
}));

export const attorneyLicensesRelations = relations(attorneyLicenses, ({ one }) => ({
  attorney: one(attorneys, {
    fields: [attorneyLicenses.attorneyId],
    references: [attorneys.id],
  }),
}));

export const practisingCertificatesRelations = relations(practisingCertificates, ({ one }) => ({
  attorney: one(attorneys, {
    fields: [practisingCertificates.attorneyId],
    references: [attorneys.id],
  }),
}));

export const cpdRecordsRelations = relations(cpdRecords, ({ one }) => ({
  attorney: one(attorneys, { fields: [cpdRecords.attorneyId], references: [attorneys.id] }),
}));

export const disciplinaryRecordsRelations = relations(disciplinaryRecords, ({ one }) => ({
  attorney: one(attorneys, {
    fields: [disciplinaryRecords.attorneyId],
    references: [attorneys.id],
  }),
  createdByUser: one(users, {
    fields: [disciplinaryRecords.createdBy],
    references: [users.id],
  }),
}));
