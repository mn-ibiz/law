import { pgTable, uuid, text, boolean, timestamp, numeric, integer, bigint, index, uniqueIndex, unique } from "drizzle-orm/pg-core";
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
    storageUsedBytes: bigint("storage_used_bytes", { mode: "number" }).notNull().default(0),
    stripeCustomerId: text("stripe_customer_id"),
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
// Subscriptions
// ---------------------------------------------------------------------------
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "restrict" }),
    status: text("status").notNull().default("trialing"), // trialing, active, past_due, cancelled, suspended
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    stripePriceId: text("stripe_price_id"),
    currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    trialEnd: timestamp("trial_end", { withTimezone: true }),
    gracePeriodEnd: timestamp("grace_period_end", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("subscriptions_organization_id_idx").on(table.organizationId),
    index("subscriptions_stripe_customer_id_idx").on(table.stripeCustomerId),
    index("subscriptions_stripe_subscription_id_idx").on(table.stripeSubscriptionId),
  ]
);

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
// Platform Audit Log (super-admin actions, cross-org events)
// ---------------------------------------------------------------------------
export const platformAuditLog = pgTable(
  "platform_audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(), // impersonate_start, impersonate_end, suspend_org, reactivate_org, update_plan, create_plan, update_org
    targetOrgId: uuid("target_org_id").references(() => organizations.id, { onDelete: "set null" }),
    targetUserId: uuid("target_user_id").references(() => users.id, { onDelete: "set null" }),
    details: text("details"), // JSON
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("platform_audit_log_created_at_idx").on(table.createdAt),
    index("platform_audit_log_action_idx").on(table.action),
    index("platform_audit_log_user_id_idx").on(table.userId),
  ]
);

// ---------------------------------------------------------------------------
// API Keys (for programmatic access, Enterprise plan only)
// ---------------------------------------------------------------------------
export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    keyHash: text("key_hash").notNull(), // SHA-256 hash of the full key
    keyPrefix: text("key_prefix").notNull(), // First 8 hex chars after "lfr_" for identification
    permissions: text("permissions"), // JSON string of allowed scopes
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("api_keys_organization_id_idx").on(table.organizationId),
    uniqueIndex("api_keys_org_prefix_idx").on(table.organizationId, table.keyPrefix),
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
  subscription: one(subscriptions),
  members: many(organizationMembers),
}));

export const plansRelations = relations(plans, ({ many }) => ({
  organizations: many(organizations),
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  organization: one(organizations, {
    fields: [subscriptions.organizationId],
    references: [organizations.id],
  }),
  plan: one(plans, {
    fields: [subscriptions.planId],
    references: [plans.id],
  }),
}));

export const platformAuditLogRelations = relations(platformAuditLog, ({ one }) => ({
  user: one(users, { fields: [platformAuditLog.userId], references: [users.id] }),
  targetOrg: one(organizations, { fields: [platformAuditLog.targetOrgId], references: [organizations.id] }),
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

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  organization: one(organizations, {
    fields: [apiKeys.organizationId],
    references: [organizations.id],
  }),
  createdByUser: one(users, {
    fields: [apiKeys.createdBy],
    references: [users.id],
  }),
}));
