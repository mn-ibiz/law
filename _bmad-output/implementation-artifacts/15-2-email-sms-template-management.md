# Story 15.2: Email & SMS Template Management

Status: ready-for-dev

## Story

As an Admin,
I want to manage email and SMS templates,
so that automated communications are customizable and consistent across the firm.

## Acceptance Criteria (ACs)

1. Email templates page (Admin only) provides full CRUD for email templates with fields: name, subject line, body (rich text editor), and type.
2. Email template types include: Invoice/Fee Note, Deadline Reminder, Welcome, Case Update, and Payment Confirmation.
3. Email templates support placeholders: `{{client_name}}`, `{{case_number}}`, `{{attorney_name}}`, `{{amount}}`, `{{date}}`, `{{firm_name}}`, `{{portal_link}}`, and other relevant dynamic fields. Available placeholders are displayed as a reference alongside the editor.
4. Email template preview renders the template with sample data, showing how the final email will appear with placeholders replaced.
5. SMS templates page (Admin only) provides full CRUD for SMS templates with fields: name, body (plain text), and type.
6. SMS template body field displays a character count indicator showing current length versus the 160-character standard SMS limit (and concatenated message boundaries at 320, 480, 640).
7. Default templates are seeded for all common scenarios so the system works out of the box without admin configuration.
8. Templates are selectable in notification sending workflows; when an email or SMS is triggered, the system uses the template matching the event type.

## Tasks / Subtasks

- [ ] **Task 1: Build Email Templates Management Page** (AC 1, AC 2, AC 3)
  - [ ] Create `src/app/(dashboard)/settings/email-templates/page.tsx` (Admin only)
  - [ ] Create `src/lib/queries/email-templates.ts` with `getEmailTemplates(filters?)`, `getEmailTemplateById(id)`, `getEmailTemplateByType(type)`
  - [ ] Create `src/lib/actions/email-templates.ts` with CRUD server actions: `createEmailTemplate`, `updateEmailTemplate`, `deleteEmailTemplate`
  - [ ] Create `src/lib/validators/email-template.ts` with Zod schema:
    - `name` (required, string, max 100 chars)
    - `subject` (required, string, max 200 chars — also supports placeholders)
    - `body` (required, string — HTML rich text content)
    - `type` (required, enum: `invoice`, `deadline_reminder`, `welcome`, `case_update`, `payment_confirmation`)
  - [ ] Display email templates in a DataTable: name, type badge, subject preview, last updated, actions (edit, delete, preview)
  - [ ] Build create/edit form (react-hook-form + Zod):
    - Name (text input)
    - Type (dropdown select)
    - Subject (text input — note: supports placeholders like `Fee Note {{invoice_number}} from {{firm_name}}`)
    - Body (rich text editor — use a textarea with basic HTML support, or integrate a lightweight editor like Tiptap or react-quill)
  - [ ] Display available placeholders panel alongside the editor:
    - General: `{{firm_name}}`, `{{firm_address}}`, `{{firm_phone}}`, `{{firm_email}}`, `{{date}}`
    - Client: `{{client_name}}`, `{{client_email}}`
    - Case: `{{case_number}}`, `{{case_title}}`
    - Attorney: `{{attorney_name}}`, `{{attorney_email}}`
    - Billing: `{{amount}}`, `{{invoice_number}}`, `{{due_date}}`, `{{balance_due}}`
    - Links: `{{portal_link}}`, `{{login_link}}`
  - [ ] Add "Insert Placeholder" button/click action that inserts the placeholder at cursor position in the body editor
  - [ ] Add audit log entry on create/update/delete

- [ ] **Task 2: Build Email Template Preview** (AC 4)
  - [ ] Add a "Preview" button on each template (in list and in edit form)
  - [ ] Create `src/components/shared/email-template-preview.tsx` that:
    - Takes a template (subject + body) and sample data
    - Replaces all placeholders with sample values (e.g., `{{client_name}}` -> "John Kamau", `{{case_number}}` -> "2026-0042", `{{amount}}` -> "KES 150,000")
    - Renders the result in a modal (shadcn Dialog) showing both the subject line and the HTML body in an iframe or styled container
  - [ ] Define sample data constants in `src/lib/utils/template-sample-data.ts`:
    ```typescript
    const sampleData = {
      client_name: "John Kamau",
      case_number: "2026-0042",
      case_title: "Kamau v. Njoroge Land Dispute",
      attorney_name: "Jane Wanjiku",
      amount: "KES 150,000",
      invoice_number: "FN-2026-0015",
      due_date: "15/03/2026",
      firm_name: "Mwangi & Associates Advocates",
      portal_link: "https://portal.example.com",
      date: "22/02/2026",
      // ... other placeholders
    };
    ```

- [ ] **Task 3: Build SMS Templates Management Page** (AC 5, AC 6)
  - [ ] Create `src/app/(dashboard)/settings/sms-templates/page.tsx` (Admin only) — note: if this page was created in Story 14.3, enhance it here with the full template management features
  - [ ] Create/update `src/lib/queries/sms-templates.ts` with full CRUD queries
  - [ ] Create/update `src/lib/actions/sms-templates.ts` with CRUD server actions
  - [ ] Create/update `src/lib/validators/sms-template.ts` with Zod schema:
    - `name` (required, string, max 100 chars)
    - `body` (required, string, max 640 chars)
    - `type` (required, enum: `court_reminder`, `bring_up_reminder`, `appointment_reminder`, `invoice_sent`, `payment_confirmation`, `deadline_alert`, `general`)
  - [ ] Display SMS templates in a DataTable: name, type badge, body preview (truncated), character count, actions (edit, delete)
  - [ ] Build create/edit form:
    - Name (text input)
    - Type (dropdown select)
    - Body (textarea with live character count)
  - [ ] Implement character count indicator:
    - Display "X / 160 characters" below the textarea
    - Color coding: green (0-160, 1 SMS), yellow (161-320, 2 SMS), orange (321-480, 3 SMS), red (481-640, 4 SMS)
    - Show SMS count: "This message will be sent as X SMS(es)"
  - [ ] Display available SMS placeholders reference (same pattern as email but more limited set)

