"use server";

import { db } from "@/lib/db";
import { timeEntries, expenses, requisitions } from "@/lib/db/schema/time-expenses";
import { auth } from "@/lib/auth/auth";
import { createTimeEntrySchema, createExpenseSchema, createRequisitionSchema } from "@/lib/validators/time-expense";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { safeAction } from "@/lib/utils/safe-action";
import { validateId } from "@/lib/utils/validate-id";
import { withUniqueRetry } from "@/lib/utils/with-retry";

export async function createTimeEntry(data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
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
        userId: session.user.id,
        date: new Date(date),
        hours: String(hours),
        rate: String(rate),
        amount: String(amount),
      })
      .returning();

    revalidatePath("/time-expenses");
    return { data: result[0] };
  });
}

export async function deleteTimeEntry(id: string) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    if (!validateId(id)) return { error: "Invalid ID" };

    // Only delete own entries or admin
    const entry = await db.select({ userId: timeEntries.userId, isBilled: timeEntries.isBilled }).from(timeEntries).where(eq(timeEntries.id, id)).limit(1);
    if (!entry[0]) return { error: "Not found" };
    if (entry[0].userId !== session.user.id && session.user.role !== "admin") {
      return { error: "Unauthorized" };
    }

    // Prevent deletion of billed entries
    if (entry[0].isBilled) {
      return { error: "Cannot delete a billed time entry" };
    }

    await db.delete(timeEntries).where(eq(timeEntries.id, id));
    revalidatePath("/time-expenses");
    return { success: true };
  });
}

export async function createExpense(data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
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
        userId: session.user.id,
        date: new Date(date),
        amount: String(amount),
      })
      .returning();

    revalidatePath("/time-expenses");
    return { data: result[0] };
  });
}

export async function createRequisition(data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
      return { error: "Unauthorized" };
    }

    const validated = createRequisitionSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    // Retry on unique constraint violation (concurrent number generation race)
    const result = await withUniqueRetry(async () => {
      const reqYear = new Date().getFullYear();
      const reqPrefix = `REQ-${reqYear}-`;
      const [reqResult] = await db
        .select({ maxNum: sql<string>`MAX(${requisitions.requisitionNumber})` })
        .from(requisitions)
        .where(sql`${requisitions.requisitionNumber} LIKE ${reqPrefix + '%'}`);
      let reqNext = 1;
      if (reqResult?.maxNum) {
        const parts = reqResult.maxNum.split("-");
        const lastNum = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastNum)) reqNext = lastNum + 1;
      }
      const reqNum = `${reqPrefix}${String(reqNext).padStart(4, "0")}`;

      return await db
        .insert(requisitions)
        .values({
          requisitionNumber: reqNum,
          requestedBy: session.user.id,
          caseId: validated.data.caseId || undefined,
          description: validated.data.description,
          amount: String(validated.data.amount),
          notes: validated.data.justification,
        })
        .returning();
    });

    revalidatePath("/requisitions");
    return { data: result[0] };
  });
}

export async function approveRequisition(id: string) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return { error: "Unauthorized" };
    }

    if (!validateId(id)) return { error: "Invalid ID" };

    // Atomic conditional update — prevents TOCTOU race
    const result = await db
      .update(requisitions)
      .set({ status: "approved", approvedBy: session.user.id, approvedAt: new Date(), updatedAt: new Date() })
      .where(sql`${requisitions.id} = ${id} AND ${requisitions.status} = 'pending_approval'`)
      .returning({ id: requisitions.id });

    if (result.length === 0) {
      return { error: "Requisition not found or not in pending_approval status" };
    }

    revalidatePath("/requisitions");
    return { success: true };
  });
}
