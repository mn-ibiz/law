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
import { users } from "@/lib/db/schema/auth";
import { getTenantContext } from "@/lib/auth/get-session";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  practiceAreaSchema,
  billingRateSchema,
  firmSettingSchema,
  customFieldSchema,
  tagSchema,
  emailTemplateSchema,
  smsTemplateSchema,
} from "@/lib/validators/settings";
import { safeAction } from "@/lib/utils/safe-action";
import { createAuditLog } from "@/lib/utils/audit";

// --- Practice Areas ---
export async function createPracticeArea(data: unknown) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized" };

    const validated = practiceAreaSchema.safeParse(data);
    if (!validated.success) return { error: validated.error.issues[0].message };

    const result = await db.insert(practiceAreas).values({ ...validated.data, organizationId }).returning();
    revalidatePath("/settings/practice-areas");
    return { data: result[0] };
  });
}

export async function updatePracticeArea(id: string, data: unknown) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized" };

    const validated = practiceAreaSchema.safeParse(data);
    if (!validated.success) return { error: validated.error.issues[0].message };

    await db.update(practiceAreas).set(validated.data).where(and(eq(practiceAreas.id, id), eq(practiceAreas.organizationId, organizationId)));
    revalidatePath("/settings/practice-areas");
    return { success: true };
  });
}

export async function togglePracticeAreaActive(id: string) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized" };

    const existing = await db.select({ isActive: practiceAreas.isActive }).from(practiceAreas).where(and(eq(practiceAreas.id, id), eq(practiceAreas.organizationId, organizationId))).limit(1);
    if (!existing[0]) return { error: "Practice area not found" };

    await db.update(practiceAreas).set({ isActive: !existing[0].isActive }).where(and(eq(practiceAreas.id, id), eq(practiceAreas.organizationId, organizationId)));
    revalidatePath("/settings/practice-areas");
    return { success: true };
  });
}

export async function deletePracticeArea(id: string) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized" };

    await db.delete(practiceAreas).where(and(eq(practiceAreas.id, id), eq(practiceAreas.organizationId, organizationId)));
    revalidatePath("/settings/practice-areas");
    return { success: true };
  });
}

// --- Billing Rates ---
export async function createBillingRate(data: unknown) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized" };

    const validated = billingRateSchema.safeParse(data);
    if (!validated.success) return { error: validated.error.issues[0].message };

    const result = await db
      .insert(billingRates)
      .values({ ...validated.data, organizationId, ratePerHour: String(validated.data.ratePerHour) })
      .returning();
    revalidatePath("/settings");
    return { data: result[0] };
  });
}

// --- Firm Settings ---
export async function upsertFirmSetting(data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized" };

    const validated = firmSettingSchema.safeParse(data);
    if (!validated.success) return { error: validated.error.issues[0].message };

    const existing = await db
      .select()
      .from(firmSettings)
      .where(and(eq(firmSettings.key, validated.data.key), eq(firmSettings.organizationId, organizationId)))
      .limit(1);

    if (existing[0]) {
      await db
        .update(firmSettings)
        .set({
          value: validated.data.value,
          description: validated.data.description,
          updatedBy: userId,
          updatedAt: new Date(),
        })
        .where(and(eq(firmSettings.id, existing[0].id), eq(firmSettings.organizationId, organizationId)));
    } else {
      await db.insert(firmSettings).values({
        ...validated.data,
        organizationId,
        updatedBy: userId,
      });
    }

    revalidatePath("/settings/firm");
    return { success: true };
  });
}

// --- Custom Fields ---
export async function createCustomField(data: unknown) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized" };

    const validated = customFieldSchema.safeParse(data);
    if (!validated.success) return { error: validated.error.issues[0].message };

    const result = await db.insert(customFields).values({ ...validated.data, organizationId }).returning();
    revalidatePath("/settings");
    return { data: result[0] };
  });
}

export async function deleteCustomField(id: string) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized" };

    await db.delete(customFields).where(and(eq(customFields.id, id), eq(customFields.organizationId, organizationId)));
    revalidatePath("/settings");
    return { success: true };
  });
}

