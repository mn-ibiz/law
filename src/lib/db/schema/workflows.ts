import { pgTable, uuid, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { workflowTriggerType, workflowActionType } from "./enums";
import { users } from "./auth";

export const workflowTemplates = pgTable("workflow_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  triggerType: workflowTriggerType("trigger_type").notNull(),
  triggerConfig: text("trigger_config"),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const workflowRules = pgTable("workflow_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  templateId: uuid("template_id")
    .notNull()
    .references(() => workflowTemplates.id, { onDelete: "cascade" }),
  actionType: workflowActionType("action_type").notNull(),
  actionConfig: text("action_config"),
  conditionConfig: text("condition_config"),
  order: integer("order").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const workflowExecutionLog = pgTable("workflow_execution_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  templateId: uuid("template_id")
    .notNull()
    .references(() => workflowTemplates.id, { onDelete: "cascade" }),
  ruleId: uuid("rule_id").references(() => workflowRules.id, { onDelete: "set null" }),
  triggeredBy: text("triggered_by"),
  status: text("status").notNull().default("success"),
  details: text("details"),
  executedAt: timestamp("executed_at", { withTimezone: true }).defaultNow().notNull(),
});

export const workflowTemplatesRelations = relations(workflowTemplates, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [workflowTemplates.createdBy],
    references: [users.id],
  }),
  rules: many(workflowRules),
  executionLog: many(workflowExecutionLog),
}));

export const workflowRulesRelations = relations(workflowRules, ({ one }) => ({
  template: one(workflowTemplates, {
    fields: [workflowRules.templateId],
    references: [workflowTemplates.id],
  }),
}));

export const workflowExecutionLogRelations = relations(workflowExecutionLog, ({ one }) => ({
  template: one(workflowTemplates, {
    fields: [workflowExecutionLog.templateId],
    references: [workflowTemplates.id],
  }),
  rule: one(workflowRules, {
    fields: [workflowExecutionLog.ruleId],
    references: [workflowRules.id],
  }),
}));
