"use server";

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
    return { data: result[0] };
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
