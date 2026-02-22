"use server";

import { db } from "@/lib/db";
import { workflowTemplates, workflowRules } from "@/lib/db/schema/workflows";
import { auth } from "@/lib/auth/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createWorkflowTemplateSchema, createWorkflowRuleSchema } from "@/lib/validators/workflows";

export async function createWorkflowTemplate(data: unknown) {
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
      createdBy: session.user.id as string,
    })
    .returning();

  revalidatePath("/settings");
  return { data: result[0] };
}

export async function updateWorkflowTemplate(id: string, data: unknown) {
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
}

export async function toggleWorkflowActive(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const existing = await db
    .select()
    .from(workflowTemplates)
    .where(eq(workflowTemplates.id, id))
    .limit(1);
  if (!existing[0]) return { error: "Not found" };

  await db
    .update(workflowTemplates)
    .set({ isActive: !existing[0].isActive, updatedAt: new Date() })
    .where(eq(workflowTemplates.id, id));

  revalidatePath("/settings");
  return { success: true };
}

export async function createWorkflowRule(data: unknown) {
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
}

export async function deleteWorkflowRule(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  await db.delete(workflowRules).where(eq(workflowRules.id, id));
  revalidatePath("/settings");
  return { success: true };
}
