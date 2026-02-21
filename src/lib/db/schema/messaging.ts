import { pgTable, uuid, text, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { messageStatus, notificationType } from "./enums";
import { users } from "./auth";
import { cases } from "./cases";

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  recipientId: uuid("recipient_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  caseId: uuid("case_id").references(() => cases.id, { onDelete: "set null" }),
  parentMessageId: uuid("parent_message_id"),
  subject: text("subject"),
  body: text("body").notNull(),
  status: messageStatus("status").notNull().default("sent"),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationType("type").notNull().default("info"),
    title: text("title").notNull(),
    message: text("message").notNull(),
    linkUrl: text("link_url"),
    isRead: boolean("is_read").notNull().default(false),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("notifications_user_id_idx").on(table.userId),
    index("notifications_is_read_idx").on(table.isRead),
  ]
);

export const smsLog = pgTable("sms_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  recipientPhone: text("recipient_phone").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("pending"),
  provider: text("provider"),
  providerMessageId: text("provider_message_id"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  caseId: uuid("case_id").references(() => cases.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
  recipient: one(users, { fields: [messages.recipientId], references: [users.id] }),
  case: one(cases, { fields: [messages.caseId], references: [cases.id] }),
  parentMessage: one(messages, {
    fields: [messages.parentMessageId],
    references: [messages.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const smsLogRelations = relations(smsLog, ({ one }) => ({
  user: one(users, { fields: [smsLog.userId], references: [users.id] }),
  case: one(cases, { fields: [smsLog.caseId], references: [cases.id] }),
}));
