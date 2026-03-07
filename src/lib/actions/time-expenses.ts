"use server";

import { db } from "@/lib/db";
import { timeEntries, expenses, requisitions } from "@/lib/db/schema/time-expenses";
import { cases } from "@/lib/db/schema/cases";
import { getTenantContext } from "@/lib/auth/get-session";
import { createTimeEntrySchema, createExpenseSchema, createRequisitionSchema, updateRequisitionSchema, batchTimeEntrySchema, updateTimeEntrySchema, updateExpenseSchema } from "@/lib/validators/time-expense";
import { attorneys } from "@/lib/db/schema/attorneys";
import { and, eq, sql, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { safeAction } from "@/lib/utils/safe-action";
import { validateId } from "@/lib/utils/validate-id";
import { withUniqueRetry } from "@/lib/utils/with-retry";
import { createAuditLog } from "@/lib/utils/audit";

export async function createTimeEntry(data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId } = await getTenantContext();

    const validated = createTimeEntrySchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { date, hours, hourlyRate, ...rest } = validated.data;
    const rate = hourlyRate ?? 0;
    const amount = Math.round(hours * rate * 100) / 100;

    const result = await db
      .insert(timeEntries)
      .values({
        ...rest,
        organizationId,
        userId,
        date: new Date(date),
        hours: String(hours),
        rate: String(rate),
        amount: amount.toFixed(2),
      })
      .returning();

    revalidatePath("/time-expenses");
    return { data: result[0] };
  });
}

export async function deleteTimeEntry(id: string) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();

    if (!validateId(id)) return { error: "Invalid ID" };

    // Only delete own entries or admin
    const entry = await db.select({ userId: timeEntries.userId, isBilled: timeEntries.isBilled }).from(timeEntries).where(and(eq(timeEntries.id, id), eq(timeEntries.organizationId, organizationId))).limit(1);
    if (!entry[0]) return { error: "Not found" };
    if (entry[0].userId !== userId && role !== "admin") {
      return { error: "Unauthorized" };
    }

    // Prevent deletion of billed entries
    if (entry[0].isBilled) {
      return { error: "Cannot delete a billed time entry" };
    }

    await db.delete(timeEntries).where(and(eq(timeEntries.id, id), eq(timeEntries.organizationId, organizationId)));
    revalidatePath("/time-expenses");
    return { success: true };
  });
}

export async function createExpense(data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId } = await getTenantContext();

    const validated = createExpenseSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { date, amount, receiptUrl, ...rest } = validated.data;

    const result = await db
      .insert(expenses)
      .values({
        ...rest,
        organizationId,
        userId,
        date: new Date(date),
        amount: String(amount),
        receiptUrl: receiptUrl ?? null,
      })
      .returning();

    revalidatePath("/time-expenses");
    return { data: result[0] };
  });
}

export async function createRequisition(data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId } = await getTenantContext();

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
        .where(sql`${requisitions.organizationId} = ${organizationId} AND ${requisitions.requisitionNumber} LIKE ${reqPrefix + '%'}`);
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
          organizationId,
          requisitionNumber: reqNum,
          requestedBy: userId,
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

export async function deleteExpense(id: string) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();

    if (!validateId(id)) return { error: "Invalid ID" };

    const entry = await db.select({ userId: expenses.userId }).from(expenses).where(and(eq(expenses.id, id), eq(expenses.organizationId, organizationId))).limit(1);
    if (!entry[0]) return { error: "Not found" };
    if (entry[0].userId !== userId && role !== "admin") {
      return { error: "Unauthorized" };
    }

    await db.delete(expenses).where(and(eq(expenses.id, id), eq(expenses.organizationId, organizationId)));
    revalidatePath("/time-expenses");
    return { success: true };
  });
}

export async function deleteRequisition(id: string) {
  return safeAction(async () => {
    const { organizationId } = await getTenantContext();

    if (!validateId(id)) return { error: "Invalid ID" };

    // Only allow deletion of draft requisitions
    const result = await db
      .delete(requisitions)
      .where(sql`${requisitions.id} = ${id} AND ${requisitions.organizationId} = ${organizationId} AND ${requisitions.status} = 'draft'`)
      .returning({ id: requisitions.id });

    if (result.length === 0) {
      return { error: "Requisition not found or cannot be deleted (not in draft status)" };
    }

    revalidatePath("/requisitions");
    return { success: true };
  });
}

export async function updateRequisition(id: string, data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId } = await getTenantContext();

    if (!validateId(id)) return { error: "Invalid ID" };

    const validated = updateRequisitionSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    // Only allow editing draft requisitions — atomic conditional update
    const result = await db
      .update(requisitions)
      .set({
        caseId: validated.data.caseId || null,
        description: validated.data.description,
        amount: String(validated.data.amount),
        notes: validated.data.justification || null,
        updatedAt: new Date(),
      })
      .where(sql`${requisitions.id} = ${id} AND ${requisitions.organizationId} = ${organizationId} AND ${requisitions.status} = 'draft'`)
      .returning({ id: requisitions.id });

    if (result.length === 0) {
      return { error: "Requisition not found or cannot be edited (not in draft status)" };
    }

    await createAuditLog(organizationId, userId, "update", "requisition", id, validated.data);

    revalidatePath("/requisitions");
    return { success: true };
  });
}

export async function rejectRequisition(id: string) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized" };

    if (!validateId(id)) return { error: "Invalid ID" };

    const result = await db
      .update(requisitions)
      .set({ status: "rejected", approvedBy: userId, approvedAt: new Date(), updatedAt: new Date() })
      .where(sql`${requisitions.id} = ${id} AND ${requisitions.organizationId} = ${organizationId} AND ${requisitions.status} = 'pending_approval'`)
      .returning({ id: requisitions.id });

    if (result.length === 0) {
      return { error: "Requisition not found or not in pending_approval status" };
    }

    await createAuditLog(organizationId, userId, "update", "requisition", id, { action: "reject" });

    revalidatePath("/requisitions");
    return { success: true };
  });
}