// --- Tags ---
export async function createTag(data: unknown) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    const validated = tagSchema.safeParse(data);
    if (!validated.success) return { error: validated.error.issues[0].message };

    const result = await db.insert(tags).values({ ...validated.data, organizationId }).returning();
    revalidatePath("/settings");
    return { data: result[0] };
  });
}

export async function deleteTag(id: string) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized" };

    await db.delete(tags).where(and(eq(tags.id, id), eq(tags.organizationId, organizationId)));
    revalidatePath("/settings");
    return { success: true };
  });
}

// --- Email Templates ---
export async function createEmailTemplate(data: unknown) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized" };

    const validated = emailTemplateSchema.safeParse(data);
    if (!validated.success) return { error: validated.error.issues[0].message };

    const result = await db.insert(emailTemplates).values({ ...validated.data, organizationId }).returning();
    revalidatePath("/settings");
    return { data: result[0] };
  });
}

export async function updateEmailTemplate(id: string, data: unknown) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized" };

    const validated = emailTemplateSchema.safeParse(data);
    if (!validated.success) return { error: validated.error.issues[0].message };

    await db
      .update(emailTemplates)
      .set({ ...validated.data, updatedAt: new Date() })
      .where(and(eq(emailTemplates.id, id), eq(emailTemplates.organizationId, organizationId)));

    revalidatePath("/settings");
    return { success: true };
  });
}

export async function deleteEmailTemplate(id: string) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized" };

    await db.delete(emailTemplates).where(and(eq(emailTemplates.id, id), eq(emailTemplates.organizationId, organizationId)));
    revalidatePath("/settings");
    return { success: true };
  });
}

// --- SMS Templates ---
export async function createSmsTemplate(data: unknown) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized" };

    const validated = smsTemplateSchema.safeParse(data);
    if (!validated.success) return { error: validated.error.issues[0].message };

    const result = await db.insert(smsTemplates).values({ ...validated.data, organizationId }).returning();
    revalidatePath("/settings");
    return { data: result[0] };
  });
}

export async function updateSmsTemplate(id: string, data: unknown) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized" };

    const validated = smsTemplateSchema.safeParse(data);
    if (!validated.success) return { error: validated.error.issues[0].message };

    await db
      .update(smsTemplates)
      .set({ ...validated.data, updatedAt: new Date() })
      .where(and(eq(smsTemplates.id, id), eq(smsTemplates.organizationId, organizationId)));

    revalidatePath("/settings");
    return { success: true };
  });
}

export async function deleteSmsTemplate(id: string) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized" };

    await db.delete(smsTemplates).where(and(eq(smsTemplates.id, id), eq(smsTemplates.organizationId, organizationId)));
    revalidatePath("/settings");
    return { success: true };
  });
}

// --- User Management ---
const changeUserRoleSchema = z.object({
  role: z.enum(["admin", "attorney", "client"]),
});

export async function changeUserRole(targetUserId: string, data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized" };

    const validated = changeUserRoleSchema.safeParse(data);
    if (!validated.success) return { error: validated.error.issues[0].message };

    // Prevent admin from changing their own role
    if (targetUserId === userId) {
      return { error: "Cannot change your own role" };
    }

    await db.update(users).set({ role: validated.data.role, updatedAt: new Date() }).where(and(eq(users.id, targetUserId), eq(users.organizationId, organizationId)));

    await createAuditLog(organizationId, userId, "update", "user", targetUserId, { action: "change_role", newRole: validated.data.role });

    revalidatePath("/settings/users");
    return { success: true };
  });
}

export async function toggleUserActive(targetUserId: string) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized" };

    // Prevent admin from deactivating themselves
    if (targetUserId === userId) {
      return { error: "Cannot deactivate your own account" };
    }

    const existing = await db.select({ isActive: users.isActive }).from(users).where(and(eq(users.id, targetUserId), eq(users.organizationId, organizationId))).limit(1);
    if (!existing[0]) return { error: "User not found" };

    const newStatus = !existing[0].isActive;
    await db.update(users).set({ isActive: newStatus, updatedAt: new Date() }).where(and(eq(users.id, targetUserId), eq(users.organizationId, organizationId)));

    await createAuditLog(organizationId, userId, "update", "user", targetUserId, { action: newStatus ? "activate" : "deactivate" });

    revalidatePath("/settings/users");
    return { success: true };
  });
}
