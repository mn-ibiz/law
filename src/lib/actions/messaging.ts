"use server";

import { db } from "@/lib/db";
import { messages, notifications } from "@/lib/db/schema/messaging";
import { auth } from "@/lib/auth/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function sendMessage(data: { receiverId: string; subject: string; body: string; caseId?: string }) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const result = await db
    .insert(messages)
    .values({
      senderId: session.user.id as string,
      recipientId: data.receiverId,
      subject: data.subject,
      body: data.body,
      caseId: data.caseId || undefined,
    })
    .returning();

  // Create notification for receiver
  await db.insert(notifications).values({
    userId: data.receiverId,
    type: "info",
    title: "New Message",
    message: `New message from ${session.user.name}: ${data.subject}`,
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
      .set({ readAt: new Date() })
      .where(eq(notifications.id, id));
  }

  revalidatePath("/notifications");
  return { success: true };
}
