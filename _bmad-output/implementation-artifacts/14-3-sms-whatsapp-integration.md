# Story 14.3: SMS & WhatsApp Integration

Status: ready-for-dev

## Story

As an Admin,
I want SMS and WhatsApp notifications for key events,
so that alerts reach users and clients through multiple channels beyond in-app notifications.

## Acceptance Criteria (ACs)

1. SMS messages are sent via the Africa's Talking API for the following events: court date reminders, bring-up reminders, client appointment reminders, invoice/fee note sent notification, payment confirmation, and deadline alerts.
2. All phone numbers are validated and formatted in Kenya's +254 format before sending.
3. An SMS template management page is available (Admin only) allowing CRUD of SMS templates with name, body text, and type.
4. SMS templates support placeholders: `{{client_name}}`, `{{case_number}}`, `{{date}}`, `{{amount}}`, `{{attorney_name}}`, `{{firm_name}}`, and any other relevant dynamic fields.
5. SMS delivery status is tracked in the `sms_log` table with statuses: queued, sent, delivered, failed.
6. SMS cost per message is tracked and stored in the `sms_log` for cost reporting.
7. A WhatsApp number field is available on the client record for storing the client's WhatsApp contact.
8. A WhatsApp integration abstraction layer is implemented (placeholder/future-ready) for sending case updates via WhatsApp Business API and receiving documents via WhatsApp.
9. Per-client WhatsApp preference toggle allows clients to opt in or out of WhatsApp notifications.
10. Provider abstraction is implemented: `src/lib/notifications/sms.ts` handles SMS sending and `src/lib/notifications/whatsapp.ts` handles WhatsApp (placeholder), allowing the SMS provider to be swapped without changing calling code.
11. SMS log page (Admin only) displays all sent SMS messages with: recipient, message body, status, cost, timestamp, and associated event type.

## Tasks / Subtasks

- [ ] **Task 1: Implement SMS Provider Abstraction** (AC 1, AC 10)
  - [ ] Create `src/lib/notifications/sms.ts` with an `SmsProvider` interface:
    ```typescript
    interface SmsProvider {
      sendSms(to: string, message: string): Promise<SmsResult>;
      getDeliveryStatus(messageId: string): Promise<DeliveryStatus>;
    }
    ```
  - [ ] Implement `AfricasTalkingSmsProvider` class implementing the interface:
    - Initialize Africa's Talking SDK with API key and username from environment variables (`AFRICASTALKING_API_KEY`, `AFRICASTALKING_USERNAME`, `AFRICASTALKING_SENDER_ID`)
    - `sendSms()`: format phone to +254, call Africa's Talking SMS API, return message ID and status
    - `getDeliveryStatus()`: query delivery status from Africa's Talking API
  - [ ] Export a factory function `getSmsProvider()` that returns the configured provider based on env config
  - [ ] Add environment variables to `.env.local.example`: `AFRICASTALKING_API_KEY`, `AFRICASTALKING_USERNAME`, `AFRICASTALKING_SENDER_ID`, `SMS_PROVIDER=africastalking`

- [ ] **Task 2: Implement SMS Sending Service** (AC 1, AC 2, AC 4, AC 5, AC 6)
  - [ ] Create `src/lib/notifications/send-sms.ts` with a `sendSmsNotification()` function:
    - Accepts: `recipientPhone`, `templateType`, `templateData` (placeholder values), optionally `caseId`, `userId`
    - Validates phone format (must be +254 followed by 9 digits)
    - Looks up the SMS template by type from the database
    - Replaces placeholders in template body with provided data
    - Calls `smsProvider.sendSms()`
    - Logs the result in the `sms_log` table: `recipientPhone`, `messageBody`, `templateType`, `status` (queued/sent/delivered/failed), `cost`, `providerMessageId`, `caseId`, `userId`, `createdAt`
  - [ ] Create `src/lib/validators/phone.ts` (or add to existing) with Zod schema for +254 phone validation: `/^\+254\d{9}$/`
  - [ ] Handle errors gracefully: if SMS fails, log the failure but do not throw (SMS failure should not block the primary action)

