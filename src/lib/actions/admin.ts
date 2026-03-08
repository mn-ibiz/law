"use server";

import { db } from "@/lib/db";
import { organizations, plans, platformAuditLog } from "@/lib/db/schema/organizations";
import { users } from "@/lib/db/schema/auth";
import { eq, and } from "drizzle-orm";
import { requireSuperAdmin } from "@/lib/auth/get-session";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { signImpersonationCookie, verifyImpersonationCookie } from "@/lib/utils/impersonation";
import type { ImpersonationPayload } from "@/lib/utils/impersonation";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Derive a request IP from headers (best effort — may be null behind reverse proxies). */
async function getRequestIp(): Promise<string | null> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;
}

async function logPlatformAction(
  userId: string,
  action: string,
  targetOrgId?: string | null,
  targetUserId?: string | null,
  details?: Record<string, unknown>
) {
  const ipAddress = await getRequestIp();
  await db.insert(platformAuditLog).values({
    userId,
    action,
    targetOrgId: targetOrgId ?? null,
    targetUserId: targetUserId ?? null,
    details: details ? JSON.stringify(details) : null,
    ipAddress,
  });
}

const PLATFORM_SLUG = "_platform";
const ALLOWED_ORG_STATUSES = ["active", "suspended", "cancelled"] as const;

// ---------------------------------------------------------------------------
// Suspend / Reactivate Organization
// ---------------------------------------------------------------------------
export async function suspendOrganization(orgId: string, reason?: string) {
  const session = await requireSuperAdmin();

  const [org] = await db
    .select({ id: organizations.id, status: organizations.status, name: organizations.name, slug: organizations.slug })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  if (!org) return { error: "Organization not found" };
  if (org.slug === PLATFORM_SLUG) return { error: "Cannot suspend the platform organization" };
  if (org.status === "suspended") return { error: "Organization is already suspended" };

  await db
    .update(organizations)
    .set({ status: "suspended", updatedAt: new Date() })
    .where(eq(organizations.id, orgId));

  await logPlatformAction(session.user.id, "suspend_org", orgId, null, {
    orgName: org.name,
    reason: reason ?? "No reason provided",
  });

  revalidatePath("/admin/organizations");
  revalidatePath(`/admin/organizations/${orgId}`);
  return { success: true };
}

export async function reactivateOrganization(orgId: string) {
  const session = await requireSuperAdmin();

  const [org] = await db
    .select({ id: organizations.id, status: organizations.status, name: organizations.name, slug: organizations.slug })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  if (!org) return { error: "Organization not found" };
  if (org.slug === PLATFORM_SLUG) return { error: "Cannot modify the platform organization" };
  if (org.status === "active") return { error: "Organization is already active" };

  await db
    .update(organizations)
    .set({ status: "active", updatedAt: new Date() })
    .where(eq(organizations.id, orgId));

  await logPlatformAction(session.user.id, "reactivate_org", orgId, null, {
    orgName: org.name,
    previousStatus: org.status,
  });

  revalidatePath("/admin/organizations");
  revalidatePath(`/admin/organizations/${orgId}`);
  return { success: true };
}

// ---------------------------------------------------------------------------
// Update Organization
// ---------------------------------------------------------------------------
export async function updateOrganization(
  orgId: string,
  data: { name?: string; email?: string; phone?: string; status?: string }
) {
  const session = await requireSuperAdmin();

  // Validate status if provided
  if (data.status && !(ALLOWED_ORG_STATUSES as readonly string[]).includes(data.status)) {
    return { error: `Invalid status. Allowed: ${ALLOWED_ORG_STATUSES.join(", ")}` };
  }

  // Prevent any modifications to the platform org
  const [targetOrg] = await db
    .select({ slug: organizations.slug })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);
  if (targetOrg?.slug === PLATFORM_SLUG) {
    return { error: "Cannot modify the platform organization" };
  }

  await db
    .update(organizations)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(organizations.id, orgId));

  await logPlatformAction(session.user.id, "update_org", orgId, null, { changes: data });

  revalidatePath("/admin/organizations");
  revalidatePath(`/admin/organizations/${orgId}`);
  return { success: true };
}

