"use server";

import { db } from "@/lib/db";
import { calendarEvents, eventAttendees, deadlines, tasks } from "@/lib/db/schema/calendar";
import { getTenantContext } from "@/lib/auth/get-session";
import { createEventSchema, createDeadlineSchema, createTaskSchema } from "@/lib/validators/calendar";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { safeAction } from "@/lib/utils/safe-action";
import { generateDeadlinesFromCourtDate } from "@/lib/actions/courts";
import { dispatchWorkflowEvent } from "@/lib/workflows/engine";

export async function createEvent(data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId } = await getTenantContext();

    const validated = createEventSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { startTime, endTime, caseId, ...rest } = validated.data;

    const result = await db
      .insert(calendarEvents)
      .values({
        ...rest,
        organizationId,
        caseId: caseId || undefined,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        createdBy: userId,
      })
      .returning();

    // Auto-generate court rule deadlines for court hearings
    if (validated.data.type === "court_hearing" && validated.data.caseId) {
      generateDeadlinesFromCourtDate(
        validated.data.caseId,
        new Date(validated.data.startTime),
        null, // courtId not available on event, use general rules
        userId
      ).catch(console.error);
    }

    revalidatePath("/calendar");
    if (validated.data.caseId) revalidatePath(`/cases/${validated.data.caseId}`);
    return { data: result[0] };
  });
}

export async function createDeadline(data: unknown) {
  return safeAction(async () => {
    const { organizationId } = await getTenantContext();

    const validated = createDeadlineSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { dueDate, caseId, assignedTo, ...rest } = validated.data;

    const result = await db
      .insert(deadlines)
      .values({
        ...rest,
        organizationId,
        dueDate: new Date(dueDate),
        caseId: caseId || undefined,
        assignedTo: assignedTo || undefined,
      })
      .returning();

    revalidatePath("/calendar");
    revalidatePath("/deadlines");
    if (validated.data.caseId) revalidatePath(`/cases/${validated.data.caseId}`);
    return { data: result[0] };
  });
}

export async function completeDeadline(id: string) {
  return safeAction(async () => {
    const idParsed = z.string().uuid().safeParse(id);
    if (!idParsed.success) return { error: "Invalid deadline ID" };

    const { organizationId } = await getTenantContext();

    await db
      .update(deadlines)
      .set({ completedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(deadlines.id, idParsed.data), eq(deadlines.organizationId, organizationId)));

    revalidatePath("/calendar");
    return { success: true };
  });
}

export async function createTask(data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId } = await getTenantContext();

    const validated = createTaskSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { dueDate, caseId, assignedTo, ...rest } = validated.data;

    const result = await db
      .insert(tasks)
      .values({
        ...rest,
        organizationId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        caseId: caseId || undefined,
        assignedTo: assignedTo || undefined,
        createdBy: userId,
      })
      .returning();

    revalidatePath("/tasks");
    if (validated.data.caseId) revalidatePath(`/cases/${validated.data.caseId}`);
    return { data: result[0] };
  });
}

export async function updateTaskStatus(id: string, status: "pending" | "in_progress" | "completed" | "cancelled") {
  return safeAction(async () => {
    const idParsed = z.string().uuid().safeParse(id);
    if (!idParsed.success) return { error: "Invalid task ID" };

    const statusSchema = z.enum(["pending", "in_progress", "completed", "cancelled"]);
    const statusParsed = statusSchema.safeParse(status);
    if (!statusParsed.success) return { error: "Invalid status" };

    const { organizationId, userId } = await getTenantContext();

    await db
      .update(tasks)
      .set({
        status: statusParsed.data,
        completedAt: statusParsed.data === "completed" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, idParsed.data), eq(tasks.organizationId, organizationId)));

    // Fire workflow event when task is completed (fire-and-forget)
    if (statusParsed.data === "completed") {
      dispatchWorkflowEvent("task_completed", {
        organizationId,
        entityId: idParsed.data,
        entityType: "task",
        userId,
      }).catch(console.error);
    }

    revalidatePath("/tasks");
    return { success: true };
  });
}

// --- Event Attendees ---
export async function addEventAttendee(eventId: string, attendeeUserId: string) {
  return safeAction(async () => {
    const eventIdParsed = z.string().uuid().safeParse(eventId);
    if (!eventIdParsed.success) return { error: "Invalid event ID" };

    const userIdParsed = z.string().uuid().safeParse(attendeeUserId);
    if (!userIdParsed.success) return { error: "Invalid user ID" };

    const { organizationId } = await getTenantContext();

    const result = await db
      .insert(eventAttendees)
      .values({ organizationId, eventId: eventIdParsed.data, userId: userIdParsed.data })
      .returning();

    revalidatePath("/calendar");
    return { data: result[0] };
  });
}

