"use server";

import bcrypt from "bcryptjs";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getTenantContext } from "@/lib/auth/get-session";
import { safeAction } from "@/lib/utils/safe-action";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be at most 128 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function changePassword(data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId } = await getTenantContext();

    const validated = changePasswordSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { currentPassword, newPassword } = validated.data;

    const [user] = await db
      .select({ password: users.password })
      .from(users)
      .where(and(eq(users.id, userId), eq(users.organizationId, organizationId)))
      .limit(1);

    if (!user) {
      return { error: "User not found" };
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return { error: "Current password is incorrect" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(and(eq(users.id, userId), eq(users.organizationId, organizationId)));

    return { success: true };
  });
}

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  phone: z.string().max(20).optional().or(z.literal("")),
  avatar: z.string().url().optional().or(z.literal("")).or(z.null()),
});

export async function updateProfile(data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId } = await getTenantContext();

    const validated = updateProfileSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    await db
      .update(users)
      .set({
        name: validated.data.name,
        phone: validated.data.phone || null,
        avatar: validated.data.avatar || null,
        updatedAt: new Date(),
      })
      .where(and(eq(users.id, userId), eq(users.organizationId, organizationId)));

    revalidatePath("/profile");
    return { success: true };
  });
}