export async function submitRequisition(id: string) {
  return safeAction(async () => {
    const { organizationId } = await getTenantContext();

    if (!validateId(id)) return { error: "Invalid ID" };

    const result = await db
      .update(requisitions)
      .set({ status: "pending_approval", updatedAt: new Date() })
      .where(sql`${requisitions.id} = ${id} AND ${requisitions.organizationId} = ${organizationId} AND ${requisitions.status} = 'draft'`)
      .returning({ id: requisitions.id });

    if (result.length === 0) {
      return { error: "Requisition not found or not in draft status" };
    }

    revalidatePath("/requisitions");
    return { success: true };
  });
}

export async function approveRequisition(id: string) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized" };

    if (!validateId(id)) return { error: "Invalid ID" };

    // Atomic conditional update — prevents TOCTOU race
    const result = await db
      .update(requisitions)
      .set({ status: "approved", approvedBy: userId, approvedAt: new Date(), updatedAt: new Date() })
      .where(sql`${requisitions.id} = ${id} AND ${requisitions.organizationId} = ${organizationId} AND ${requisitions.status} = 'pending_approval'`)
      .returning({ id: requisitions.id });

    if (result.length === 0) {
      return { error: "Requisition not found or not in pending_approval status" };
    }

    await createAuditLog(organizationId, userId, "update", "requisition", id, { action: "approve" });

    revalidatePath("/requisitions");
    return { success: true };
  });
}

export async function updateTimeEntry(data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();

    const validated = updateTimeEntrySchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { id, date, hours, hourlyRate, ...rest } = validated.data;

    if (!validateId(id)) return { error: "Invalid ID" };

    // Check ownership and billed status atomically
    const entry = await db
      .select({ userId: timeEntries.userId, isBilled: timeEntries.isBilled })
      .from(timeEntries)
      .where(and(eq(timeEntries.id, id), eq(timeEntries.organizationId, organizationId)))
      .limit(1);

    if (!entry[0]) return { error: "Not found" };
    if (entry[0].userId !== userId && role !== "admin") {
      return { error: "Unauthorized" };
    }
    if (entry[0].isBilled) {
      return { error: "Cannot edit a billed time entry" };
    }

    const rate = hourlyRate ?? 0;
    const amount = Math.round(hours * rate * 100) / 100;

    const result = await db
      .update(timeEntries)
      .set({
        ...rest,
        date: new Date(date),
        hours: String(hours),
        rate: String(rate),
        amount: amount.toFixed(2),
        updatedAt: new Date(),
      })
      .where(and(eq(timeEntries.id, id), eq(timeEntries.organizationId, organizationId)))
      .returning();

    revalidatePath("/time-expenses");
    return { data: result[0] };
  });
}

export async function updateExpense(data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();

    const validated = updateExpenseSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { id, date, amount, receiptUrl, ...rest } = validated.data;

    if (!validateId(id)) return { error: "Invalid ID" };

    const entry = await db
      .select({ userId: expenses.userId, isBilled: expenses.isBilled })
      .from(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.organizationId, organizationId)))
      .limit(1);

    if (!entry[0]) return { error: "Not found" };
    if (entry[0].userId !== userId && role !== "admin") {
      return { error: "Unauthorized" };
    }
    if (entry[0].isBilled) {
      return { error: "Cannot edit a billed expense" };
    }

    const result = await db
      .update(expenses)
      .set({
        ...rest,
        date: new Date(date),
        amount: String(amount),
        receiptUrl: receiptUrl ?? null,
        updatedAt: new Date(),
      })
      .where(and(eq(expenses.id, id), eq(expenses.organizationId, organizationId)))
      .returning();

    revalidatePath("/time-expenses");
    return { data: result[0] };
  });
}

export async function createBatchTimeEntries(data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId } = await getTenantContext();

    const validated = batchTimeEntrySchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    // Filter out zero-hour entries
    const nonZero = validated.data.entries.filter((e) => e.hours > 0);
    if (nonZero.length === 0) {
      return { error: "No entries with hours > 0" };
    }

    // Look up attorney hourly rate for the user
    const [attorney] = await db
      .select({ hourlyRate: attorneys.hourlyRate })
      .from(attorneys)
      .where(and(eq(attorneys.userId, userId), eq(attorneys.organizationId, organizationId)))
      .limit(1);
    const rate = attorney?.hourlyRate ?? "0";

    const values = nonZero.map((entry) => ({
      organizationId,
      caseId: entry.caseId,
      userId,
      description: entry.description ?? "Time entry",
      date: new Date(entry.date),
      hours: String(entry.hours),
      rate: rate,
      amount: (Math.round(Number(entry.hours) * Number(rate) * 100) / 100).toFixed(2),
      isBillable: entry.isBillable ?? true,
    }));

    const result = await db.insert(timeEntries).values(values).returning();

    revalidatePath("/time-expenses");
    revalidatePath("/time-expenses/weekly");
    return { data: result, count: result.length };
  });
}

/** Server action to fetch case options for client-side dropdowns */
export async function fetchCaseOptions() {
  const { organizationId } = await getTenantContext();
  return db
    .select({
      id: cases.id,
      caseNumber: cases.caseNumber,
      title: cases.title,
    })
    .from(cases)
    .where(eq(cases.organizationId, organizationId))
    .orderBy(desc(cases.createdAt));
}
