"use server";

import { db } from "@/lib/db";
import { messages, notifications } from "@/lib/db/schema/messaging";
import { auth } from "@/lib/auth/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendMessageSchema } from "@/lib/validators/messaging";

export async function sendMessage(data: unknown) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const validated = sendMessageSchema.safeParse(data);
  if (!validated.success) return { error: validated.error.issues[0].message };

  const result = await db
    .insert(messages)
    .values({
      senderId: session.user.id as string,
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
}

export async function markNotificationsRead(notificationIds: string[]) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  for (const id of notificationIds) {
    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(notifications.id, id));
  }

  revalidatePath("/notifications");
  return { success: true };
}
