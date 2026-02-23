import { getResendClient } from "./resend";
import { env } from "@/lib/env";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  const resend = getResendClient();
  if (!resend) {
    console.warn("Email not configured: RESEND_API_KEY not set");
    return { success: false, error: "Email not configured" };
  }

  const from = env.EMAIL_FROM ?? "noreply@example.com";

  try {
    await resend.emails.send({ from, to, subject, html });
    return { success: true };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error: String(error) };
  }
}
