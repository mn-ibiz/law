"use server";

import { db } from "@/lib/db";
import { workflowTemplates, workflowRules } from "@/lib/db/schema/workflows";
import { auth } from "@/lib/auth/auth";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createWorkflowTemplateSchema, createWorkflowRuleSchema } from "@/lib/validators/workflows";
import { safeAction } from "@/lib/utils/safe-action";

export async function createWorkflowTemplate(data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
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
        createdBy: session.user.id,
      })
      .returning();

    revalidatePath("/settings");
    return { data: result[0] };
  });
}

export async function updateWorkflowTemplate(id: string, data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return { error: "Unauthorized" };
    }

    const validated = createWorkflowTemplateSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    await db
      .update(workflowTemplates)
      .set({ ...validated.data, updatedAt: new Date() })
      .where(eq(workflowTemplates.id, id));

    revalidatePath("/settings");
    return { success: true };
  });
}

export async function toggleWorkflowActive(id: string) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return { error: "Unauthorized" };
    }

    await db
      .update(workflowTemplates)
      .set({ isActive: sql`NOT ${workflowTemplates.isActive}`, updatedAt: new Date() })
      .where(eq(workflowTemplates.id, id));

    revalidatePath("/settings");
    return { success: true };
  });
}

export async function createWorkflowRule(data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return { error: "Unauthorized" };
    }

    const validated = createWorkflowRuleSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const result = await db
      .insert(workflowRules)
      .values(validated.data)
      .returning();

    revalidatePath("/settings");
    return { data: result[0] };
  });
}

export async function deleteWorkflowRule(id: string) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return { error: "Unauthorized" };
    }

    await db.delete(workflowRules).where(eq(workflowRules.id, id));
    revalidatePath("/settings");
    return { success: true };
  });
}
