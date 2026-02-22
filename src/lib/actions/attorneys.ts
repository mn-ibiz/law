"use server";

import { db } from "@/lib/db";
import { attorneys, attorneyLicenses, attorneyPracticeAreas } from "@/lib/db/schema/attorneys";
import { auth } from "@/lib/auth/auth";
import { createAuditLog } from "@/lib/utils/audit";
import {
  createAttorneySchema,
  updateAttorneySchema,
  createLicenseSchema,
} from "@/lib/validators/attorney";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createAttorney(data: unknown) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const validated = createAttorneySchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { dateAdmitted, hourlyRate, ...rest } = validated.data;

  const result = await db
    .insert(attorneys)
    .values({
      ...rest,
      hourlyRate: hourlyRate != null ? String(hourlyRate) : undefined,
      dateAdmitted: dateAdmitted ? new Date(dateAdmitted) : undefined,
    })
    .returning();

  await createAuditLog(
    session.user.id as string,
    "create",
    "attorney",
    result[0].id,
    { new: validated.data }
  );

  revalidatePath("/attorneys");
  return { data: result[0] };
}

export async function updateAttorney(id: string, data: unknown) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const validated = updateAttorneySchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { dateAdmitted, hourlyRate, ...rest } = validated.data;

  const result = await db
    .update(attorneys)
    .set({
      ...rest,
      hourlyRate: hourlyRate != null ? String(hourlyRate) : undefined,
      dateAdmitted: dateAdmitted ? new Date(dateAdmitted) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(attorneys.id, id))
    .returning();

  await createAuditLog(
    session.user.id as string,
    "update",
    "attorney",
    id,
    { updated: validated.data }
  );

  revalidatePath("/attorneys");
  revalidatePath(`/attorneys/${id}`);
  return { data: result[0] };
}

export async function deactivateAttorney(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  await db
    .update(attorneys)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(attorneys.id, id));

  await createAuditLog(
    session.user.id as string,
    "update",
    "attorney",
    id,
    { action: "deactivate" }
  );

  revalidatePath("/attorneys");
  revalidatePath(`/attorneys/${id}`);
  return { success: true };
}

export async function addAttorneyLicense(attorneyId: string, data: unknown) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const validated = createLicenseSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { issueDate, expiryDate, ...rest } = validated.data;

  const result = await db
    .insert(attorneyLicenses)
    .values({
      attorneyId,
      ...rest,
      issueDate: new Date(issueDate),
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
    })
    .returning();

  await createAuditLog(
    session.user.id as string,
    "create",
    "attorney_license",
    result[0].id,
    { attorneyId, ...validated.data }
  );

  revalidatePath(`/attorneys/${attorneyId}`);
  return { data: result[0] };
}

export async function linkPracticeAreas(attorneyId: string, practiceAreaIds: string[]) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  // Remove existing and re-insert
  await db
    .delete(attorneyPracticeAreas)
    .where(eq(attorneyPracticeAreas.attorneyId, attorneyId));

  if (practiceAreaIds.length > 0) {
    await db.insert(attorneyPracticeAreas).values(
      practiceAreaIds.map((paId) => ({ attorneyId, practiceAreaId: paId }))
    );
  }

  await createAuditLog(
    session.user.id as string,
    "update",
    "attorney",
    attorneyId,
    { practiceAreas: practiceAreaIds }
  );

  revalidatePath(`/attorneys/${attorneyId}`);
  return { success: true };
}
