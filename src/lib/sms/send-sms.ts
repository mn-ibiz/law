import { db } from "@/lib/db";
import { smsLog } from "@/lib/db/schema/messaging";
import { eq } from "drizzle-orm";
import { getATClient } from "./africastalking";
import { env } from "@/lib/env";

interface SendSMSOptions {
  organizationId: string;
  to: string;
  message: string;
  userId?: string;
  caseId?: string;
  /** Per-org sender ID override. Falls back to AT_SENDER_ID env var. */
  senderId?: string;
}

export async function sendSMS({
  organizationId,
  to,
  message,
  userId,
  caseId,
  senderId,
}: SendSMSOptions): Promise<{ success: boolean; error?: string }> {
  // Always log the attempt
  const [logEntry] = await db
    .insert(smsLog)
    .values({
      organizationId,
      recipientPhone: to,
      message,
      status: "pending",
      provider: "africastalking",
      userId: userId ?? null,
      caseId: caseId ?? null,
    })
    .returning();

  const client = getATClient();
  if (!client) {
    console.warn("SMS not configured: AT_API_KEY/AT_USERNAME not set");
    await db
      .update(smsLog)
      .set({ status: "failed" })
      .where(eq(smsLog.id, logEntry.id));
    return { success: false, error: "SMS not configured" };
  }

  try {
    const result = await client.SMS.send({
      to: [to],
      message,
      from: senderId ?? env.AT_SENDER_ID ?? undefined,
    });

    await db
      .update(smsLog)
      .set({
        status: "sent",
        providerMessageId: JSON.stringify(result),
        sentAt: new Date(),
      })
      .where(eq(smsLog.id, logEntry.id));

    return { success: true };
  } catch (error) {
    console.error("Failed to send SMS:", error);
    await db
      .update(smsLog)
      .set({ status: "failed" })
      .where(eq(smsLog.id, logEntry.id));
    return { success: false, error: String(error) };
  }
}
