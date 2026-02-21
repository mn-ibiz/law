# Story 15.1: Email Notification System

Status: ready-for-dev

## Story

As an Admin/Attorney,
I want email notifications for key events,
so that important information is delivered by email to the relevant people.

## Acceptance Criteria (ACs)

1. Email sending is implemented via a configurable provider abstraction supporting Resend, SendGrid, or nodemailer (SMTP), selectable via environment variable.
2. Emails are sent for the following events: fee notes/invoices sent to clients, deadline reminders (approaching and overdue), welcome emails for new users/clients, case status updates to clients, and practising certificate expiry reminders to attorneys and admins.
3. Email delivery status is tracked with statuses: queued, sent, delivered, failed, and stored in a log or the relevant entity record.
4. Documents can be attached to emails (e.g., invoice PDF attached when sending a fee note by email).
5. A provider abstraction is implemented at `src/lib/notifications/email.ts` exposing a `sendEmail(to, subject, body, attachments?)` function that works regardless of the underlying provider.
6. Queue/retry logic handles failed email sends: failed emails are retried up to 3 times with exponential backoff; permanently failed emails are logged with error details.
7. Email content is rendered using the email templates defined in the system (integrated with Story 15.2 templates).
8. All emails include the firm name in the "From" field and use a professional HTML layout with firm branding.

## Tasks / Subtasks

