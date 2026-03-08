import { db } from "@/lib/db";
import {
  organizations,
  plans,
  subscriptions,
  platformAuditLog,
} from "@/lib/db/schema/organizations";
import { users } from "@/lib/db/schema/auth";
import { cases } from "@/lib/db/schema/cases";
import { auditLog } from "@/lib/db/schema/settings";
import { eq, sql, and, or, ilike, desc, count, sum, ne, isNull } from "drizzle-orm";

const PLATFORM_SLUG = "_platform";

/** Standard condition to exclude platform org and soft-deleted orgs from all queries. */
function activeOrgConditions() {
  return [
    ne(organizations.slug, PLATFORM_SLUG),
    isNull(organizations.deletedAt),
  ];
}

// ---------------------------------------------------------------------------
// Dashboard metrics
// ---------------------------------------------------------------------------
export async function getPlatformMetrics() {
  const [[orgCount], [userCount], [activeSubCount], mrrResult, recentOrgs] =
    await Promise.all([
      db
        .select({ value: count() })
        .from(organizations)
        .where(and(...activeOrgConditions())),
      db
        .select({ value: count() })
        .from(users)
        .innerJoin(organizations, eq(users.organizationId, organizations.id))
        .where(and(...activeOrgConditions())),
      db
        .select({ value: count() })
        .from(subscriptions)
        .where(eq(subscriptions.status, "active")),
      db
        .select({
          total: sum(plans.monthlyPrice),
        })
        .from(subscriptions)
        .innerJoin(plans, eq(subscriptions.planId, plans.id))
        .where(eq(subscriptions.status, "active")),
      db
        .select({
          id: organizations.id,
          name: organizations.name,
          slug: organizations.slug,
          status: organizations.status,
          createdAt: organizations.createdAt,
        })
        .from(organizations)
        .where(and(...activeOrgConditions()))
        .orderBy(desc(organizations.createdAt))
        .limit(5),
    ]);

  return {
    totalOrgs: orgCount?.value ?? 0,
    totalUsers: userCount?.value ?? 0,
    activeSubscriptions: activeSubCount?.value ?? 0,
    mrr: parseFloat(mrrResult[0]?.total ?? "0"),
    recentOrgs,
  };
}

// ---------------------------------------------------------------------------
// Organization list
// ---------------------------------------------------------------------------
export interface OrgListParams {
  search?: string;
  status?: string;
  planId?: string;
  sortBy?: "created" | "name" | "users";
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export async function getOrganizationList(params: OrgListParams) {
  const {
    search,
    status,
    planId,
    sortBy = "created",
    sortDir = "desc",
    page = 1,
    pageSize = 20,
  } = params;

  const conditions = [...activeOrgConditions()];

  if (search) {
    // Escape LIKE metacharacters to prevent wildcard abuse
    const escaped = search.replace(/[%_\\]/g, "\\$&");
    conditions.push(
      or(
        ilike(organizations.name, `%${escaped}%`),
        ilike(organizations.slug, `%${escaped}%`)
      )!
    );
  }
  if (status) {
    conditions.push(eq(organizations.status, status));
  }
  if (planId) {
    conditions.push(eq(organizations.planId, planId));
  }

  const where = conditions.length > 1 ? and(...conditions) : conditions[0];

  const orderCol =
    sortBy === "name"
      ? organizations.name
      : organizations.createdAt;
  const orderFn = sortDir === "asc" ? sql`${orderCol} ASC` : sql`${orderCol} DESC`;

  const [orgs, [totalRow]] = await Promise.all([
    db
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
        email: organizations.email,
        status: organizations.status,
        country: organizations.country,
        storageUsedBytes: organizations.storageUsedBytes,
        planId: organizations.planId,
        createdAt: organizations.createdAt,
      })
      .from(organizations)
      .where(where)
      .orderBy(orderFn)
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ value: count() })
      .from(organizations)
      .where(where),
  ]);

  // Enrich with user counts and plan names
  const orgIds = orgs.map((o) => o.id);
  if (orgIds.length === 0) {
    return { orgs: [], total: 0, page, pageSize };
  }

  const [userCounts, plansList] = await Promise.all([
    db
      .select({
        organizationId: users.organizationId,
        count: count(),
      })
      .from(users)
      .where(sql`${users.organizationId} IN (${sql.join(orgIds.map((id) => sql`${id}`), sql`, `)})`)
      .groupBy(users.organizationId),
    db.select({ id: plans.id, name: plans.name }).from(plans),
  ]);

  const userCountMap: Record<string, number> = {};
  for (const uc of userCounts) {
    userCountMap[uc.organizationId] = uc.count;
  }
  const planMap: Record<string, string> = {};
  for (const p of plansList) {
    planMap[p.id] = p.name;
  }

  const enriched = orgs.map((o) => ({
    ...o,
    userCount: userCountMap[o.id] ?? 0,
    planName: o.planId ? planMap[o.planId] ?? "Unknown" : "No plan",
  }));

  return {
    orgs: enriched,
    total: totalRow?.value ?? 0,
    page,
    pageSize,
  };
}