// ---------------------------------------------------------------------------
// Plan Management
// ---------------------------------------------------------------------------
export async function createPlan(data: {
  name: string;
  slug: string;
  description?: string;
  maxUsers?: number | null;
  maxCases?: number | null;
  maxStorageMb?: number | null;
  features?: string;
  monthlyPrice?: string;
  annualPrice?: string;
  currency?: string;
  trialDays?: number;
}) {
  const session = await requireSuperAdmin();

  const [existing] = await db
    .select({ id: plans.id })
    .from(plans)
    .where(eq(plans.slug, data.slug))
    .limit(1);

  if (existing) return { error: "A plan with this slug already exists" };

  const [plan] = await db
    .insert(plans)
    .values({
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      maxUsers: data.maxUsers ?? null,
      maxCases: data.maxCases ?? null,
      maxStorageMb: data.maxStorageMb ?? null,
      features: data.features ?? null,
      monthlyPrice: data.monthlyPrice ?? null,
      annualPrice: data.annualPrice ?? null,
      currency: data.currency ?? "KES",
      trialDays: data.trialDays ?? 14,
      isActive: true,
    })
    .returning();

  await logPlatformAction(session.user.id, "create_plan", null, null, {
    planId: plan.id,
    planName: data.name,
  });

  revalidatePath("/admin/plans");
  return { success: true, planId: plan.id };
}

export async function updatePlan(
  planId: string,
  data: {
    name?: string;
    description?: string;
    maxUsers?: number | null;
    maxCases?: number | null;
    maxStorageMb?: number | null;
    features?: string;
    monthlyPrice?: string;
    annualPrice?: string;
    trialDays?: number;
    isActive?: boolean;
  }
) {
  const session = await requireSuperAdmin();

  await db
    .update(plans)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(plans.id, planId));

  await logPlatformAction(session.user.id, "update_plan", null, null, {
    planId,
    changes: data,
  });

  revalidatePath("/admin/plans");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Impersonation (HMAC-signed cookie)
// ---------------------------------------------------------------------------
const IMPERSONATION_COOKIE = "impersonation";
const IMPERSONATION_MAX_AGE = 60 * 60; // 1 hour

export async function startImpersonation(orgId: string) {
  const session = await requireSuperAdmin();

  // Find the org and its admin user
  const [org] = await db
    .select({ id: organizations.id, name: organizations.name, slug: organizations.slug })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  if (!org) return { error: "Organization not found" };
  if (org.slug === PLATFORM_SLUG) return { error: "Cannot impersonate the platform organization" };

  // Find an admin user in the org to impersonate
  const [adminUser] = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(
      and(
        eq(users.organizationId, orgId),
        eq(users.role, "admin"),
        eq(users.isActive, true)
      )
    )
    .limit(1);

  if (!adminUser) return { error: "No active admin user found in this organization" };

  const payload: ImpersonationPayload = {
    superAdminId: session.user.id,
    superAdminName: session.user.name,
    targetOrgId: org.id,
    targetOrgName: org.name,
    targetOrgSlug: org.slug,
    targetUserId: adminUser.id,
    startedAt: new Date().toISOString(),
  };

  const cookieStore = await cookies();
  cookieStore.set(IMPERSONATION_COOKIE, signImpersonationCookie(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: IMPERSONATION_MAX_AGE,
    path: "/",
  });

  await logPlatformAction(session.user.id, "impersonate_start", orgId, adminUser.id, {
    orgName: org.name,
    targetUserName: adminUser.name,
  });

  revalidatePath("/admin");
  return { success: true, slug: org.slug };
}

export async function endImpersonation() {
  // Require super_admin auth — the real JWT session still has super_admin role
  const session = await requireSuperAdmin();

  const cookieStore = await cookies();
  const cookie = cookieStore.get(IMPERSONATION_COOKIE);

  if (cookie) {
    const payload = verifyImpersonationCookie(cookie.value);
    if (payload && payload.superAdminId === session.user.id) {
      await logPlatformAction(session.user.id, "impersonate_end", payload.targetOrgId, payload.targetUserId, {
        orgName: payload.targetOrgName,
        duration: Date.now() - new Date(payload.startedAt).getTime(),
      });
    }
  }

  cookieStore.delete(IMPERSONATION_COOKIE);
  redirect("/admin");
}

/**
 * Reads and verifies the impersonation cookie. Used by the dashboard layout
 * and the session callback in auth.ts to overlay impersonation context.
 */
export async function getImpersonationState() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(IMPERSONATION_COOKIE);
  if (!cookie) return null;

  const payload = verifyImpersonationCookie(cookie.value);
  if (!payload) {
    // Invalid or expired — clean up
    cookieStore.delete(IMPERSONATION_COOKIE);
    return null;
  }

  return {
    superAdminId: payload.superAdminId,
    superAdminName: payload.superAdminName,
    targetOrgId: payload.targetOrgId,
    targetOrgName: payload.targetOrgName,
    targetOrgSlug: payload.targetOrgSlug,
    targetUserId: payload.targetUserId,
    startedAt: payload.startedAt,
  };
}
