import { pgTable, uuid, text, boolean, timestamp, numeric, integer, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./auth";

// ---------------------------------------------------------------------------
// Organizations (Tenants)
// ---------------------------------------------------------------------------
export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(), // subdomain identifier
    email: text("email"),
    phone: text("phone"),
    website: text("website"),
    address: text("address"),
    city: text("city"),
    county: text("county"),
    country: text("country").notNull().default("KE"),
    logoUrl: text("logo_url"),
    timezone: text("timezone").notNull().default("Africa/Nairobi"),
    locale: text("locale").notNull().default("en-KE"),
    currency: text("currency").notNull().default("KES"),
    status: text("status").notNull().default("active"), // active, suspended, cancelled
    planId: uuid("plan_id").references(() => plans.id, { onDelete: "set null" }),
    trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("organizations_slug_idx").on(table.slug),
    index("organizations_status_idx").on(table.status),
  ]
);

// ---------------------------------------------------------------------------
// Plans (Subscription Tiers)
// ---------------------------------------------------------------------------
export const plans = pgTable("plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // starter, professional, enterprise
  description: text("description"),
  maxUsers: integer("max_users"), // null = unlimited
  maxCases: integer("max_cases"), // null = unlimited
  maxStorageMb: integer("max_storage_mb"), // null = unlimited
  features: text("features"), // JSON string of feature flags
  monthlyPrice: numeric("monthly_price", { precision: 10, scale: 2 }),
  annualPrice: numeric("annual_price", { precision: 10, scale: 2 }),
  currency: text("currency").notNull().default("KES"),
  trialDays: integer("trial_days").notNull().default(14),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Organization Members (for future multi-org support)
// ---------------------------------------------------------------------------
export const organizationMembers = pgTable(
  "organization_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"), // owner, admin, member
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("org_members_org_user_idx").on(table.organizationId, table.userId),
  ]
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------
export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  plan: one(plans, {
    fields: [organizations.planId],
    references: [plans.id],
  }),
  members: many(organizationMembers),
}));

export const plansRelations = relations(plans, ({ many }) => ({
  organizations: many(organizations),
}));

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationMembers.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [organizationMembers.userId],
    references: [users.id],
  }),
}));
