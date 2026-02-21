import { pgTable, uuid, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { documentCategory, documentStatus } from "./enums";
import { users } from "./auth";
import { cases } from "./cases";
import { clients } from "./clients";

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    caseId: uuid("case_id").references(() => cases.id, { onDelete: "set null" }),
    clientId: uuid("client_id").references(() => clients.id, { onDelete: "set null" }),
    uploadedBy: uuid("uploaded_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    category: documentCategory("category").notNull().default("other"),
    status: documentStatus("status").notNull().default("draft"),
    fileUrl: text("file_url").notNull(),
    fileName: text("file_name").notNull(),
    fileSize: integer("file_size"),
    mimeType: text("mime_type"),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("documents_case_id_idx").on(table.caseId),
    index("documents_client_id_idx").on(table.clientId),
    index("documents_status_idx").on(table.status),
  ]
);

export const documentVersions = pgTable("document_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull(),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"),
  uploadedBy: uuid("uploaded_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  changeNotes: text("change_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const documentTemplates = pgTable("document_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  category: documentCategory("category").notNull().default("template"),
  content: text("content"),
  fileUrl: text("file_url"),
  placeholders: text("placeholders"),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const documentsRelations = relations(documents, ({ one, many }) => ({
  case: one(cases, { fields: [documents.caseId], references: [cases.id] }),
  client: one(clients, { fields: [documents.clientId], references: [clients.id] }),
  uploader: one(users, { fields: [documents.uploadedBy], references: [users.id] }),
  versions: many(documentVersions),
}));

export const documentVersionsRelations = relations(documentVersions, ({ one }) => ({
  document: one(documents, {
    fields: [documentVersions.documentId],
    references: [documents.id],
  }),
  uploader: one(users, { fields: [documentVersions.uploadedBy], references: [users.id] }),
}));

export const documentTemplatesRelations = relations(documentTemplates, ({ one }) => ({
  creator: one(users, { fields: [documentTemplates.createdBy], references: [users.id] }),
}));