- [ ] **Task 3: SMS Template Management Page** (AC 3, AC 4)
  - [ ] Create `src/app/(dashboard)/settings/sms-templates/page.tsx` (Admin only)
  - [ ] Create `src/lib/queries/sms-templates.ts` with `getSmsTemplates(filters?)` and `getSmsTemplateById(id)`
  - [ ] Create `src/lib/actions/sms-templates.ts` with CRUD server actions: `createSmsTemplate`, `updateSmsTemplate`, `deleteSmsTemplate`
  - [ ] Create `src/lib/validators/sms-template.ts` with Zod schema: name (required), body (required, max 640 chars), type (required, enum)
  - [ ] Build template list page with DataTable: name, type, body preview (truncated), actions (edit, delete)
  - [ ] Build create/edit form (react-hook-form + Zod):
    - Name (text input)
    - Type (dropdown: Court Reminder, Bring-Up Reminder, Appointment Reminder, Invoice Sent, Payment Confirmation, Deadline Alert, General)
    - Body (textarea with character count indicator; standard SMS is 160 chars, concatenated up to 640)
    - Available placeholders reference list displayed alongside the form
  - [ ] Show character count with color indicator: green (<=160), yellow (161-320), orange (321-480), red (481-640)
  - [ ] Preview button: shows sample rendered message with placeholder values replaced by sample data

- [ ] **Task 4: Integrate SMS Sending into Server Actions** (AC 1)
  - [ ] Update or hook into existing server actions to trigger SMS for key events:
    - Court date reminder: trigger from calendar/deadline cron or workflow (send to assigned attorney)
    - Bring-up due: trigger from bring-up reminder logic (send to assigned attorney)
    - Appointment reminder: trigger from calendar event reminder (send to attendees)
    - Invoice/fee note sent: trigger from invoice status change to "Sent" (send to client)
    - Payment confirmation: trigger from payment recording action (send to client)
    - Deadline alert: trigger from deadline approaching logic (send to assigned attorney)
  - [ ] Each integration checks if the recipient has a valid phone number before attempting SMS
  - [ ] Each integration uses the appropriate SMS template type

- [ ] **Task 5: SMS Log Page** (AC 5, AC 6, AC 11)
  - [ ] Create `src/app/(dashboard)/settings/sms-log/page.tsx` (Admin only)
  - [ ] Create `src/lib/queries/sms-log.ts` with `getSmsLog(filters?)` — paginated, filterable
  - [ ] Display DataTable with columns: recipient phone, message body (truncated), status badge (queued=gray, sent=blue, delivered=green, failed=red), cost (KES), event type, timestamp
  - [ ] Filters: status, date range, event type
  - [ ] Show total SMS cost summary at the top

- [ ] **Task 6: WhatsApp Abstraction Layer (Placeholder)** (AC 7, AC 8, AC 9, AC 10)
  - [ ] Create `src/lib/notifications/whatsapp.ts` with a `WhatsAppProvider` interface:
    ```typescript
    interface WhatsAppProvider {
      sendMessage(to: string, message: string, templateId?: string): Promise<WhatsAppResult>;
      sendDocument(to: string, documentUrl: string, caption: string): Promise<WhatsAppResult>;
    }
    ```
  - [ ] Implement `PlaceholderWhatsAppProvider` that logs the message and returns a mock success (no actual API call)
  - [ ] Export `getWhatsAppProvider()` factory function
  - [ ] Add `whatsappNumber` field to the client form and client record (if not already in schema)
  - [ ] Add `whatsappOptIn` boolean field to the client record for per-client preference
  - [ ] Update client forms to include WhatsApp number input and opt-in checkbox
  - [ ] Add comment/documentation in the placeholder noting future integration with WhatsApp Business API

