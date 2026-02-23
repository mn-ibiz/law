import { db } from "@/lib/db";
import { messages, notifications } from "@/lib/db/schema/messaging";
import { users } from "@/lib/db/schema/auth";
import { eq, desc, and, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

/* ──────────────────────────────────────────────
 * Messages — Inbox
 * ────────────────────────────────────────────── */
export async function getMessages(userId: string) {
  return db
    .select({
      id: messages.id,
      subject: messages.subject,
      body: messages.body,
      status: messages.status,
      readAt: messages.readAt,
      createdAt: messages.createdAt,
      senderName: users.name,
      senderId: messages.senderId,
      recipientId: messages.recipientId,
    })
    .from(messages)
    .innerJoin(users, eq(messages.senderId, users.id))
    .where(eq(messages.recipientId, userId))
    .orderBy(desc(messages.createdAt))
    .limit(200);
}

/* ──────────────────────────────────────────────
 * Messages — Sent
 * ────────────────────────────────────────────── */
export async function getSentMessages(userId: string) {
  return db
    .select({
      id: messages.id,
      subject: messages.subject,
      body: messages.body,
      status: messages.status,
      createdAt: messages.createdAt,
      receiverName: users.name,
      recipientId: messages.recipientId,
    })
    .from(messages)
    .innerJoin(users, eq(messages.recipientId, users.id))
    .where(eq(messages.senderId, userId))
    .orderBy(desc(messages.createdAt))
    .limit(200);
}

/* ──────────────────────────────────────────────
 * Single Message by ID (with sender + recipient names)
 * ────────────────────────────────────────────── */
export async function getMessageById(id: string) {
  const sender = alias(users, "sender");
  const recipient = alias(users, "recipient");

  const rows = await db
    .select({
      id: messages.id,
      subject: messages.subject,
      body: messages.body,
      status: messages.status,
      readAt: messages.readAt,
      createdAt: messages.createdAt,
      senderId: messages.senderId,
      recipientId: messages.recipientId,
      caseId: messages.caseId,
      parentMessageId: messages.parentMessageId,
      senderName: sender.name,
      senderEmail: sender.email,
      recipientName: recipient.name,
      recipientEmail: recipient.email,
    })
    .from(messages)
    .innerJoin(sender, eq(messages.senderId, sender.id))
    .innerJoin(recipient, eq(messages.recipientId, recipient.id))
    .where(eq(messages.id, id))
    .limit(1);

  return rows[0] ?? null;
}

/* ──────────────────────────────────────────────
 * Message Thread between two users (ordered by date asc)
 * ────────────────────────────────────────────── */
export async function getMessageThread(userA: string, userB: string) {
  const sender = alias(users, "sender");
  const recipient = alias(users, "recipient");

  return db
    .select({
      id: messages.id,
      subject: messages.subject,
      body: messages.body,
      status: messages.status,
      readAt: messages.readAt,
      createdAt: messages.createdAt,
      senderId: messages.senderId,
      recipientId: messages.recipientId,
      senderName: sender.name,
      recipientName: recipient.name,
    })
    .from(messages)
    .innerJoin(sender, eq(messages.senderId, sender.id))
    .innerJoin(recipient, eq(messages.recipientId, recipient.id))
    .where(
      or(
        and(eq(messages.senderId, userA), eq(messages.recipientId, userB)),
        and(eq(messages.senderId, userB), eq(messages.recipientId, userA))
      )
    )
    .orderBy(messages.createdAt)
    .limit(200);
}

/* ──────────────────────────────────────────────
 * Notifications — List
 * ────────────────────────────────────────────── */
export async function getNotifications(userId: string, unreadOnly?: boolean) {
  const conditions = [eq(notifications.userId, userId)];
  if (unreadOnly) {
    conditions.push(eq(notifications.isRead, false));
  }

  return db
    .select()
    .from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

/* ──────────────────────────────────────────────
 * Notifications — Unread Count
 * ────────────────────────────────────────────── */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return result?.count ?? 0;
}