// ---------------------------------------------------------------------------
// Organization detail
// ---------------------------------------------------------------------------
export async function getOrganizationDetail(orgId: string) {
  const [[org], [sub], [userCountRow], [caseCountRow], recentAudit] =
    await Promise.all([
      db
        .select()
        .from(organizations)
        .where(eq(organizations.id, orgId))
        .limit(1),
      db
        .select({
          id: subscriptions.id,
          status: subscriptions.status,
          currentPeriodStart: subscriptions.currentPeriodStart,
          currentPeriodEnd: subscriptions.currentPeriodEnd,
          cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
          trialEnd: subscriptions.trialEnd,
          gracePeriodEnd: subscriptions.gracePeriodEnd,
          planId: subscriptions.planId,
        })
        .from(subscriptions)
        .where(eq(subscriptions.organizationId, orgId))
        .limit(1),
      db
        .select({ value: count() })
        .from(users)
        .where(eq(users.organizationId, orgId)),
      db
        .select({ value: count() })
        .from(cases)
        .where(eq(cases.organizationId, orgId)),
      db
        .select({
          id: auditLog.id,
          action: auditLog.action,
          entityType: auditLog.entityType,
          details: auditLog.details,
          createdAt: auditLog.createdAt,
        })
        .from(auditLog)
        .where(eq(auditLog.organizationId, orgId))
        .orderBy(desc(auditLog.createdAt))
        .limit(50),
    ]);

  if (!org) return null;

  // Get plan details if subscription exists
  let plan = null;
  if (sub?.planId) {
    [plan] = await db
      .select()
      .from(plans)
      .where(eq(plans.id, sub.planId))
      .limit(1);
  }

  return {
    org,
    subscription: sub ?? null,
    plan,
    userCount: userCountRow?.value ?? 0,
    caseCount: caseCountRow?.value ?? 0,
    recentAudit,
  };
}

// ---------------------------------------------------------------------------
// Revenue analytics
// ---------------------------------------------------------------------------
export async function getRevenueMetrics() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    mrrResult,
    planDistribution,
    [newOrgsThisMonth],
    [newOrgsLastMonth],
    [churnThisMonth],
  ] = await Promise.all([
    // MRR
    db
      .select({ total: sum(plans.monthlyPrice) })
      .from(subscriptions)
      .innerJoin(plans, eq(subscriptions.planId, plans.id))
      .where(eq(subscriptions.status, "active")),
    // Plan distribution
    db
      .select({
        planName: plans.name,
        planSlug: plans.slug,
        count: count(),
        monthlyPrice: plans.monthlyPrice,
      })
      .from(subscriptions)
      .innerJoin(plans, eq(subscriptions.planId, plans.id))
      .where(
        or(
          eq(subscriptions.status, "active"),
          eq(subscriptions.status, "trialing")
        )
      )
      .groupBy(plans.name, plans.slug, plans.monthlyPrice),
    // New orgs this month
    db
      .select({ value: count() })
      .from(organizations)
      .where(
        and(
          ...activeOrgConditions(),
          sql`${organizations.createdAt} >= ${startOfMonth}`
        )
      ),
    // New orgs last month
    db
      .select({ value: count() })
      .from(organizations)
      .where(
        and(
          ...activeOrgConditions(),
          sql`${organizations.createdAt} >= ${startOfLastMonth}`,
          sql`${organizations.createdAt} < ${startOfMonth}`
        )
      ),
    // Churn this month
    db
      .select({ value: count() })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.status, "cancelled"),
          sql`${subscriptions.updatedAt} >= ${startOfMonth}`
        )
      ),
  ]);

  return {
    mrr: parseFloat(mrrResult[0]?.total ?? "0"),
    planDistribution,
    newOrgsThisMonth: newOrgsThisMonth?.value ?? 0,
    newOrgsLastMonth: newOrgsLastMonth?.value ?? 0,
    churnThisMonth: churnThisMonth?.value ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Plans list (with subscriber counts)
// ---------------------------------------------------------------------------
export async function getPlansWithCounts() {
  const allPlans = await db.select().from(plans).orderBy(plans.createdAt);

  const subCounts = await db
    .select({
      planId: subscriptions.planId,
      count: count(),
    })
    .from(subscriptions)
    .where(
      or(
        eq(subscriptions.status, "active"),
        eq(subscriptions.status, "trialing")
      )
    )
    .groupBy(subscriptions.planId);

  const countMap: Record<string, number> = {};
  for (const sc of subCounts) {
    countMap[sc.planId] = sc.count;
  }

  return allPlans.map((p) => ({
    ...p,
    subscriberCount: countMap[p.id] ?? 0,
  }));
}

// ---------------------------------------------------------------------------
// System health
// ---------------------------------------------------------------------------
export async function getSystemHealth() {
  const [
    [orgCount],
    [userCount],
    [totalStorage],
    subBreakdown,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(organizations)
      .where(and(...activeOrgConditions())),
    db.select({ value: count() }).from(users),
    db
      .select({ value: sum(organizations.storageUsedBytes) })
      .from(organizations)
      .where(and(...activeOrgConditions())),
    db
      .select({
        status: subscriptions.status,
        count: count(),
      })
      .from(subscriptions)
      .groupBy(subscriptions.status),
  ]);

  return {
    totalOrgs: orgCount?.value ?? 0,
    totalUsers: userCount?.value ?? 0,
    totalStorageBytes: parseInt(totalStorage?.value ?? "0", 10) || 0,
    subscriptionBreakdown: subBreakdown,
    nodeVersion: process.version,
  };
}

