"use server";

import { db } from "@/lib/db";
import { practisingCertificates, cpdRecords } from "@/lib/db/schema/attorneys";
import { auth } from "@/lib/auth/auth";
import { createAuditLog } from "@/lib/utils/audit";
import {
  createCertificateSchema,
  createCpdRecordSchema,
} from "@/lib/validators/compliance";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { safeAction } from "@/lib/utils/safe-action";

export async function addPractisingCertificate(attorneyId: string, data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return { error: "Unauthorized" };
    }

    const validated = createCertificateSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { issueDate, expiryDate, year, ...rest } = validated.data;

    const result = await db
      .insert(practisingCertificates)
      .values({
        attorneyId,
        ...rest,
        year: String(year),
        issueDate: new Date(issueDate),
        expiryDate: new Date(expiryDate),
        status: validated.data.status,
      })
      .returning();

    await createAuditLog(
      session.user.id,
      "create",
      "practising_certificate",
      result[0].id,
      { attorneyId, ...validated.data }
    );

    revalidatePath(`/attorneys/${attorneyId}`);
    return { data: result[0] };
  });
}

export async function addCpdRecord(attorneyId: string, data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return { error: "Unauthorized" };
    }

    const validated = createCpdRecordSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { date, unitsEarned, eventName, ...rest } = validated.data;
    const completionDate = new Date(date);
    const year = completionDate.getFullYear();

    const result = await db
      .insert(cpdRecords)
      .values({
        attorneyId,
        title: eventName,
        provider: rest.provider,
        units: String(unitsEarned),
        completionDate,
        isLskProgram: rest.isLskProgram,
        year: String(year),
      })
      .returning();

    await createAuditLog(
      session.user.id,
      "create",
      "cpd_record",
      result[0].id,
      { attorneyId, ...validated.data }
    );

    revalidatePath(`/attorneys/${attorneyId}`);
    return { data: result[0] };
  });
}

export async function deleteCpdRecord(recordId: string) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return { error: "Unauthorized" };
    }

    await db.delete(cpdRecords).where(eq(cpdRecords.id, recordId));

    await createAuditLog(
      session.user.id,
      "delete",
      "cpd_record",
      recordId,
      {}
    );

    revalidatePath("/attorneys");
    return { success: true };
  });
}
