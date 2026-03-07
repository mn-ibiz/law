import { pgTable, uuid, text, boolean, timestamp, index, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { eventType, taskStatus, deadlinePriority, bringUpStatus } from "./enums";
import { users } from "./auth";
import { cases } from "./cases";
import { organizations } from "./organizations";

export const calendarEvents = pgTable(
  "calendar_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    type: eventType("type").notNull().default("meeting"),
    caseId: uuid("case_id").references(() => cases.id, { onDelete: "set null" }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    location: text("location"),
    startTime: timestamp("start_time", { withTimezone: true }).notNull(),
    endTime: timestamp("end_time", { withTimezone: true }).notNull(),
    allDay: boolean("all_day").notNull().default(false),
    isCourtDate: boolean("is_court_date").notNull().default(false),
    recurrence: text("recurrence"),
    reminderMinutes: text("reminder_minutes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("calendar_events_start_time_idx").on(table.startTime),
    index("calendar_events_created_by_idx").on(table.createdBy),
    index("calendar_events_organization_id_idx").on(table.organizationId),
  ]
);

export const eventAttendees = pgTable(
  "event_attendees",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    eventId: uuid("event_id")
      .notNull()
      .references(() => calendarEvents.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    responseStatus: text("response_status").default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("event_attendees_event_user_unique").on(table.eventId, table.userId),
    index("event_attendees_organization_id_idx").on(table.organizationId),
  ]
);

export const deadlines = pgTable(
  "deadlines",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    caseId: uuid("case_id").references(() => cases.id, { onDelete: "cascade" }),
    assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
    priority: deadlinePriority("priority").notNull().default("medium"),
    dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    isStatutory: boolean("is_statutory").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("deadlines_due_date_idx").on(table.dueDate),
    index("deadlines_case_id_idx").on(table.caseId),
    index("deadlines_organization_id_idx").on(table.organizationId),
  ]
);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    caseId: uuid("case_id").references(() => cases.id, { onDelete: "set null" }),
    assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    status: taskStatus("status").notNull().default("pending"),
    priority: deadlinePriority("priority").notNull().default("medium"),
    dueDate: timestamp("due_date", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("tasks_assigned_to_idx").on(table.assignedTo),
    index("tasks_status_idx").on(table.status),
    index("tasks_organization_id_idx").on(table.organizationId),
  ]
);

export const bringUps = pgTable(
  "bring_ups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    caseId: uuid("case_id")
      .notNull()
      .references(() => cases.id, { onDelete: "cascade" }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
    date: timestamp("date", { withTimezone: true }).notNull(),
    reason: text("reason").notNull(),
    status: bringUpStatus("status").notNull().default("pending"),
    notes: text("notes"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("bring_ups_date_idx").on(table.date),
    index("bring_ups_status_idx").on(table.status),
    index("bring_ups_case_id_idx").on(table.caseId),
    index("bring_ups_organization_id_idx").on(table.organizationId),
  ]
);

export const calendarEventsRelations = relations(calendarEvents, ({ one, many }) => ({
  case: one(cases, { fields: [calendarEvents.caseId], references: [cases.id] }),
  createdByUser: one(users, { fields: [calendarEvents.createdBy], references: [users.id] }),
  attendees: many(eventAttendees),
}));

export const eventAttendeesRelations = relations(eventAttendees, ({ one }) => ({
  event: one(calendarEvents, { fields: [eventAttendees.eventId], references: [calendarEvents.id] }),
  user: one(users, { fields: [eventAttendees.userId], references: [users.id] }),
}));

export const deadlinesRelations = relations(deadlines, ({ one }) => ({
  case: one(cases, { fields: [deadlines.caseId], references: [cases.id] }),
  assignedToUser: one(users, { fields: [deadlines.assignedTo], references: [users.id] }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  case: one(cases, { fields: [tasks.caseId], references: [cases.id] }),
  assignedToUser: one(users, { fields: [tasks.assignedTo], references: [users.id] }),
  createdByUser: one(users, { fields: [tasks.createdBy], references: [users.id] }),
}));

export const bringUpsRelations = relations(bringUps, ({ one }) => ({
  case: one(cases, { fields: [bringUps.caseId], references: [cases.id] }),
  createdByUser: one(users, { fields: [bringUps.createdBy], references: [users.id] }),
  assignedToUser: one(users, { fields: [bringUps.assignedTo], references: [users.id] }),
}));
