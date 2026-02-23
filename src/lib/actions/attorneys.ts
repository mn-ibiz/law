"use server";

import { db } from "@/lib/db";
import { attorneys, attorneyLicenses, attorneyPracticeAreas, professionalIndemnity, lskMembership } from "@/lib/db/schema/attorneys";
import { auth } from "@/lib/auth/auth";
import { createAuditLog } from "@/lib/utils/audit";
import {
  createAttorneySchema,
  updateAttorneySchema,
  createLicenseSchema,
  createProfessionalIndemnitySchema,
  createLskMembershipSchema,
} from "@/lib/validators/attorney";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { safeAction } from "@/lib/utils/safe-action";
import { validateId } from "@/lib/utils/validate-id";
import { z } from "zod";

export async function createAttorney(data: unknown) {
  return safeAction(async () => {
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
      session.user.id,
      "create",
      "attorney",
      result[0].id,
      { new: validated.data }
    );

    revalidatePath("/attorneys");
    return { data: result[0] };
  });
}

export async function updateAttorney(id: string, data: unknown) {
  return safeAction(async () => {
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
      session.user.id,
      "update",
      "attorney",
      id,
      { updated: validated.data }
    );

    revalidatePath("/attorneys");
    revalidatePath(`/attorneys/${id}`);
    return { data: result[0] };
  });
}

export async function deactivateAttorney(id: string) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return { error: "Unauthorized" };
    }

    if (!validateId(id)) return { error: "Invalid ID" };

    await db
      .update(attorneys)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(attorneys.id, id));

    await createAuditLog(
      session.user.id,
      "update",
      "attorney",
      id,
      { action: "deactivate" }
    );

    revalidatePath("/attorneys");
    revalidatePath(`/attorneys/${id}`);
    return { success: true };
  });
}

export async function addAttorneyLicense(attorneyId: string, data: unknown) {
  return safeAction(async () => {
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
      session.user.id,
      "create",
      "attorney_license",
      result[0].id,
      { attorneyId, ...validated.data }
    );

    revalidatePath(`/attorneys/${attorneyId}`);
    return { data: result[0] };
  });
}

export async function linkPracticeAreas(attorneyId: string, practiceAreaIds: string[]) {
  return safeAction(async () => {
    const schema = z.object({
      attorneyId: z.string().uuid(),
      practiceAreaIds: z.array(z.string().uuid()).max(50),
    });
    const parsed = schema.safeParse({ attorneyId, practiceAreaIds });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return { error: "Unauthorized" };
    }

    const validAttorneyId = parsed.data.attorneyId;
    const validPracticeAreaIds = parsed.data.practiceAreaIds;

    // Insert new links first (ignore duplicates), then remove stale ones.
    // This order is safer without transactions: if the insert fails, old links remain intact.
    if (validPracticeAreaIds.length > 0) {
      await db
        .insert(attorneyPracticeAreas)
        .values(validPracticeAreaIds.map((paId) => ({ attorneyId: validAttorneyId, practiceAreaId: paId })))
        .onConflictDoNothing();
    }

    // Remove links not in the new set
    await db.delete(attorneyPracticeAreas).where(
      and(
        eq(attorneyPracticeAreas.attorneyId, validAttorneyId),
        validPracticeAreaIds.length > 0
          ? sql`${attorneyPracticeAreas.practiceAreaId} NOT IN (${sql.join(validPracticeAreaIds.map((id) => sql`${id}`), sql`, `)})`
          : sql`1=1`
      )
    );

    await createAuditLog(
      session.user.id,
      "update",
      "attorney",
      validAttorneyId,
      { practiceAreas: validPracticeAreaIds }
    );

    revalidatePath(`/attorneys/${validAttorneyId}`);
    return { success: true };
  });
}

export async function addProfessionalIndemnity(attorneyId: string, data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return { error: "Unauthorized" };
    }

    const validated = createProfessionalIndemnitySchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { startDate, expiryDate, coverageAmount, premium, ...rest } = validated.data;

    const result = await db
      .insert(professionalIndemnity)
      .values({
        attorneyId,
        ...rest,
        coverageAmount: String(coverageAmount),
        premium: premium != null ? String(premium) : undefined,
        startDate: new Date(startDate),
        expiryDate: new Date(expiryDate),
      })
      .returning();

    revalidatePath(`/attorneys/${attorneyId}`);
    return { data: result[0] };
  });
}

export async function addLskMembership(attorneyId: string, data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return { error: "Unauthorized" };
    }

    const validated = createLskMembershipSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { paymentDate, amount, ...rest } = validated.data;

    const result = await db
      .insert(lskMembership)
      .values({
        attorneyId,
        ...rest,
        amount: String(amount),
        paymentDate: paymentDate ? new Date(paymentDate) : undefined,
      })
      .returning();

    revalidatePath(`/attorneys/${attorneyId}`);
    return { data: result[0] };
  });
}
