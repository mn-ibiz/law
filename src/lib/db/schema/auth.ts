import { pgTable, uuid, text, boolean, timestamp, integer, index, uniqueIndex } from "drizzle-orm/pg-core";
import { userRole } from "./enums";
import { organizations } from "./organizations";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    password: text("password").notNull(),
    role: userRole("role").notNull().default("client"),
    phone: text("phone"),
    avatar: text("avatar"),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    branchId: uuid("branch_id"),
    isActive: boolean("is_active").notNull().default(true),
    emailVerified: timestamp("email_verified", { withTimezone: true }),
    resetToken: text("reset_token"),
    resetTokenExpiry: timestamp("reset_token_expiry", { withTimezone: true }),
    failedAttempts: integer("failed_attempts").notNull().default(0),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("users_email_org_idx").on(table.email, table.organizationId),
    index("users_role_idx").on(table.role),
    index("users_organization_id_idx").on(table.organizationId),
  ]
);

// usersRelations is defined in branches.ts to avoid circular imports
