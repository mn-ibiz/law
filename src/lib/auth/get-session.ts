import { auth } from "./auth";
import { redirect } from "next/navigation";
import type { Role } from "./permissions";

export async function getSession() {
  const session = await auth();
  return session;
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(...roles: Role[]) {
  const session = await requireAuth();
  if (!roles.includes(session.user.role as Role)) {
    redirect("/forbidden");
  }
  return session;
}

export async function requireAdmin() {
  return requireRole("admin");
}

export async function requireAdminOrAttorney() {
  return requireRole("admin", "attorney");
}

export async function requireSuperAdmin() {
  return requireRole("super_admin");
}

/**
 * Returns the authenticated user's organizationId.
 * Redirects to login if not authenticated.
 * Use this in server actions and queries to scope data by tenant.
 */
export async function requireOrg() {
  const session = await requireAuth();
  if (!session.user.organizationId) {
    redirect("/login");
  }
  return {
    session,
    organizationId: session.user.organizationId,
    organizationSlug: session.user.organizationSlug,
  };
}

/**
 * Convenience alias for use in server actions.
 * Returns organizationId + userId + role for tenant-scoped operations.
 */
export async function getTenantContext() {
  const { session, organizationId, organizationSlug } = await requireOrg();
  return {
    organizationId,
    organizationSlug,
    userId: session.user.id,
    role: session.user.role,
    session,
  };
}
