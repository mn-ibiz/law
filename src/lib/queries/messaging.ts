import { db } from "@/lib/db";
import { messages, notifications } from "@/lib/db/schema/messaging";
import { users } from "@/lib/db/schema/auth";
import { eq, desc, and, sql } from "drizzle-orm";

export async function getMessages(userId: string) {
  return db
    .select({
      id: messages.id,
      subject: messages.subject,
      body: messages.body,
      status: messages.status,
      createdAt: messages.createdAt,
      senderName: users.name,
      senderId: messages.senderId,
    })
    .from(messages)
    .innerJoin(users, eq(messages.senderId, users.id))
    .where(eq(messages.recipientId, userId))
    .orderBy(desc(messages.createdAt))
    .limit(200);
}

export async function getSentMessages(userId: string) {
  return db
    .select({
      id: messages.id,
      subject: messages.subject,
      body: messages.body,
      status: messages.status,
      createdAt: messages.createdAt,
      receiverName: users.name,
    })
    .from(messages)
    .innerJoin(users, eq(messages.recipientId, users.id))
    .where(eq(messages.senderId, userId))
    .orderBy(desc(messages.createdAt))
    .limit(200);
}

export async function getNotifications(userId: string) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return result?.count ?? 0;
}
