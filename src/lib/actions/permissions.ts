"use server";

import { db } from "@/lib/db";
import { rolePermissions } from "@/lib/db/schema/settings";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { safeAction } from "@/lib/utils/safe-action";
import { createAuditLog } from "@/lib/utils/audit";
import { requireAdmin } from "@/lib/auth/get-session";
import { auth } from "@/lib/auth/auth";
import { updateRolePermissionsSchema } from "@/lib/validators/permissions";
import { getPermissionsForRole } from "@/lib/queries/permissions";

/** Called by the client on login to load permissions into localStorage */
export async function getMyPermissions() {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user?.role) {
      return { error: "Not authenticated" } as unknown as Record<string, string[]>;
    }
    return await getPermissionsForRole(session.user.role);
  });
}

export async function updateRolePermissions(input: unknown) {
  return safeAction(async () => {
    const session = await requireAdmin();
    const parsed = updateRolePermissionsSchema.parse(input);

    // Delete existing permissions for the role
    await db.delete(rolePermissions).where(eq(rolePermissions.role, parsed.role));

    // Insert new permissions
    if (parsed.permissions.length > 0) {
      await db.insert(rolePermissions).values(
        parsed.permissions.map((p) => ({
          role: parsed.role,
          resource: p.resource,
          actions: p.actions,
          updatedBy: session.user.id,
          updatedAt: new Date(),
        }))
      );
    }

    await createAuditLog(
      session.user.id,
      "update",
      "role_permissions",
      parsed.role,
      { permissions: parsed.permissions }
    );

    revalidatePath("/settings/permissions");
    return { success: true };
  });
}
