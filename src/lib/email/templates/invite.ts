import { siteConfig } from "@/lib/config/site";

export function inviteEmailHtml(
  firmName: string,
  inviterName: string,
  roleName: string,
  acceptUrl: string
): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
  <h1 style="color: #111; font-size: 24px;">You&rsquo;ve been invited!</h1>
  <p>${inviterName} has invited you to join <strong>${firmName}</strong> as a <strong>${roleName}</strong> on ${siteConfig.name}.</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${acceptUrl}" style="display: inline-block; background: #111; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
      Accept Invitation
    </a>
  </div>

  <p style="color: #666; font-size: 14px;">This invitation expires in 7 days. If you didn&rsquo;t expect this email, you can safely ignore it.</p>

  <p style="margin-top: 30px; color: #666; font-size: 14px;">
    &mdash; The ${siteConfig.name} Team
  </p>
</body>
</html>`;
}
