"use server";

import { db } from "@/lib/db";
import {
  practiceAreas,
  billingRates,
  firmSettings,
  customFields,
  tags,
  emailTemplates,
  smsTemplates,
} from "@/lib/db/schema/settings";
import { auth } from "@/lib/auth/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  practiceAreaSchema,
  billingRateSchema,
  firmSettingSchema,
  customFieldSchema,
  tagSchema,
  emailTemplateSchema,
  smsTemplateSchema,
} from "@/lib/validators/settings";

// --- Practice Areas ---
export async function createPracticeArea(data: unknown) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return { error: "Unauthorized" };

  const validated = practiceAreaSchema.safeParse(data);
  if (!validated.success) return { error: validated.error.issues[0].message };

  const result = await db.insert(practiceAreas).values(validated.data).returning();
  revalidatePath("/settings/practice-areas");
  return { data: result[0] };
}

export async function deletePracticeArea(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return { error: "Unauthorized" };

  await db.delete(practiceAreas).where(eq(practiceAreas.id, id));
  revalidatePath("/settings/practice-areas");
  return { success: true };
}

// --- Billing Rates ---
export async function createBillingRate(data: unknown) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return { error: "Unauthorized" };

  const validated = billingRateSchema.safeParse(data);
  if (!validated.success) return { error: validated.error.issues[0].message };

  const result = await db
    .insert(billingRates)
    .values({ ...validated.data, ratePerHour: String(validated.data.ratePerHour) })
    .returning();
  revalidatePath("/settings");
  return { data: result[0] };
}

// --- Firm Settings ---
export async function upsertFirmSetting(data: unknown) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return { error: "Unauthorized" };

  const validated = firmSettingSchema.safeParse(data);
  if (!validated.success) return { error: validated.error.issues[0].message };

  const existing = await db
    .select()
    .from(firmSettings)
    .where(eq(firmSettings.key, validated.data.key))
    .limit(1);

  if (existing[0]) {
    await db
      .update(firmSettings)
      .set({
        value: validated.data.value,
        description: validated.data.description,
        updatedBy: session.user.id as string,
        updatedAt: new Date(),
      })
      .where(eq(firmSettings.id, existing[0].id));
  } else {
    await db.insert(firmSettings).values({
      ...validated.data,
      updatedBy: session.user.id as string,
    });
  }

  revalidatePath("/settings/firm");
  return { success: true };
}

// --- Custom Fields ---
export async function createCustomField(data: unknown) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return { error: "Unauthorized" };

  const validated = customFieldSchema.safeParse(data);
  if (!validated.success) return { error: validated.error.issues[0].message };

  const result = await db.insert(customFields).values(validated.data).returning();
  revalidatePath("/settings");
  return { data: result[0] };
}

export async function deleteCustomField(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return { error: "Unauthorized" };

  await db.delete(customFields).where(eq(customFields.id, id));
  revalidatePath("/settings");
  return { success: true };
}

// --- Tags ---
export async function createTag(data: unknown) {
  const session = await auth();
  if (!session?.user || !["admin", "attorney"].includes(session.user.role as string)) {
    return { error: "Unauthorized" };
  }

  const validated = tagSchema.safeParse(data);
  if (!validated.success) return { error: validated.error.issues[0].message };

  const result = await db.insert(tags).values(validated.data).returning();
  revalidatePath("/settings");
  return { data: result[0] };
}

export async function deleteTag(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return { error: "Unauthorized" };

  await db.delete(tags).where(eq(tags.id, id));
  revalidatePath("/settings");
  return { success: true };
}

// --- Email Templates ---
export async function createEmailTemplate(data: unknown) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return { error: "Unauthorized" };

  const validated = emailTemplateSchema.safeParse(data);
  if (!validated.success) return { error: validated.error.issues[0].message };

  const result = await db.insert(emailTemplates).values(validated.data).returning();
  revalidatePath("/settings");
  return { data: result[0] };
}

export async function updateEmailTemplate(id: string, data: unknown) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return { error: "Unauthorized" };

  const validated = emailTemplateSchema.safeParse(data);
  if (!validated.success) return { error: validated.error.issues[0].message };

  await db
    .update(emailTemplates)
    .set({ ...validated.data, updatedAt: new Date() })
    .where(eq(emailTemplates.id, id));

  revalidatePath("/settings");
  return { success: true };
}

export async function deleteEmailTemplate(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return { error: "Unauthorized" };

  await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
  revalidatePath("/settings");
  return { success: true };
}

// --- SMS Templates ---
export async function createSmsTemplate(data: unknown) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return { error: "Unauthorized" };

  const validated = smsTemplateSchema.safeParse(data);
  if (!validated.success) return { error: validated.error.issues[0].message };

  const result = await db.insert(smsTemplates).values(validated.data).returning();
  revalidatePath("/settings");
  return { data: result[0] };
}

export async function updateSmsTemplate(id: string, data: unknown) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return { error: "Unauthorized" };

  const validated = smsTemplateSchema.safeParse(data);
  if (!validated.success) return { error: validated.error.issues[0].message };

  await db
    .update(smsTemplates)
    .set({ ...validated.data, updatedAt: new Date() })
    .where(eq(smsTemplates.id, id));

  revalidatePath("/settings");
  return { success: true };
}

export async function deleteSmsTemplate(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return { error: "Unauthorized" };

  await db.delete(smsTemplates).where(eq(smsTemplates.id, id));
  revalidatePath("/settings");
  return { success: true };
}
