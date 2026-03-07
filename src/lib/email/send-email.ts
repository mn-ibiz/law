import { getResendClient } from "./resend";
import { env } from "@/lib/env";

interface EmailAttachment {
  filename: string;
  content: string; // base64 encoded
}

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  cc?: string[];
  attachments?: EmailAttachment[];
}

export async function sendEmail({
  to,
  subject,
  html,
  cc,
  attachments,
}: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  const resend = getResendClient();
  if (!resend) {
    console.warn("Email not configured: RESEND_API_KEY not set");
    return { success: false, error: "Email not configured" };
  }

  const from = env.EMAIL_FROM ?? "noreply@example.com";

  try {
    await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      cc: cc?.length ? cc : undefined,
      subject,
      html,
      attachments: attachments?.map((a) => ({
        filename: a.filename,
        content: Buffer.from(a.content, "base64"),
      })),
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error: String(error) };
  }
}