- [ ] **Task 1: Implement Email Provider Abstraction** (AC 1, AC 5)
  - [ ] Create `src/lib/notifications/email.ts` with an `EmailProvider` interface:
    ```typescript
    interface EmailProvider {
      sendEmail(options: SendEmailOptions): Promise<EmailResult>;
    }
    interface SendEmailOptions {
      to: string | string[];
      subject: string;
      html: string;
      text?: string;
      from?: string;
      replyTo?: string;
      attachments?: EmailAttachment[];
    }
    interface EmailAttachment {
      filename: string;
      content: Buffer | string;
      contentType: string;
    }
    interface EmailResult {
      success: boolean;
      messageId?: string;
      error?: string;
    }
    ```
  - [ ] Implement `ResendEmailProvider` class using the Resend SDK (`resend` npm package):
    - Initialize with `RESEND_API_KEY` from env
    - Map `SendEmailOptions` to Resend API format
  - [ ] Implement `SendGridEmailProvider` class using `@sendgrid/mail`:
    - Initialize with `SENDGRID_API_KEY` from env
    - Map `SendEmailOptions` to SendGrid API format
  - [ ] Implement `NodemailerEmailProvider` class using `nodemailer`:
    - Initialize with SMTP settings from env: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`
    - Create transporter and send via SMTP
  - [ ] Export `getEmailProvider()` factory function reading `EMAIL_PROVIDER` from env (values: `resend`, `sendgrid`, `nodemailer`)
  - [ ] Add all provider env vars to `.env.local.example`

- [ ] **Task 2: Build Email Sending Service with Queue/Retry** (AC 3, AC 5, AC 6)
  - [ ] Create `src/lib/notifications/send-email.ts` with `sendEmailNotification()` function:
    - Accepts: `to`, `subject`, `templateType`, `templateData`, `attachments?`
    - Resolves the email template from database by type (or uses fallback inline template)
    - Replaces placeholders in template with provided data
    - Calls `emailProvider.sendEmail()`
    - Logs result (success/failure) to an email log (can use `audit_log` or a dedicated tracking mechanism)
  - [ ] Implement retry logic:
    - On failure, retry up to 3 times with exponential backoff (1s, 4s, 16s)
    - After 3 failures, mark as permanently failed and log error details
    - Use a simple in-process retry (not a separate queue for initial implementation)
  - [ ] Create `src/lib/notifications/email-queue.ts` with a simple retry wrapper:
    ```typescript
    async function sendWithRetry(fn: () => Promise<EmailResult>, maxRetries: number = 3): Promise<EmailResult>
    ```

- [ ] **Task 3: Build HTML Email Templates** (AC 7, AC 8)
  - [ ] Create `src/lib/notifications/email-layouts.ts` with a base HTML email layout function:
    - Professional HTML template with: firm logo (URL), firm name, header section, body content area, footer with firm address and contact
    - Responsive design (works in major email clients: Gmail, Outlook, Apple Mail)
    - Inline CSS (email clients strip `<style>` tags)
  - [ ] Create template rendering functions for each email type:
    - `renderInvoiceEmail(data)` — fee note details, amount, due date, payment instructions, attached PDF note
    - `renderDeadlineReminderEmail(data)` — deadline title, case reference, due date, urgency level
    - `renderWelcomeEmail(data)` — greeting, login URL, getting started info
    - `renderCaseUpdateEmail(data)` — case number, status change, attorney contact
    - `renderCertificateExpiryEmail(data)` — attorney name, certificate details, expiry date, renewal action needed
  - [ ] Each renderer wraps content in the base layout and replaces placeholders

- [ ] **Task 4: Integrate Email Sending into Server Actions** (AC 2, AC 4)
  - [ ] Identify and update server actions to trigger emails:
    - **Fee note sent:** When invoice status changes to "Sent", send email to client with fee note details and attached PDF
    - **Deadline reminder:** When a deadline is approaching (7 days, 1 day, overdue), send email to assigned attorney
    - **Welcome email:** When a new user/client account is created, send welcome email with login credentials or portal link
    - **Case status update:** When case status changes, send email to the client (if email preference is set)
    - **Certificate expiry:** When a practising certificate is within 60/30/7 days of expiry, send email to the attorney and admin
  - [ ] Each integration:
    - Checks if the recipient has a valid email address
    - Uses the appropriate template type
    - Attaches documents where applicable (e.g., invoice PDF as attachment)
    - Handles errors gracefully (email failure does not block the primary action)
    - Logs the email send attempt

- [ ] **Task 5: Email Configuration in Firm Settings** (AC 1, AC 8)
  - [ ] Add email configuration fields to firm settings (if not already present):
    - `email_from_name` (firm name used in From field)
    - `email_from_address` (sender email address)
    - `email_reply_to` (reply-to address)
    - `email_logo_url` (URL to firm logo for email header)
  - [ ] Create `src/lib/queries/email-settings.ts` to fetch email config from `firm_settings`
  - [ ] Use these settings when constructing the From header and rendering the email layout

- [ ] **Task 6: Email Delivery Tracking** (AC 3)
  - [ ] Create a lightweight email log mechanism (can use the existing `audit_log` table with action type "email_sent" or a dedicated log):
    - Store: recipient, subject, template type, status (queued/sent/delivered/failed), error message (if failed), provider message ID, timestamp
  - [ ] Log every email send attempt (both success and failure)
  - [ ] For providers that support webhooks (Resend, SendGrid), document the webhook URL pattern for future delivery status updates (not implemented in this story but architecture supports it)

## Dev Notes

- **Architecture:** Email sending is a server-side operation only. The provider abstraction allows switching between Resend (recommended for Vercel deployment), SendGrid, and nodemailer (recommended for on-premise Windows Server deployment). The factory pattern means changing `EMAIL_PROVIDER=nodemailer` in env switches the entire email system.
- **Provider Recommendations:**
  - **Development/Demo (Vercel):** Use Resend (free tier: 3,000 emails/month, great DX, built for Next.js). Install: `npm install resend`.
  - **Production (On-premise):** Use nodemailer with the firm's SMTP server. Install: `npm install nodemailer @types/nodemailer`.
  - **Alternative:** SendGrid (free tier: 100 emails/day). Install: `npm install @sendgrid/mail`.
- **HTML Email:** Email clients have notoriously poor CSS support. Use table-based layouts with inline styles. Consider using a library like `react-email` for component-based email templates, but inline HTML functions are simpler for this scope.
- **Attachments:** For invoice PDF attachment, generate the PDF buffer in-memory (using jsPDF or @react-pdf/renderer's `renderToBuffer()`) and pass it as an `EmailAttachment` with `contentType: 'application/pdf'`.
- **Error Handling:** Email failures must be non-blocking. The primary action (e.g., changing invoice status to "Sent") must succeed even if the email fails. Log the failure and surface it in the admin UI (via the email log or notification).
- **Retry Strategy:** Simple exponential backoff: attempt 1 (immediate), attempt 2 (1 second delay), attempt 3 (4 seconds delay), attempt 4 (16 seconds delay). After final failure, log and give up. For production, consider a proper job queue (Bull, Inngest) but this is out of scope.
- **Environment Variables:**
  ```
  EMAIL_PROVIDER=resend  # resend | sendgrid | nodemailer
  RESEND_API_KEY=re_xxx
  SENDGRID_API_KEY=SG.xxx
  SMTP_HOST=smtp.example.com
  SMTP_PORT=587
  SMTP_USER=user
  SMTP_PASS=pass
  SMTP_SECURE=false
  ```

### Project Structure Notes

**Files to Create:**
- `src/lib/notifications/email.ts` — Email provider abstraction (interface, implementations, factory)
- `src/lib/notifications/send-email.ts` — High-level email sending service with template resolution
- `src/lib/notifications/email-queue.ts` — Retry logic wrapper
- `src/lib/notifications/email-layouts.ts` — HTML email base layout and per-type renderers
- `src/lib/queries/email-settings.ts` — Fetch email config from firm_settings
- `src/types/email.ts` — Email-related type definitions

**Files to Modify:**
- Various server actions — Add email trigger calls (incremental integration, same pattern as SMS)
- `src/lib/db/schema/` — Verify email_templates table and add email log fields if needed
- `.env.local.example` — Add email provider configuration variables
- Firm settings page — Add email configuration fields (if not already present)

### References

- [Source: epics.md — Epic 15, Story 15.1: Email Notification System]
- [Source: a.md — Module 23: SMS & Communication Integration — Email Integration section]
- [Source: a.md — Module 14: Settings & Configuration — Email Templates (Future)]
- [Source: a.md — Module 9: Billing & Invoicing — Invoice email sending]
- [Source: a.md — Architecture Patterns — Server Actions for all mutations]

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
