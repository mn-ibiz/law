"use server";

import { db } from "@/lib/db";
import { stageAutomations, caseAssignments } from "@/lib/db/schema/cases";
import { notifications } from "@/lib/db/schema/messaging";
import { tasks } from "@/lib/db/schema/calendar";
import { cases } from "@/lib/db/schema/cases";
import { auth } from "@/lib/auth/auth";
import { stageAutomationSchema } from "@/lib/validators/pipeline";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { safeAction } from "@/lib/utils/safe-action";

// --- Automation Execution ---

export async function executeStageAutomations(
  caseId: string,
  toStageId: string,
  fromStageId: string | null,
  userId: string
) {
  // Fetch "enter" automations for the new stage
  const enterAutomations = await db
    .select()
    .from(stageAutomations)
    .where(
      and(
        eq(stageAutomations.stageId, toStageId),
        eq(stageAutomations.triggerOn, "enter"),
        eq(stageAutomations.isActive, true)
      )
    );

  // Fetch "exit" automations for the old stage
  let exitAutomations: typeof enterAutomations = [];
  if (fromStageId) {
    exitAutomations = await db
      .select()
      .from(stageAutomations)
      .where(
        and(
          eq(stageAutomations.stageId, fromStageId),
          eq(stageAutomations.triggerOn, "exit"),
          eq(stageAutomations.isActive, true)
        )
      );
  }

  const allAutomations = [...exitAutomations, ...enterAutomations];

  for (const automation of allAutomations) {
    try {
      const config = automation.actionConfig ? JSON.parse(automation.actionConfig) : {};
      switch (automation.actionType) {
        case "send_notification":
          await executeNotificationAutomation(caseId, config);
          break;
        case "create_task":
          await executeTaskAutomation(caseId, config, userId);
          break;
        case "update_status":
          await executeStatusAutomation(caseId, config);
          break;
      }
    } catch (err) {
      console.error(`[pipeline automation] Failed automation ${automation.id}:`, err);
    }
  }
}

async function executeNotificationAutomation(
  caseId: string,
  config: { title?: string; message?: string }
) {
  // Get all assigned users for the case
  const assigned = await db
    .select({ userId: caseAssignments.userId })
    .from(caseAssignments)
    .where(
      and(
        eq(caseAssignments.caseId, caseId),
        sql`${caseAssignments.unassignedAt} IS NULL`
      )
    );

  if (assigned.length === 0) return;

  const title = config.title || "Pipeline stage changed";
  const message = config.message || "A case you are assigned to has moved to a new pipeline stage.";

  const values = assigned.map((a) => ({
    userId: a.userId,
    type: "info" as const,
    title,
    message,
    linkUrl: `/cases/${caseId}`,
  }));

  await db.insert(notifications).values(values);
}

async function executeTaskAutomation(
  caseId: string,
  config: { title?: string; priority?: string; dueDaysOffset?: number },
  userId: string
) {
  const dueDate = config.dueDaysOffset
    ? new Date(Date.now() + config.dueDaysOffset * 86400000)
    : undefined;

  await db.insert(tasks).values({
    title: config.title || "Follow up on pipeline stage change",
    caseId,
    createdBy: userId,
    assignedTo: userId,
    priority: (config.priority as "low" | "medium" | "high" | "critical") || "medium",
    dueDate,
  });
}

async function executeStatusAutomation(
  caseId: string,
  config: { status?: string }
) {
  if (!config.status) return;
  const validStatuses = ["open", "in_progress", "hearing", "resolved", "closed", "archived"] as const;
  if (!validStatuses.includes(config.status as typeof validStatuses[number])) return;

  await db
    .update(cases)
    .set({
      status: config.status as typeof validStatuses[number],
      updatedAt: new Date(),
    })
    .where(eq(cases.id, caseId));
}

// --- Stage Automation CRUD ---

export async function createStageAutomation(data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return { error: "Unauthorized" };
    }

    const validated = stageAutomationSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const result = await db
      .insert(stageAutomations)
      .values(validated.data)
      .returning();

    revalidatePath("/cases/pipeline");
    return { data: result[0] };
  });
}

export async function updateStageAutomation(id: string, data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return { error: "Unauthorized" };
    }

    const validated = stageAutomationSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    await db
      .update(stageAutomations)
      .set(validated.data)
      .where(eq(stageAutomations.id, id));

    revalidatePath("/cases/pipeline");
    return { success: true };
  });
}

export async function deleteStageAutomation(id: string) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return { error: "Unauthorized" };
    }

    await db.delete(stageAutomations).where(eq(stageAutomations.id, id));

    revalidatePath("/cases/pipeline");
    return { success: true };
  });
}

export async function getStageAutomations(stageId: string) {
  return db
    .select()
    .from(stageAutomations)
    .where(eq(stageAutomations.stageId, stageId))
    .orderBy(stageAutomations.createdAt);
}
