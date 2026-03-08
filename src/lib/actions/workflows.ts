"use server";

import { db } from "@/lib/db";
import { workflowTemplates, workflowRules } from "@/lib/db/schema/workflows";
import { getTenantContext } from "@/lib/auth/get-session";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createWorkflowTemplateSchema, createWorkflowRuleSchema } from "@/lib/validators/workflows";
import { safeAction } from "@/lib/utils/safe-action";

export async function createWorkflowTemplate(data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (role !== "admin") {
      return { error: "Unauthorized" };
    }

    const validated = createWorkflowTemplateSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const result = await db
      .insert(workflowTemplates)
      .values({
        ...validated.data,
        organizationId,
        createdBy: userId,
      })
      .returning();

    revalidatePath("/settings");
    return { data: result[0] };
  });
}

export async function updateWorkflowTemplate(id: string, data: unknown) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") {
      return { error: "Unauthorized" };
    }

    const validated = createWorkflowTemplateSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    await db
      .update(workflowTemplates)
      .set({ ...validated.data, updatedAt: new Date() })
      .where(and(eq(workflowTemplates.id, id), eq(workflowTemplates.organizationId, organizationId)));

    revalidatePath("/settings");
    return { success: true };
  });
}

export async function toggleWorkflowActive(id: string) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") {
      return { error: "Unauthorized" };
    }

    await db
      .update(workflowTemplates)
      .set({ isActive: sql`NOT ${workflowTemplates.isActive}`, updatedAt: new Date() })
      .where(and(eq(workflowTemplates.id, id), eq(workflowTemplates.organizationId, organizationId)));

    revalidatePath("/settings");
    return { success: true };
  });
}

export async function createWorkflowRule(data: unknown) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") {
      return { error: "Unauthorized" };
    }

    const validated = createWorkflowRuleSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    // Verify the template belongs to this organization before adding a rule
    const [template] = await db
      .select({ id: workflowTemplates.id })
      .from(workflowTemplates)
      .where(and(eq(workflowTemplates.id, validated.data.templateId), eq(workflowTemplates.organizationId, organizationId)))
      .limit(1);
    if (!template) return { error: "Workflow template not found" };

    const result = await db
      .insert(workflowRules)
      .values({ ...validated.data, organizationId })
      .returning();

    revalidatePath("/settings");
    return { data: result[0] };
  });
}

export async function deleteWorkflowRule(id: string) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") {
      return { error: "Unauthorized" };
    }

    // Verify the rule belongs to this organization
    const [rule] = await db
      .select({ id: workflowRules.id })
      .from(workflowRules)
      .where(and(eq(workflowRules.id, id), eq(workflowRules.organizationId, organizationId)))
      .limit(1);
    if (!rule) return { error: "Rule not found" };

    await db.delete(workflowRules).where(
      and(eq(workflowRules.id, id), eq(workflowRules.organizationId, organizationId))
    );
    revalidatePath("/settings");
    return { success: true };
  });
}
