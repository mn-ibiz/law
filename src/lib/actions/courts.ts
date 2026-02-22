"use server";

import { db } from "@/lib/db";
import { courts, courtFilings, courtStations } from "@/lib/db/schema/courts";
import { bringUps } from "@/lib/db/schema/calendar";
import { auth } from "@/lib/auth/auth";
import { createAuditLog } from "@/lib/utils/audit";
import { createCourtSchema, createFilingSchema, updateFilingStatusSchema, createBringUpSchema } from "@/lib/validators/court";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { safeAction } from "@/lib/utils/safe-action";
import { validateId } from "@/lib/utils/validate-id";

export async function createCourt(data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return { error: "Unauthorized" };
    }

    const validated = createCourtSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const result = await db.insert(courts).values(validated.data).returning();

    await createAuditLog(session.user.id, "create", "court", result[0].id, validated.data);

    revalidatePath("/courts");
    return { data: result[0] };
  });
}

export async function createCourtFiling(data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
      return { error: "Unauthorized" };
    }

    const validated = createFilingSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { filingDate, ...rest } = validated.data;

    const result = await db
      .insert(courtFilings)
      .values({
        ...rest,
        filedBy: session.user.id,
        filingDate: filingDate ? new Date(filingDate) : undefined,
      })
      .returning();

    revalidatePath(`/cases/${validated.data.caseId}`);
    return { data: result[0] };
  });
}

export async function updateFilingStatus(filingId: string, data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
      return { error: "Unauthorized" };
    }

    const validated = updateFilingStatusSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    await db
      .update(courtFilings)
      .set({ status: validated.data.status, updatedAt: new Date() })
      .where(eq(courtFilings.id, filingId));

    revalidatePath("/courts");
    return { success: true };
  });
}

export async function createBringUp(data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
      return { error: "Unauthorized" };
    }

    const validated = createBringUpSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { date, ...rest } = validated.data;

    const result = await db
      .insert(bringUps)
      .values({
        ...rest,
        date: new Date(date),
        createdBy: session.user.id,
      })
      .returning();

    revalidatePath("/bring-ups");
    revalidatePath(`/cases/${validated.data.caseId}`);
    return { data: result[0] };
  });
}

export async function completeBringUp(id: string) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
      return { error: "Unauthorized" };
    }

    if (!validateId(id)) return { error: "Invalid ID" };

    // Atomic conditional update — prevents completing an already-completed bring-up
    const result = await db
      .update(bringUps)
      .set({ status: "completed", completedAt: new Date(), updatedAt: new Date() })
      .where(sql`${bringUps.id} = ${id} AND ${bringUps.status} != 'completed'`)
      .returning({ id: bringUps.id });

    if (result.length === 0) {
      return { error: "Bring-up not found or already completed" };
    }

    revalidatePath("/bring-ups");
    return { success: true };
  });
}

// --- Court Stations ---
const courtStationSchema = z.object({
  courtId: z.string().uuid("Invalid court ID"),
  name: z.string().min(1, "Name is required"),
  location: z.string().optional(),
  county: z.string().optional(),
  isActive: z.boolean().default(true),
});

export async function createCourtStation(data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return { error: "Unauthorized" };
    }

    const validated = courtStationSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const result = await db.insert(courtStations).values(validated.data).returning();

    revalidatePath("/courts");
    return { data: result[0] };
  });
}

export async function updateCourtStation(id: string, data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return { error: "Unauthorized" };
    }

    const validated = courtStationSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    await db.update(courtStations).set(validated.data).where(eq(courtStations.id, id));

    revalidatePath("/courts");
    return { success: true };
  });
}

export async function toggleCourtStationActive(id: string) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return { error: "Unauthorized" };
    }

    if (!validateId(id)) return { error: "Invalid ID" };

    await db.update(courtStations).set({ isActive: sql`NOT ${courtStations.isActive}` }).where(eq(courtStations.id, id));

    revalidatePath("/courts");
    return { success: true };
  });
}
