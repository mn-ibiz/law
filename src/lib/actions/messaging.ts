"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { messages, notifications } from "@/lib/db/schema/messaging";
import { getTenantContext } from "@/lib/auth/get-session";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendMessageSchema } from "@/lib/validators/messaging";
import { safeAction } from "@/lib/utils/safe-action";

export async function sendMessage(data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId, session } = await getTenantContext();

    const validated = sendMessageSchema.safeParse(data);
    if (!validated.success) return { error: validated.error.issues[0].message };

    const result = await db
      .insert(messages)
      .values({
        organizationId,
        senderId: userId,
        recipientId: validated.data.receiverId,
        subject: validated.data.subject,
        body: validated.data.body,
        caseId: validated.data.caseId || undefined,
        attachmentUrl: validated.data.attachmentUrl || null,
        attachmentName: validated.data.attachmentName || null,
      })
      .returning();

    // Create notification for receiver
    await db.insert(notifications).values({
      organizationId,
      userId: validated.data.receiverId,
      type: "info",
      title: "New Message",
      message: `New message from ${session.user.name}: ${validated.data.subject}`,
    });

    revalidatePath("/messages");
    return { data: (result as Record<string, unknown>[])[0] };
  });
}

export async function deleteMessage(id: string) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();

    const idParsed = z.string().uuid().safeParse(id);
    if (!idParsed.success) return { error: "Invalid message ID" };

    // Only allow sender to delete their own messages
    const msg = await db.select({ senderId: messages.senderId }).from(messages).where(and(eq(messages.id, idParsed.data), eq(messages.organizationId, organizationId))).limit(1);
    if (!msg[0]) return { error: "Not found" };
    if (msg[0].senderId !== userId && role !== "admin") {
      return { error: "Unauthorized" };
    }

    await db.delete(messages).where(and(eq(messages.id, idParsed.data), eq(messages.organizationId, organizationId)));
    revalidatePath("/messages");
    return { success: true };
  });
}

export async function markMessageRead(id: string) {
  return safeAction(async () => {
    const { organizationId, userId } = await getTenantContext();

    const idParsed = z.string().uuid().safeParse(id);
    if (!idParsed.success) return { error: "Invalid message ID" };

    await db
      .update(messages)
      .set({ status: "read", readAt: new Date() })
      .where(and(eq(messages.id, idParsed.data), eq(messages.recipientId, userId), eq(messages.organizationId, organizationId)));

    revalidatePath("/messages");
    revalidatePath("/notifications");
    return { success: true };
  });
}

export async function markNotificationsRead(notificationIds: string[]) {
  return safeAction(async () => {
    const { organizationId, userId } = await getTenantContext();

    // Validate input
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return { error: "No notification IDs provided" };
    }
    if (notificationIds.length > 100) {
      return { error: "Too many notification IDs" };
    }

    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(and(inArray(notifications.id, notificationIds), eq(notifications.userId, userId), eq(notifications.organizationId, organizationId)));

    revalidatePath("/notifications");
    return { success: true };
  });
}