- [ ] **Task 7: Seed Default SMS Templates** (AC 3)
  - [ ] Add default SMS templates to the seed script:
    - Court Reminder: "Dear {{attorney_name}}, reminder: Court date for {{case_number}} on {{date}}. Please prepare accordingly. - {{firm_name}}"
    - Bring-Up Reminder: "File bring-up reminder: Case {{case_number}} requires your attention today. Reason: {{reason}}. - {{firm_name}}"
    - Invoice Sent: "Dear {{client_name}}, Fee Note {{invoice_number}} for KES {{amount}} has been sent. Due: {{date}}. - {{firm_name}}"
    - Payment Confirmation: "Dear {{client_name}}, payment of KES {{amount}} received for {{invoice_number}}. Thank you. - {{firm_name}}"
    - Deadline Alert: "URGENT: Deadline for {{case_number}} - {{deadline_title}} is due on {{date}}. - {{firm_name}}"

## Dev Notes

- **Africa's Talking API:** The Africa's Talking SMS API is the most widely used SMS gateway in Kenya. The SDK is `africastalking` (npm package). Configuration requires: API Key (from dashboard), Username (sandbox or production), and optional Sender ID (short code or alphanumeric). Sandbox mode is available for development.
  - Install: `npm install africastalking`
  - Sandbox username: "sandbox", with sandbox API key from the AT dashboard
  - Production requires a registered sender ID and funded account
- **Provider Abstraction:** The `SmsProvider` interface allows swapping providers (e.g., Twilio, Nexmo) without changing business logic. The factory function reads `SMS_PROVIDER` from env to select the implementation.
- **Template Placeholders:** Use simple string replacement: `template.body.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] || '')`. Validate that all required placeholders are present in the data before sending.
- **Error Handling:** SMS failures must be non-blocking. If the primary action is "record payment," the payment must succeed even if SMS fails. Log failures in `sms_log` with status "failed" and error details.
- **Phone Validation:** Always validate and normalize phone numbers to +254 format. Accept input as "0712345678" or "+254712345678" or "254712345678" and normalize to "+254712345678".
- **Cost Tracking:** Africa's Talking returns cost per message in the API response. Store this in the `sms_log` table. Standard SMS cost in Kenya is approximately KES 0.80-1.50 per message.
- **WhatsApp:** The WhatsApp integration is explicitly a placeholder/abstraction layer for this story. No actual WhatsApp API calls are made. The schema fields and preference toggles are created to be "future-ready" for WhatsApp Business API integration.
- **Rate Limiting:** Consider implementing rate limiting on SMS sends to prevent accidental bulk sending. A simple approach: max 100 SMS per hour per firm, configurable in firm settings.

### Project Structure Notes

**Files to Create:**
- `src/lib/notifications/sms.ts` — SMS provider abstraction and Africa's Talking implementation
- `src/lib/notifications/whatsapp.ts` — WhatsApp provider abstraction (placeholder)
- `src/lib/notifications/send-sms.ts` — SMS sending service with template resolution and logging
- `src/app/(dashboard)/settings/sms-templates/page.tsx` — SMS template management page
- `src/app/(dashboard)/settings/sms-log/page.tsx` — SMS log viewer page
- `src/lib/queries/sms-templates.ts` — SMS template query functions
- `src/lib/queries/sms-log.ts` — SMS log query functions
- `src/lib/actions/sms-templates.ts` — CRUD server actions for SMS templates
- `src/lib/validators/sms-template.ts` — Zod schema for SMS templates
- `src/lib/validators/phone.ts` — Phone number validation (or add to existing validators)
- `src/types/sms.ts` — SMS-related type definitions

**Files to Modify:**
- `src/lib/db/schema/` — Verify `sms_log` and `sms_templates` table schemas include all needed columns (cost, providerMessageId, etc.)
- Client form components — Add WhatsApp number and opt-in fields
- Various server actions — Add SMS trigger calls (incremental integration)
- Seed script (`src/lib/db/seed.ts`) — Add default SMS templates

### References

- [Source: epics.md — Epic 14, Story 14.3: SMS & WhatsApp Integration]
- [Source: a.md — Module 23: SMS & Communication Integration — Africa's Talking, SMS templates, delivery tracking, cost tracking]
- [Source: a.md — Feature Gap Analysis — #13 SMS Notifications (+254 format), #14 WhatsApp Integration]
- [Source: a.md — Database — sms_log, sms_templates tables in Messaging/Settings domains]

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
