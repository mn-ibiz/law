"use server";

import { sendEmail } from "@/lib/email/send-email";
import { getTenantContext } from "@/lib/auth/get-session";
import { siteConfig } from "@/lib/config/site";

interface EmailReportInput {
  to: string;
  subject: string;
  reportTitle: string;
  pdfBase64: string;
  fileName: string;
}

export async function emailReport(input: EmailReportInput) {
  const { role } = await getTenantContext();
  if (!["admin", "attorney"].includes(role)) {
    return { success: false, error: "Unauthorized" };
  }

  const { to, subject, reportTitle, pdfBase64, fileName } = input;

  if (!to || !to.includes("@")) {
    return { success: false, error: "Invalid email address" };
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a1a; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">
        ${reportTitle}
      </h2>
      <p style="color: #6b7280; font-size: 14px;">
        Please find the attached report generated from the ${siteConfig.name} system.
      </p>
      <p style="color: #6b7280; font-size: 14px;">
        Generated on: ${new Date().toLocaleDateString("en-KE", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="color: #9ca3af; font-size: 12px;">
        This is an automated report from ${siteConfig.name}. Please do not reply to this email.
      </p>
    </div>
  `;

  // Resend supports attachments
  const { getResendClient } = await import("@/lib/email/resend");
  const resend = getResendClient();

  if (!resend) {
    return { success: false, error: "Email not configured. RESEND_API_KEY is not set." };
  }

  const { env } = await import("@/lib/env");
  const from = env.EMAIL_FROM ?? "noreply@example.com";

  try {
    await resend.emails.send({
      from,
      to,
      subject,
      html,
      attachments: [
        {
          filename: fileName,
          content: pdfBase64,
        },
      ],
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to email report:", error);
    return { success: false, error: String(error) };
  }
}