- [ ] **Task 4: Seed Default Templates** (AC 7)
  - [ ] Add to seed script (`src/lib/db/seed.ts`) default email templates:
    - **Invoice/Fee Note:** Subject: "Fee Note {{invoice_number}} from {{firm_name}}", Body: Professional HTML with fee note details, amount, due date, payment instructions, portal link
    - **Deadline Reminder:** Subject: "Deadline Reminder: {{case_number}} - {{deadline_title}}", Body: Urgency-based message with deadline details, case link
    - **Welcome:** Subject: "Welcome to {{firm_name}} Client Portal", Body: Greeting, login credentials, portal URL, getting started guide
    - **Case Update:** Subject: "Case Update: {{case_number}} - {{case_title}}", Body: Status change details, next steps, attorney contact
    - **Payment Confirmation:** Subject: "Payment Received - {{invoice_number}}", Body: Payment amount, method, remaining balance, thank you
  - [ ] Add to seed script default SMS templates (if not already done in Story 14.3):
    - Court Reminder, Bring-Up Reminder, Invoice Sent, Payment Confirmation, Deadline Alert (as defined in Story 14.3)
  - [ ] Ensure seeding is idempotent (check if templates exist before inserting)

- [ ] **Task 5: Template Resolution in Notification Services** (AC 8)
  - [ ] Update `src/lib/notifications/send-email.ts` to resolve templates by type:
    - Query `email_templates` table by type
    - If template found, use its subject and body
    - If not found, fall back to a hardcoded default template
    - Replace all placeholders with provided data
  - [ ] Update `src/lib/notifications/send-sms.ts` to resolve templates by type:
    - Query `sms_templates` table by type
    - If template found, use its body
    - If not found, fall back to a hardcoded default message
    - Replace all placeholders with provided data
  - [ ] Create `src/lib/utils/template-engine.ts` with a shared `renderTemplate(template: string, data: Record<string, string>): string` function that replaces `{{placeholder}}` patterns

## Dev Notes

- **Architecture:** Template management pages are standard Admin CRUD pages using Server Components for lists and Client Components for forms. The template rendering engine is a simple string replacement utility shared between email and SMS services.
- **Rich Text Editor:** For the email body editor, options in order of preference:
  1. **Tiptap** (recommended): headless, works well with React, supports placeholder insertion. Install: `npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder`.
  2. **react-quill**: popular, simple. Install: `npm install react-quill`.
  3. **Textarea with HTML**: simplest approach if rich editing is not critical; admin writes HTML directly.
  - For initial implementation, a textarea with basic instructions about HTML tags is acceptable. The rich text editor can be upgraded later.
- **Placeholder Engine:** The template engine is intentionally simple: regex-based replacement of `{{key}}` patterns. Do not use a full templating language (Handlebars, Mustache) to keep the system lightweight. The function should handle missing placeholders gracefully (replace with empty string or leave the placeholder).
- **Template Types:** Each event type has one "active" template. If multiple templates of the same type exist, the notification service should use the most recently updated one (or a designated "active" flag). For simplicity in v1, enforce one template per type (unique constraint on type).
- **Character Count (SMS):** Standard GSM-7 SMS is 160 characters. Unicode SMS (with special characters) is 70 characters. For simplicity, assume GSM-7 encoding and show the 160-char limit. Concatenated SMS uses 153 chars per segment (7 chars for UDH header).
- **Seeding Strategy:** The seed script should insert templates with `ON CONFLICT DO NOTHING` (or check existence) to be idempotent. Templates should be marked as `isDefault: true` so admins know which are system-provided.

### Project Structure Notes

**Files to Create:**
- `src/app/(dashboard)/settings/email-templates/page.tsx` — Email template management page
- `src/components/forms/email-template-form.tsx` — Email template create/edit form
- `src/components/shared/email-template-preview.tsx` — Template preview modal
- `src/lib/queries/email-templates.ts` — Email template query functions
- `src/lib/actions/email-templates.ts` — Email template CRUD server actions
- `src/lib/validators/email-template.ts` — Zod schema for email templates
- `src/lib/utils/template-engine.ts` — Shared placeholder replacement utility
- `src/lib/utils/template-sample-data.ts` — Sample data for template preview

**Files to Modify:**
- `src/app/(dashboard)/settings/sms-templates/page.tsx` — Enhance with full template management (if created in Story 14.3)
- `src/lib/queries/sms-templates.ts` — Add/update query functions
- `src/lib/actions/sms-templates.ts` — Add/update CRUD server actions
- `src/lib/validators/sms-template.ts` — Update Zod schema if needed
- `src/lib/notifications/send-email.ts` — Integrate template resolution
- `src/lib/notifications/send-sms.ts` — Integrate template resolution
- `src/lib/db/seed.ts` — Add default email and SMS templates

### References

- [Source: epics.md — Epic 15, Story 15.2: Email & SMS Template Management]
- [Source: a.md — Module 14: Settings & Configuration — Email Templates section]
- [Source: a.md — Module 23: SMS & Communication Integration — SMS template management]
- [Source: a.md — Database — email_templates, sms_templates tables in Settings domain]
- [Source: epics.md — Story 14.3: SMS & WhatsApp Integration — SMS template seeding]

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