export async function removeEventAttendee(id: string) {
  return safeAction(async () => {
    const idParsed = z.string().uuid().safeParse(id);
    if (!idParsed.success) return { error: "Invalid attendee ID" };

    const { organizationId } = await getTenantContext();

    await db.delete(eventAttendees).where(and(eq(eventAttendees.id, idParsed.data), eq(eventAttendees.organizationId, organizationId)));
    revalidatePath("/calendar");
    return { success: true };
  });
}

// --- Delete Actions ---

export async function deleteTask(id: string) {
  return safeAction(async () => {
    const idParsed = z.string().uuid().safeParse(id);
    if (!idParsed.success) return { error: "Invalid task ID" };

    const { organizationId } = await getTenantContext();

    await db.delete(tasks).where(and(eq(tasks.id, idParsed.data), eq(tasks.organizationId, organizationId)));
    revalidatePath("/tasks");
    return { success: true };
  });
}

export async function deleteDeadline(id: string) {
  return safeAction(async () => {
    const idParsed = z.string().uuid().safeParse(id);
    if (!idParsed.success) return { error: "Invalid deadline ID" };

    const { organizationId } = await getTenantContext();

    await db.delete(deadlines).where(and(eq(deadlines.id, idParsed.data), eq(deadlines.organizationId, organizationId)));
    revalidatePath("/deadlines");
    return { success: true };
  });
}

export async function deleteEvent(id: string) {
  return safeAction(async () => {
    const idParsed = z.string().uuid().safeParse(id);
    if (!idParsed.success) return { error: "Invalid event ID" };

    const { organizationId } = await getTenantContext();

    await db.delete(calendarEvents).where(and(eq(calendarEvents.id, idParsed.data), eq(calendarEvents.organizationId, organizationId)));
    revalidatePath("/calendar");
    return { success: true };
  });
}

// --- Update Actions ---

export async function updateTask(id: string, data: unknown) {
  return safeAction(async () => {
    const idParsed = z.string().uuid().safeParse(id);
    if (!idParsed.success) return { error: "Invalid task ID" };

    const { organizationId } = await getTenantContext();

    const updateSchema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      priority: z.enum(["low", "medium", "high", "critical"]).optional(),
      dueDate: z.string().optional(),
      assignedTo: z.string().uuid().optional().nullable(),
    });

    const validated = updateSchema.safeParse(data);
    if (!validated.success) return { error: validated.error.issues[0].message };

    const { dueDate, ...rest } = validated.data;

    await db
      .update(tasks)
      .set({
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, idParsed.data), eq(tasks.organizationId, organizationId)));

    revalidatePath("/tasks");
    return { success: true };
  });
}

export async function updateDeadline(id: string, data: unknown) {
  return safeAction(async () => {
    const idParsed = z.string().uuid().safeParse(id);
    if (!idParsed.success) return { error: "Invalid deadline ID" };

    const { organizationId } = await getTenantContext();

    const updateSchema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      priority: z.enum(["low", "medium", "high", "critical"]).optional(),
      dueDate: z.string().optional(),
      assignedTo: z.string().uuid().optional().nullable(),
      isStatutory: z.boolean().optional(),
    });

    const validated = updateSchema.safeParse(data);
    if (!validated.success) return { error: validated.error.issues[0].message };

    const { dueDate, ...rest } = validated.data;

    await db
      .update(deadlines)
      .set({
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(deadlines.id, idParsed.data), eq(deadlines.organizationId, organizationId)));

    revalidatePath("/deadlines");
    return { success: true };
  });
}

export async function updateEvent(id: string, data: unknown) {
  return safeAction(async () => {
    const idParsed = z.string().uuid().safeParse(id);
    if (!idParsed.success) return { error: "Invalid event ID" };

    const { organizationId } = await getTenantContext();

    const updateSchema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      type: z.enum(["court_hearing", "meeting", "deadline", "reminder", "consultation", "deposition", "other"]).optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      location: z.string().optional(),
      allDay: z.boolean().optional(),
      isCourtDate: z.boolean().optional(),
    });

    const validated = updateSchema.safeParse(data);
    if (!validated.success) return { error: validated.error.issues[0].message };

    const { startTime, endTime, ...rest } = validated.data;

    await db
      .update(calendarEvents)
      .set({
        ...rest,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(calendarEvents.id, idParsed.data), eq(calendarEvents.organizationId, organizationId)));

    revalidatePath("/calendar");
    return { success: true };
  });
}
