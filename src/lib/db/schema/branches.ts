import { pgTable, uuid, text, boolean, timestamp, unique, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./auth";
import { organizations } from "./organizations";

export const branches = pgTable(
  "branches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    address: text("address"),
    city: text("city"),
    county: text("county"),
    phone: text("phone"),
    email: text("email"),
    isMain: boolean("is_main").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    settings: text("settings"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("branches_organization_id_idx").on(table.organizationId),
  ]
);

export const branchUsers = pgTable(
  "branch_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    branchId: uuid("branch_id")
      .notNull()
      .references(() => branches.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    isPrimary: boolean("is_primary").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("branch_users_branch_user_unique").on(table.branchId, table.userId),
    index("branch_users_organization_id_idx").on(table.organizationId),
  ]
);

export const usersRelations = relations(users, ({ one }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  branch: one(branches, {
    fields: [users.branchId],
    references: [branches.id],
  }),
}));

export const branchesRelations = relations(branches, ({ one, many }) => ({
  organization: one(organizations, { fields: [branches.organizationId], references: [organizations.id] }),
  users: many(branchUsers),
}));

export const branchUsersRelations = relations(branchUsers, ({ one }) => ({
  organization: one(organizations, { fields: [branchUsers.organizationId], references: [organizations.id] }),
  branch: one(branches, { fields: [branchUsers.branchId], references: [branches.id] }),
  user: one(users, { fields: [branchUsers.userId], references: [users.id] }),
}));
