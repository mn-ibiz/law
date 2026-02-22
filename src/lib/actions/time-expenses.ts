"use server";

import { db } from "@/lib/db";
import { timeEntries, expenses, requisitions } from "@/lib/db/schema/time-expenses";
import { auth } from "@/lib/auth/auth";
import { createTimeEntrySchema, createExpenseSchema, createRequisitionSchema } from "@/lib/validators/time-expense";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createTimeEntry(data: unknown) {
  const session = await auth();
  if (!session?.user || !["admin", "attorney"].includes(session.user.role as string)) {
    return { error: "Unauthorized" };
  }

  const validated = createTimeEntrySchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { date, hours, hourlyRate, ...rest } = validated.data;
  const rate = hourlyRate ?? 0;
  const amount = hours * rate;

  const result = await db
    .insert(timeEntries)
    .values({
      ...rest,
      userId: session.user.id as string,
      date: new Date(date),
      hours: String(hours),
      rate: String(rate),
      amount: String(amount),
    })
    .returning();

  revalidatePath("/time-expenses");
  return { data: result[0] };
}

export async function deleteTimeEntry(id: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  // Only delete own entries or admin
  const entry = await db.select().from(timeEntries).where(eq(timeEntries.id, id)).limit(1);
  if (!entry[0]) return { error: "Not found" };
  if (entry[0].userId !== session.user.id && session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  await db.delete(timeEntries).where(eq(timeEntries.id, id));
  revalidatePath("/time-expenses");
  return { success: true };
}

export async function createExpense(data: unknown) {
  const session = await auth();
  if (!session?.user || !["admin", "attorney"].includes(session.user.role as string)) {
    return { error: "Unauthorized" };
  }

  const validated = createExpenseSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { date, amount, ...rest } = validated.data;

  const result = await db
    .insert(expenses)
    .values({
      ...rest,
      userId: session.user.id as string,
      date: new Date(date),
      amount: String(amount),
    })
    .returning();

  revalidatePath("/time-expenses");
  return { data: result[0] };
}

export async function createRequisition(data: unknown) {
  const session = await auth();
  if (!session?.user || !["admin", "attorney"].includes(session.user.role as string)) {
    return { error: "Unauthorized" };
  }

  const validated = createRequisitionSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const count = await db.select({ count: sql<number>`count(*)::int` }).from(requisitions);
  const reqNum = `REQ-${new Date().getFullYear()}-${String((count[0]?.count ?? 0) + 1).padStart(4, "0")}`;

  const result = await db
    .insert(requisitions)
    .values({
      requisitionNumber: reqNum,
      requestedBy: session.user.id as string,
      caseId: validated.data.caseId || undefined,
      description: validated.data.description,
      amount: String(validated.data.amount),
      notes: validated.data.justification,
    })
    .returning();

  revalidatePath("/requisitions");
  return { data: result[0] };
}

export async function approveRequisition(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  await db
    .update(requisitions)
    .set({ status: "approved", approvedBy: session.user.id as string, approvedAt: new Date(), updatedAt: new Date() })
    .where(eq(requisitions.id, id));

  revalidatePath("/requisitions");
  return { success: true };
}
