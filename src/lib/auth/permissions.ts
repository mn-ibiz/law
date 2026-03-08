export type Role = "super_admin" | "admin" | "attorney" | "client";
export type Resource =
  | "attorneys"
  | "clients"
  | "cases"
  | "documents"
  | "calendar"
  | "time-tracking"
  | "expenses"
  | "billing"
  | "trust-accounts"
  | "messages"
  | "reports"
  | "settings"
  | "audit-log"
  | "users";
export type Action = "create" | "read" | "update" | "delete" | "export";

/** Hardcoded fallback — used when DB permissions are not yet seeded */
export const defaultPermissions: Record<Role, Partial<Record<Resource, Action[]>>> = {
  super_admin: {
    attorneys: ["create", "read", "update", "delete"],
    clients: ["create", "read", "update", "delete"],
    cases: ["create", "read", "update", "delete"],
    documents: ["create", "read", "update", "delete"],
    calendar: ["create", "read", "update", "delete"],
    "time-tracking": ["create", "read", "update", "delete"],
    expenses: ["create", "read", "update", "delete"],
    billing: ["create", "read", "update", "delete"],
    "trust-accounts": ["create", "read", "update", "delete"],
    messages: ["create", "read", "update", "delete"],
    reports: ["read", "export"],
    settings: ["create", "read", "update", "delete"],
    "audit-log": ["read", "export"],
    users: ["create", "read", "update", "delete"],
  },
  admin: {
    attorneys: ["create", "read", "update", "delete"],
    clients: ["create", "read", "update", "delete"],
    cases: ["create", "read", "update", "delete"],
    documents: ["create", "read", "update", "delete"],
    calendar: ["create", "read", "update", "delete"],
    "time-tracking": ["create", "read", "update", "delete"],
    expenses: ["create", "read", "update", "delete"],
    billing: ["create", "read", "update", "delete"],
    "trust-accounts": ["create", "read", "update", "delete"],
    messages: ["create", "read", "update", "delete"],
    reports: ["read", "export"],
    settings: ["create", "read", "update", "delete"],
    "audit-log": ["read", "export"],
    users: ["create", "read", "update", "delete"],
  },
  attorney: {
    attorneys: ["read"],
    clients: ["create", "read", "update"],
    cases: ["create", "read", "update"],
    documents: ["create", "read", "update", "delete"],
    calendar: ["create", "read", "update", "delete"],
    "time-tracking": ["create", "read", "update", "delete"],
    expenses: ["create", "read", "update", "delete"],
    billing: ["read"],
    "trust-accounts": ["read"],
    messages: ["create", "read"],
    reports: ["read"],
    settings: ["read"],
  },
  client: {
    cases: ["read"],
    documents: ["read"],
    billing: ["read"],
    messages: ["create", "read"],
    settings: ["read"],
  },
};

/**
 * Server-side permission check. Queries the DB for dynamic permissions,
 * falling back to the hardcoded matrix if the DB has no rows.
 */
export async function checkPermission(
  session: { user: { role: Role; organizationId?: string } } | null,
  resource: Resource,
  action: Action
): Promise<boolean> {
  if (!session) return false;

  // Dynamic import to avoid pulling DB code into client bundles
  const { getPermissionsForRole } = await import("@/lib/queries/permissions");
  const orgId = session.user.organizationId ?? "";
  const dbPerms = await getPermissionsForRole(orgId, session.user.role);

  // Use DB permissions if any exist for this role
  if (Object.keys(dbPerms).length > 0) {
    const resourceActions = dbPerms[resource];
    if (!resourceActions) return false;
    return resourceActions.includes(action);
  }

  // Fallback to hardcoded matrix
  const rolePermissions = defaultPermissions[session.user.role];
  if (!rolePermissions) return false;
  const resourcePermissions = rolePermissions[resource];
  if (!resourcePermissions) return false;
  return resourcePermissions.includes(action);
}

export function isAdmin(role: Role): boolean {
  return role === "admin";
}

export function isAttorney(role: Role): boolean {
  return role === "attorney";
}

export function isClient(role: Role): boolean {
  return role === "client";
}

export function canAccessDashboard(role: Role): boolean {
  return role === "admin" || role === "attorney";
}

export function canAccessPortal(role: Role): boolean {
  return role === "client";
}
