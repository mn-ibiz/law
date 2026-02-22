"use server";

import { db } from "@/lib/db";
import { calendarEvents, deadlines, tasks } from "@/lib/db/schema/calendar";
import { auth } from "@/lib/auth/auth";
import { createEventSchema, createDeadlineSchema, createTaskSchema } from "@/lib/validators/calendar";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createEvent(data: unknown) {
  const session = await auth();
  if (!session?.user || !["admin", "attorney"].includes(session.user.role as string)) {
    return { error: "Unauthorized" };
  }

  const validated = createEventSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { startTime, endTime, caseId, ...rest } = validated.data;

  const result = await db
    .insert(calendarEvents)
    .values({
      ...rest,
      caseId: caseId || undefined,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      createdBy: session.user.id as string,
    })
    .returning();

  revalidatePath("/calendar");
  return { data: result[0] };
}

export async function createDeadline(data: unknown) {
  const session = await auth();
  if (!session?.user || !["admin", "attorney"].includes(session.user.role as string)) {
    return { error: "Unauthorized" };
  }

  const validated = createDeadlineSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { dueDate, caseId, assignedTo, ...rest } = validated.data;

  const result = await db
    .insert(deadlines)
    .values({
      ...rest,
      dueDate: new Date(dueDate),
      caseId: caseId || undefined,
      assignedTo: assignedTo || undefined,
    })
    .returning();

  revalidatePath("/calendar");
  return { data: result[0] };
}

export async function completeDeadline(id: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  await db
    .update(deadlines)
    .set({ completedAt: new Date(), updatedAt: new Date() })
    .where(eq(deadlines.id, id));

  revalidatePath("/calendar");
  return { success: true };
}

export async function createTask(data: unknown) {
  const session = await auth();
  if (!session?.user || !["admin", "attorney"].includes(session.user.role as string)) {
    return { error: "Unauthorized" };
  }

  const validated = createTaskSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { dueDate, caseId, assignedTo, ...rest } = validated.data;

  const result = await db
    .insert(tasks)
    .values({
      ...rest,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      caseId: caseId || undefined,
      assignedTo: assignedTo || undefined,
      createdBy: session.user.id as string,
    })
    .returning();

  revalidatePath("/tasks");
  return { data: result[0] };
}

export async function updateTaskStatus(id: string, status: "pending" | "in_progress" | "completed" | "cancelled") {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  await db
    .update(tasks)
    .set({
      status,
      completedAt: status === "completed" ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, id));

  revalidatePath("/tasks");
  return { success: true };
}