// ---------------------------------------------------------------------------
// Platform audit log
// ---------------------------------------------------------------------------
export interface PlatformAuditParams {
  action?: string;
  page?: number;
  pageSize?: number;
}

export async function getPlatformAuditLog(params: PlatformAuditParams) {
  const { action, page = 1, pageSize = 50 } = params;

  const conditions = [];
  if (action) {
    conditions.push(eq(platformAuditLog.action, action));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [entries, [totalRow]] = await Promise.all([
    db
      .select({
        id: platformAuditLog.id,
        action: platformAuditLog.action,
        details: platformAuditLog.details,
        ipAddress: platformAuditLog.ipAddress,
        createdAt: platformAuditLog.createdAt,
        userId: platformAuditLog.userId,
        targetOrgId: platformAuditLog.targetOrgId,
        targetUserId: platformAuditLog.targetUserId,
      })
      .from(platformAuditLog)
      .where(where)
      .orderBy(desc(platformAuditLog.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ value: count() })
      .from(platformAuditLog)
      .where(where),
  ]);

  // Enrich with user/org names
  const userIds = [...new Set(entries.map((e) => e.userId).filter(Boolean))] as string[];
  const orgIds = [...new Set(entries.map((e) => e.targetOrgId).filter(Boolean))] as string[];

  const [userNames, orgNames] = await Promise.all([
    userIds.length > 0
      ? db
          .select({ id: users.id, name: users.name, email: users.email })
          .from(users)
          .where(sql`${users.id} IN (${sql.join(userIds.map((id) => sql`${id}`), sql`, `)})`)
      : Promise.resolve([]),
    orgIds.length > 0
      ? db
          .select({ id: organizations.id, name: organizations.name, slug: organizations.slug })
          .from(organizations)
          .where(sql`${organizations.id} IN (${sql.join(orgIds.map((id) => sql`${id}`), sql`, `)})`)
      : Promise.resolve([]),
  ]);

  const userMap: Record<string, { name: string; email: string }> = {};
  for (const u of userNames) userMap[u.id] = { name: u.name, email: u.email };
  const orgMap: Record<string, { name: string; slug: string }> = {};
  for (const o of orgNames) orgMap[o.id] = { name: o.name, slug: o.slug };

  const enriched = entries.map((e) => ({
    ...e,
    userName: e.userId ? userMap[e.userId]?.name ?? "Unknown" : "System",
    userEmail: e.userId ? userMap[e.userId]?.email ?? "" : "",
    targetOrgName: e.targetOrgId ? orgMap[e.targetOrgId]?.name ?? "Unknown" : null,
    targetOrgSlug: e.targetOrgId ? orgMap[e.targetOrgId]?.slug ?? "" : null,
  }));

  return {
    entries: enriched,
    total: totalRow?.value ?? 0,
    page,
    pageSize,
  };
}
