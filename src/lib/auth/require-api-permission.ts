import type { ApiKeyContext } from "./api-key-auth";

/**
 * Validates that an API key has the required permission.
 * Permissions follow the format: "resource:action" (e.g., "cases:read", "clients:write").
 *
 * A wildcard permission "*" grants access to all resources.
 * A resource wildcard "cases:*" grants all actions on that resource.
 *
 * Returns true if the permission is granted, false otherwise.
 */
export function hasApiPermission(
  context: ApiKeyContext,
  requiredPermission: string
): boolean {
  const { permissions } = context;

  // No permissions assigned = no access
  if (!permissions || permissions.length === 0) return false;

  // Wildcard grants all
  if (permissions.includes("*")) return true;

  // Exact match
  if (permissions.includes(requiredPermission)) return true;

  // Resource wildcard: "cases:*" matches "cases:read"
  const [resource] = requiredPermission.split(":");
  if (permissions.includes(`${resource}:*`)) return true;

  return false;
}

/**
 * Checks that an API key context has the required permission.
 * Returns an error message string if denied, or null if allowed.
 */
export function requireApiPermission(
  context: ApiKeyContext,
  requiredPermission: string
): string | null {
  if (hasApiPermission(context, requiredPermission)) return null;
  return `API key lacks required permission: ${requiredPermission}`;
}
