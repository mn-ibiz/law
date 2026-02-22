"use server";

import { db } from "@/lib/db";
import { courts, courtFilings } from "@/lib/db/schema/courts";
import { bringUps } from "@/lib/db/schema/calendar";
import { auth } from "@/lib/auth/auth";
import { createAuditLog } from "@/lib/utils/audit";
import { createCourtSchema, createFilingSchema, updateFilingStatusSchema, createBringUpSchema } from "@/lib/validators/court";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createCourt(data: unknown) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const validated = createCourtSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const result = await db.insert(courts).values(validated.data).returning();

  await createAuditLog(session.user.id as string, "create", "court", result[0].id, validated.data);

  revalidatePath("/courts");
  return { data: result[0] };
}

export async function createCourtFiling(data: unknown) {
  const session = await auth();
  if (!session?.user || !["admin", "attorney"].includes(session.user.role as string)) {
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
      filedBy: session.user.id as string,
      filingDate: filingDate ? new Date(filingDate) : undefined,
    })
    .returning();

  revalidatePath(`/cases/${validated.data.caseId}`);
  return { data: result[0] };
}

export async function updateFilingStatus(filingId: string, data: unknown) {
  const session = await auth();
  if (!session?.user || !["admin", "attorney"].includes(session.user.role as string)) {
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

  return { success: true };
}

export async function createBringUp(data: unknown) {
  const session = await auth();
  if (!session?.user || !["admin", "attorney"].includes(session.user.role as string)) {
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
      createdBy: session.user.id as string,
    })
    .returning();

  revalidatePath("/bring-ups");
  revalidatePath(`/cases/${validated.data.caseId}`);
  return { data: result[0] };
}

export async function completeBringUp(id: string) {
  const session = await auth();
  if (!session?.user || !["admin", "attorney"].includes(session.user.role as string)) {
    return { error: "Unauthorized" };
  }

  await db
    .update(bringUps)
    .set({ status: "completed", completedAt: new Date(), updatedAt: new Date() })
    .where(eq(bringUps.id, id));

  revalidatePath("/bring-ups");
  return { success: true };
}
