import { pgTable, uuid, text, boolean, timestamp, integer, index } from "drizzle-orm/pg-core";
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
    failedAttempts: integer("failed_attempts").notNull().default(0),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    // email already has a unique constraint which creates an implicit index
    index("users_role_idx").on(table.role),
  ]
);

// usersRelations is defined in branches.ts to avoid circular imports
