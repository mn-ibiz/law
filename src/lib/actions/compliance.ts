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

export async function addPractisingCertificate(attorneyId: string, data: unknown) {
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
    session.user.id as string,
    "create",
    "practising_certificate",
    result[0].id,
    { attorneyId, ...validated.data }
  );

  revalidatePath(`/attorneys/${attorneyId}`);
  return { data: result[0] };
}

export async function addCpdRecord(attorneyId: string, data: unknown) {
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
    session.user.id as string,
    "create",
    "cpd_record",
    result[0].id,
    { attorneyId, ...validated.data }
  );

  revalidatePath(`/attorneys/${attorneyId}`);
  return { data: result[0] };
}

export async function deleteCpdRecord(recordId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  await db.delete(cpdRecords).where(eq(cpdRecords.id, recordId));

  await createAuditLog(
    session.user.id as string,
    "delete",
    "cpd_record",
    recordId,
    {}
  );

  return { success: true };
}
