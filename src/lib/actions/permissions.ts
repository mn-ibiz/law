"use server";

import { db } from "@/lib/db";
import { rolePermissions } from "@/lib/db/schema/settings";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { safeAction } from "@/lib/utils/safe-action";
import { createAuditLog } from "@/lib/utils/audit";
import { getTenantContext } from "@/lib/auth/get-session";
import { updateRolePermissionsSchema } from "@/lib/validators/permissions";
import { getPermissionsForRole } from "@/lib/queries/permissions";

/** Called by the client on login to load permissions into localStorage */
export async function getMyPermissions() {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    return await getPermissionsForRole(organizationId, role);
  });
}

export async function updateRolePermissions(input: unknown) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized" };

    const parsed = updateRolePermissionsSchema.parse(input);

    // Delete existing permissions for the role within this organization
    await db.delete(rolePermissions).where(
      and(eq(rolePermissions.role, parsed.role), eq(rolePermissions.organizationId, organizationId))
    );

    // Insert new permissions
    if (parsed.permissions.length > 0) {
      await db.insert(rolePermissions).values(
        parsed.permissions.map((p) => ({
          organizationId,
          role: parsed.role,
          resource: p.resource,
          actions: p.actions,
          updatedBy: userId,
          updatedAt: new Date(),
        }))
      );
    }

    await createAuditLog(
      organizationId,
      userId,
      "update",
      "role_permissions",
      parsed.role,
      { permissions: parsed.permissions }
    );

    revalidatePath("/settings/permissions");
    return { success: true };
  });
}
