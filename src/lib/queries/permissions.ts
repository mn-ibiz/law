import { db } from "@/lib/db";
import { rolePermissions } from "@/lib/db/schema/settings";
import { eq, and } from "drizzle-orm";
import type { Resource, Action } from "@/lib/auth/permissions";

export async function getPermissionsForRole(
  organizationId: string,
  role: string
): Promise<Partial<Record<Resource, Action[]>>> {
  const rows = await db
    .select({ resource: rolePermissions.resource, actions: rolePermissions.actions })
    .from(rolePermissions)
    .where(and(eq(rolePermissions.organizationId, organizationId), eq(rolePermissions.role, role)));

  const result: Partial<Record<Resource, Action[]>> = {};
  for (const row of rows) {
    result[row.resource as Resource] = row.actions as Action[];
  }
  return result;
}

export async function getAllRolePermissions(organizationId: string): Promise<
  Record<string, Partial<Record<Resource, Action[]>>>
> {
  const rows = await db
    .select({
      role: rolePermissions.role,
      resource: rolePermissions.resource,
      actions: rolePermissions.actions,
    })
    .from(rolePermissions)
    .where(eq(rolePermissions.organizationId, organizationId));

  const result: Record<string, Partial<Record<Resource, Action[]>>> = {};
  for (const row of rows) {
    if (!result[row.role]) result[row.role] = {};
    result[row.role][row.resource as Resource] = row.actions as Action[];
  }
  return result;
}
