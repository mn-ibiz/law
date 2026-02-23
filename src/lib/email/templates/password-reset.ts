export function passwordResetEmailHtml(
  resetUrl: string,
  userName?: string
): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f8fafc; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
    <h2 style="color: #1e293b; margin: 0 0 16px;">Password Reset</h2>
    <p style="color: #475569; line-height: 1.6;">
      Hi${userName ? ` ${userName}` : ""},
    </p>
    <p style="color: #475569; line-height: 1.6;">
      We received a request to reset your password. Click the button below to create a new password:
    </p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${resetUrl}" style="display: inline-block; background: #1e40af; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        Reset Password
      </a>
    </div>
    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
      This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
    </p>
  </div>
</body>
</html>`.trim();
}
