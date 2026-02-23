"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { messages, notifications } from "@/lib/db/schema/messaging";
import { auth } from "@/lib/auth/auth";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendMessageSchema } from "@/lib/validators/messaging";
import { safeAction } from "@/lib/utils/safe-action";

export async function sendMessage(data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    const validated = sendMessageSchema.safeParse(data);
    if (!validated.success) return { error: validated.error.issues[0].message };

    const result = await db
      .insert(messages)
      .values({
        senderId: session.user.id,
        recipientId: validated.data.receiverId,
        subject: validated.data.subject,
        body: validated.data.body,
        caseId: validated.data.caseId || undefined,
      })
      .returning();

    // Create notification for receiver
    await db.insert(notifications).values({
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
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    const idParsed = z.string().uuid().safeParse(id);
    if (!idParsed.success) return { error: "Invalid message ID" };

    // Only allow sender to delete their own messages
    const msg = await db.select({ senderId: messages.senderId }).from(messages).where(eq(messages.id, idParsed.data)).limit(1);
    if (!msg[0]) return { error: "Not found" };
    if (msg[0].senderId !== session.user.id && session.user.role !== "admin") {
      return { error: "Unauthorized" };
    }

    await db.delete(messages).where(eq(messages.id, idParsed.data));
    revalidatePath("/messages");
    return { success: true };
  });
}

export async function markMessageRead(id: string) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    const idParsed = z.string().uuid().safeParse(id);
    if (!idParsed.success) return { error: "Invalid message ID" };

    await db
      .update(messages)
      .set({ status: "read", readAt: new Date() })
      .where(and(eq(messages.id, idParsed.data), eq(messages.recipientId, session.user.id)));

    revalidatePath("/messages");
    revalidatePath("/notifications");
    return { success: true };
  });
}

export async function markNotificationsRead(notificationIds: string[]) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

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
      .where(and(inArray(notifications.id, notificationIds), eq(notifications.userId, session.user.id)));

    revalidatePath("/notifications");
    return { success: true };
  });
}
