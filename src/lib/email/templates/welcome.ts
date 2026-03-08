import { siteConfig } from "@/lib/config/site";

export function welcomeEmailHtml(firmName: string, subdomainUrl: string, adminName: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
  <h1 style="color: #111; font-size: 24px;">Welcome to ${siteConfig.name}!</h1>
  <p>Hi ${adminName},</p>
  <p>Your firm <strong>${firmName}</strong> has been set up successfully. Here&rsquo;s everything you need to get started:</p>

  <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <p style="margin: 0 0 8px; font-weight: 600;">Your firm&rsquo;s URL:</p>
    <a href="${subdomainUrl}" style="color: #2563eb; font-size: 18px;">${subdomainUrl}</a>
  </div>

  <h2 style="font-size: 18px; margin-top: 30px;">Getting Started Checklist</h2>
  <ol style="line-height: 2;">
    <li>Log in at your firm URL above</li>
    <li>Add your attorneys and team members</li>
    <li>Configure your firm branding (logo, colors)</li>
    <li>Set up billing rates</li>
    <li>Import or add your first clients</li>
    <li>Configure practice areas for your jurisdiction</li>
  </ol>

  <p>Your trial period has started. You can explore all features during the trial.</p>

  <p style="margin-top: 30px; color: #666; font-size: 14px;">
    If you have questions, reply to this email or visit our help center.<br/>
    &mdash; The ${siteConfig.name} Team
  </p>
</body>
</html>`;
}
