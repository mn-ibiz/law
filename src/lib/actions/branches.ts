"use server";

import { db } from "@/lib/db";
import { branches, branchUsers } from "@/lib/db/schema/branches";
import { getTenantContext } from "@/lib/auth/get-session";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { safeAction } from "@/lib/utils/safe-action";
import { validateId } from "@/lib/utils/validate-id";

const createBranchSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  county: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  isMain: z.boolean().default(false),
});

export async function createBranch(data: unknown) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized" };

    const validated = createBranchSchema.safeParse(data);
    if (!validated.success) return { error: validated.error.issues[0].message };

    const result = await db
      .insert(branches)
      .values({ ...validated.data, organizationId, email: validated.data.email || null })
      .returning();

    revalidatePath("/settings/branches");
    return { data: result[0] };
  });
}

export async function updateBranch(id: string, data: unknown) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized" };

    if (!validateId(id)) return { error: "Invalid ID" };

    const validated = createBranchSchema.safeParse(data);
    if (!validated.success) return { error: validated.error.issues[0].message };

    await db
      .update(branches)
      .set({ ...validated.data, email: validated.data.email || null, updatedAt: new Date() })
      .where(and(eq(branches.id, id), eq(branches.organizationId, organizationId)));

    revalidatePath("/settings/branches");
    return { success: true };
  });
}

export async function toggleBranchActive(id: string) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized" };

    if (!validateId(id)) return { error: "Invalid ID" };

    // Atomic toggle — avoids read-modify-write race condition
    await db
      .update(branches)
      .set({ isActive: sql`NOT ${branches.isActive}`, updatedAt: new Date() })
      .where(and(eq(branches.id, id), eq(branches.organizationId, organizationId)));

    revalidatePath("/settings/branches");
    return { success: true };
  });
}

// --- Branch Users ---
export async function assignUserToBranch(branchId: string, targetUserId: string, isPrimary = false) {
  return safeAction(async () => {
    const schema = z.object({
      branchId: z.string().uuid(),
      userId: z.string().uuid(),
      isPrimary: z.boolean().default(false),
    });
    const parsed = schema.safeParse({ branchId, userId: targetUserId, isPrimary });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized" };

    // Verify the branch belongs to this organization
    const [branch] = await db
      .select({ id: branches.id })
      .from(branches)
      .where(and(eq(branches.id, parsed.data.branchId), eq(branches.organizationId, organizationId)))
      .limit(1);
    if (!branch) return { error: "Branch not found" };

    const result = await db
      .insert(branchUsers)
      .values({ branchId: parsed.data.branchId, userId: parsed.data.userId, isPrimary: parsed.data.isPrimary })
      .returning();

    revalidatePath("/settings/branches");
    return { data: result[0] };
  });
}

export async function removeUserFromBranch(id: string) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized" };

    if (!validateId(id)) return { error: "Invalid ID" };

    // Verify the branch_user record belongs to a branch in this organization
    const [record] = await db
      .select({ id: branchUsers.id, branchId: branchUsers.branchId })
      .from(branchUsers)
      .innerJoin(branches, eq(branchUsers.branchId, branches.id))
      .where(and(eq(branchUsers.id, id), eq(branches.organizationId, organizationId)))
      .limit(1);
    if (!record) return { error: "Record not found" };

    await db.delete(branchUsers).where(eq(branchUsers.id, id));
    revalidatePath("/settings/branches");
    return { success: true };
  });
}
