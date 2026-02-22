"use server";

import { db } from "@/lib/db";
import { disciplinaryRecords } from "@/lib/db/schema/attorneys";
import { auth } from "@/lib/auth/auth";
import { createAuditLog } from "@/lib/utils/audit";
import {
  createDisciplinaryRecordSchema,
  updateDisciplinaryRecordSchema,
} from "@/lib/validators/disciplinary";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addDisciplinaryRecord(attorneyId: string, data: unknown) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const validated = createDisciplinaryRecordSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const result = await db
    .insert(disciplinaryRecords)
    .values({
      attorneyId,
      date: new Date(validated.data.date),
      caseReference: validated.data.caseReference,
      status: validated.data.status,
      outcome: validated.data.outcome,
      notes: validated.data.notes,
      createdBy: session.user.id as string,
    })
    .returning();

  await createAuditLog(
    session.user.id as string,
    "create",
    "disciplinary_record",
    result[0].id,
    { attorneyId, ...validated.data }
  );

  revalidatePath(`/attorneys/${attorneyId}`);
  return { data: result[0] };
}

export async function updateDisciplinaryRecord(recordId: string, data: unknown) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const validated = updateDisciplinaryRecordSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (validated.data.date) updateData.date = new Date(validated.data.date);
  if (validated.data.caseReference) updateData.caseReference = validated.data.caseReference;
  if (validated.data.status) updateData.status = validated.data.status;
  if (validated.data.outcome !== undefined) updateData.outcome = validated.data.outcome;
  if (validated.data.notes !== undefined) updateData.notes = validated.data.notes;

  await db
    .update(disciplinaryRecords)
    .set(updateData)
    .where(eq(disciplinaryRecords.id, recordId));

  await createAuditLog(
    session.user.id as string,
    "update",
    "disciplinary_record",
    recordId,
    validated.data
  );

  return { success: true };
}
