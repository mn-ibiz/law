import { pgTable, uuid, text, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { userRole } from "./enums";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    role: userRole("role").notNull().default("client"),
    phone: text("phone"),
    avatar: text("avatar"),
    branchId: uuid("branch_id"),
    isActive: boolean("is_active").notNull().default(true),
    emailVerified: timestamp("email_verified", { withTimezone: true }),
    resetToken: text("reset_token"),
    resetTokenExpiry: timestamp("reset_token_expiry", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("users_email_idx").on(table.email),
    index("users_role_idx").on(table.role),
  ]
);

export const usersRelations = relations(users, ({ one, many }) => ({
  branch: one(users, {
    fields: [users.branchId],
    references: [users.id],
  }),
}));
