"use server";

import { db } from "@/lib/db";
import { calendarEvents, eventAttendees, deadlines, tasks } from "@/lib/db/schema/calendar";
import { auth } from "@/lib/auth/auth";
import { createEventSchema, createDeadlineSchema, createTaskSchema } from "@/lib/validators/calendar";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { safeAction } from "@/lib/utils/safe-action";

export async function createEvent(data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
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
        createdBy: session.user.id,
      })
      .returning();

    revalidatePath("/calendar");
    return { data: result[0] };
  });
}

export async function createDeadline(data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
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
  });
}

export async function completeDeadline(id: string) {
  return safeAction(async () => {
    const idParsed = z.string().uuid().safeParse(id);
    if (!idParsed.success) return { error: "Invalid deadline ID" };

    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
      return { error: "Unauthorized" };
    }

    await db
      .update(deadlines)
      .set({ completedAt: new Date(), updatedAt: new Date() })
      .where(eq(deadlines.id, idParsed.data));

    revalidatePath("/calendar");
    return { success: true };
  });
}

export async function createTask(data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
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
        createdBy: session.user.id,
      })
      .returning();

    revalidatePath("/tasks");
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

    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
      return { error: "Unauthorized" };
    }

    await db
      .update(tasks)
      .set({
        status: statusParsed.data,
        completedAt: statusParsed.data === "completed" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, idParsed.data));

    revalidatePath("/tasks");
    return { success: true };
  });
}

// --- Event Attendees ---
export async function addEventAttendee(eventId: string, userId: string) {
  return safeAction(async () => {
    const eventIdParsed = z.string().uuid().safeParse(eventId);
    if (!eventIdParsed.success) return { error: "Invalid event ID" };

    const userIdParsed = z.string().uuid().safeParse(userId);
    if (!userIdParsed.success) return { error: "Invalid user ID" };

    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
      return { error: "Unauthorized" };
    }

    const result = await db
      .insert(eventAttendees)
      .values({ eventId: eventIdParsed.data, userId: userIdParsed.data })
      .returning();

    revalidatePath("/calendar");
    return { data: result[0] };
  });
}

export async function removeEventAttendee(id: string) {
  return safeAction(async () => {
    const idParsed = z.string().uuid().safeParse(id);
    if (!idParsed.success) return { error: "Invalid attendee ID" };

    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
      return { error: "Unauthorized" };
    }

    await db.delete(eventAttendees).where(eq(eventAttendees.id, idParsed.data));
    revalidatePath("/calendar");
    return { success: true };
  });
}
