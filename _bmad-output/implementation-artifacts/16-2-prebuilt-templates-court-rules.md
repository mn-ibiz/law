# Story 16.2: Pre-Built Templates & Court Rules Engine

Status: ready-for-dev

## Story

As an Admin,
I want pre-built workflow templates and automatic deadline calculation from court dates,
so that common scenarios are automated out of the box and attorneys never miss court-derived deadlines.

## Acceptance Criteria (ACs)

1. The following pre-built workflow templates are seeded and available as activatable rules:
   - **New Case Welcome:** When a new case is created, auto-create welcome tasks (e.g., "Send engagement letter", "Schedule initial consultation", "Open file") and notify the admin.
   - **Court Date Preparation:** When a court date is within 7 days, notify the assigned attorney and create a preparation task (e.g., "Prepare court bundle").
   - **Invoice Overdue Reminder:** When an invoice is overdue by 30 days, send a reminder email to the client and notify the admin.
   - **Certificate Expiry Alert:** When a practising certificate is expiring within 30 days, alert both the attorney and admin via notification and email.
   - **Bring-Up Due Notification:** When a bring-up is due, send notification to the assigned user (in-app, email, and/or SMS based on configured method).
   - **New Intake Submitted:** When a new online intake form is submitted, notify the assigned attorney and trigger an automatic conflict check.
2. Pre-built templates are visible on the workflow management page with a "Pre-built" or "System" badge distinguishing them from custom rules.
3. Admin can activate or deactivate pre-built templates but cannot delete them; admin can customize the action configuration of pre-built templates (e.g., change the notification message or task title).
4. **Court Rules Engine:** The system auto-calculates deadlines from court dates based on court rule templates (e.g., "File response within 14 days of mention", "Submit documents 3 days before hearing").
5. Court rule templates are configurable per court type (High Court, Magistrate Court, ELC, ELRC, etc.) with different deadline offset rules.
6. When a court date is scheduled (calendar event with `isCourtDate = true`), the court rules engine automatically creates deadline events based on the applicable court rules for that court type.
7. Court rules are manageable by Admin: CRUD of court rule templates with fields for court type, rule name, trigger event (e.g., "Hearing Scheduled", "Mention Scheduled"), deadline offset (days before/after), and the deadline title/description.

## Tasks / Subtasks

- [ ] **Task 1: Seed Pre-Built Workflow Templates** (AC 1, AC 2, AC 3)
  - [ ] Add to seed script (`src/lib/db/seed.ts`) the pre-built workflow templates in the `workflow_templates` table:
    - **New Case Welcome:**
      - Trigger: `case_status_change` (from: null/new, to: Open)
      - Actions: Create tasks ["Send engagement letter to client", "Schedule initial consultation", "Open physical file"], Send notification to Admin
      - Default: active
    - **Court Date Preparation (7 days):**
      - Trigger: `deadline_approaching` (daysBefore: 7, deadlineType: Court)
      - Actions: Send notification to Lead Attorney, Create task "Prepare court bundle for {{case_number}}"
      - Default: active
    - **Invoice Overdue 30 Days:**
      - Trigger: `invoice_overdue` (daysOverdue: 30)
      - Actions: Send email to client (using invoice reminder template), Send notification to Admin
      - Default: active
    - **Certificate Expiry 30 Days:**
      - Trigger: `certificate_expiring` (daysBefore: 30)
      - Actions: Send notification to attorney, Send notification to Admin, Send email to attorney
      - Default: active
    - **Bring-Up Due:**
      - Trigger: `bring_up_due` (daysBefore: 0)
      - Actions: Send notification to assigned user, Send email (if configured), Send SMS (if configured)
      - Default: active
    - **New Intake Submitted:**
      - Trigger: `new_client` (source: "intake_form")
      - Actions: Send notification to assigned attorney, Trigger conflict check (create task "Run conflict check for {{client_name}}")
      - Default: active
  - [ ] Mark all seeded templates with `isSystem: true` (or equivalent flag) so the UI displays them with a "System" badge
  - [ ] Ensure seeding is idempotent (check by template name or a unique identifier)

- [ ] **Task 2: Display Pre-Built Templates on Workflow Page** (AC 2, AC 3)
  - [ ] Update `src/app/(dashboard)/settings/workflows/page.tsx` to display pre-built templates with a "System" or "Pre-built" badge (shadcn Badge variant)
  - [ ] System templates show an active/inactive toggle but no delete button
  - [ ] System templates show an "Edit" button that allows modifying action configuration (notification message text, task titles, email template selection) but not the trigger type or trigger condition
  - [ ] Custom (user-created) rules are displayed separately or with a "Custom" badge for distinction
  - [ ] Sort order: system templates first, then custom rules

- [ ] **Task 3: Create Court Rules Engine** (AC 4, AC 5, AC 6)
  - [ ] Create `src/lib/workflows/court-rules-engine.ts` with:
    ```typescript
    async function applyCourtRules(courtEventData: {
      caseId: string;
      courtType: string;
      eventType: string; // Mention, Hearing, Ruling, etc.
      eventDate: Date;
      attorneyId: string;
    }): Promise<void>
    ```
    - Query all active court rule templates matching the `courtType` and `eventType`
    - For each matching rule, calculate the deadline date based on the offset:
      - Positive offset = days after the event (e.g., "File response 14 days after mention")
      - Negative offset = days before the event (e.g., "Submit documents 3 days before hearing")
    - Create deadline records in the `deadlines` table with:
      - Title from the court rule template (with placeholder replacement)
      - Due date = eventDate +/- offset days
      - Case ID from the court event
      - Assigned to the lead attorney or case attorneys
      - Priority based on the offset (shorter deadlines = higher priority)
    - Create calendar events for each auto-generated deadline
    - Log the auto-creation in the workflow execution log

- [ ] **Task 4: Seed Default Court Rule Templates** (AC 4, AC 5, AC 7)
  - [ ] Create `src/lib/db/schema/court-rules.ts` (or add to existing schema) for a `court_rule_templates` table:
    - `id`, `courtType` (enum/string), `ruleName`, `triggerEvent` (Hearing Scheduled, Mention Scheduled, Ruling Scheduled, Filing Deadline, etc.), `offsetDays` (integer, positive=after, negative=before), `deadlineTitle` (string with placeholders), `deadlineDescription`, `priority` (Low/Medium/High/Urgent), `isActive`, `createdAt`, `updatedAt`
  - [ ] Seed default court rules based on Kenya court practice:
    - **High Court / ELC / ELRC:**
      - "File response" — 14 days after mention date
      - "Submit documents" — 3 days before hearing
      - "File written submissions" — 21 days after last hearing
      - "File reply to submissions" — 14 days after opponent's submissions
      - "Prepare hearing bundle" — 7 days before hearing
    - **Magistrate Court:**
      - "File defence/response" — 14 days after service
      - "Submit documents" — 3 days before mention
      - "Prepare for mention" — 1 day before mention
    - **Court of Appeal:**
      - "File record of appeal" — 60 days from judgment
      - "File submissions" — 30 days before hearing
      - "File supplementary record" — 14 days before hearing
    - **General (all courts):**
      - "Serve documents on opposing party" — 7 days after filing
      - "File proof of service" — 3 days after service
      - "Follow up on court order" — 14 days after ruling

- [ ] **Task 5: Build Court Rules Management Page** (AC 7)
  - [ ] Create `src/app/(dashboard)/settings/court-rules/page.tsx` (Admin only)
  - [ ] Create `src/lib/queries/court-rules.ts` with `getCourtRules(filters?)`, `getCourtRuleById(id)`, `getActiveCourtRulesByType(courtType, eventType)`
  - [ ] Create `src/lib/actions/court-rules.ts` with CRUD server actions: `createCourtRule`, `updateCourtRule`, `deleteCourtRule`, `toggleCourtRule`
  - [ ] Create `src/lib/validators/court-rule.ts` with Zod schema:
    - `courtType` (required, enum: High Court, Magistrate, Court of Appeal, ELC, ELRC, Supreme Court, General)
    - `ruleName` (required, string)
    - `triggerEvent` (required, enum: Hearing Scheduled, Mention Scheduled, Ruling Scheduled, Judgment Delivered, Filing Made, Service Completed)
    - `offsetDays` (required, integer — negative for before, positive for after)
    - `deadlineTitle` (required, string with placeholders: `{{case_number}}`, `{{court_name}}`, `{{event_date}}`)
    - `deadlineDescription` (optional, string)
    - `priority` (required, enum: Low, Medium, High, Urgent)
  - [ ] Display court rules in a DataTable grouped by court type: rule name, trigger event, offset (e.g., "+14 days" or "-3 days"), deadline title, priority badge, active toggle
  - [ ] Build create/edit form (react-hook-form + Zod)
  - [ ] Show offset with clear UI: radio for "Before" / "After" the trigger event, number input for days

- [ ] **Task 6: Integrate Court Rules with Calendar Events** (AC 6)
  - [ ] Update the calendar event creation server action (`src/lib/actions/calendar-events.ts` or equivalent):
    - After creating a court date event (where `isCourtDate = true` or event type is Court Date/Hearing/Mention/Ruling), call `applyCourtRules()` with the court event data
    - Pass the court type from the associated case's court information
    - Pass the event type (Hearing, Mention, Ruling, etc.)
  - [ ] Auto-generated deadlines should be linked to the source court event (for traceability)
  - [ ] If the court event is rescheduled (date changed), update the auto-generated deadline dates proportionally
  - [ ] If the court event is deleted, prompt to delete the associated auto-generated deadlines

- [ ] **Task 7: Court Rules Engine Execution Logging** (AC 4)
  - [ ] Log each court rule execution in the `workflow_execution_log` table:
    - Rule name/ID
    - Trigger: "Court event scheduled: [event type] on [date] for case [number]"
    - Action: "Created deadline: [title] due [date]"
    - Status: success/failure
  - [ ] Show court rules executions in the workflow execution log alongside other workflow executions

## Dev Notes

- **Architecture:** The court rules engine is a specialized sub-system of the workflow engine. While the general workflow engine uses trigger-condition-action pattern with JSONB config, the court rules engine has a dedicated table (`court_rule_templates`) with structured fields for deadline calculation. This separation keeps the court rules focused and performant.
- **Court Rules vs. Workflow Rules:** Court rules auto-create deadlines based on date arithmetic from court events. General workflow rules respond to broader system events with configurable actions. They are complementary: a court rule creates a deadline, which then can trigger a workflow rule (e.g., "Deadline Approaching" -> "Send Notification").
- **Date Calculation:** Use simple date arithmetic: `new Date(eventDate.getTime() + offsetDays * 24 * 60 * 60 * 1000)`. Consider business days for some rules (exclude weekends and Kenyan public holidays) as a future enhancement. For initial implementation, use calendar days.
- **Kenya Court Practice:** The seeded court rules are based on common Kenya civil procedure timelines. They should be treated as reasonable defaults that admins customize based on their firm's practice and the specific court's local rules. The Magistrate Court rules typically have shorter timelines than High Court.
- **Rescheduling:** When a court date is changed, the engine should:
  1. Find all auto-generated deadlines linked to the original court event
  2. Recalculate their due dates based on the new court date
  3. Update the deadlines
  4. Log the updates
  This prevents stale deadlines when court dates shift (which is very common in Kenya).
- **Pre-Built Templates:** Pre-built workflow templates are seeded with `isSystem: true`. Admin can activate/deactivate and modify action config but cannot change the trigger logic or delete system templates. This ensures critical automation cannot be accidentally removed.
- **Idempotent Seeding:** Both pre-built workflow templates and court rule templates should be seeded idempotently. Use `INSERT ... ON CONFLICT (name) DO NOTHING` or check existence before insert.

### Project Structure Notes

**Files to Create:**
- `src/lib/workflows/court-rules-engine.ts` — Court rules evaluation and deadline creation
- `src/app/(dashboard)/settings/court-rules/page.tsx` — Court rules management page
- `src/components/forms/court-rule-form.tsx` — Court rule create/edit form
- `src/lib/queries/court-rules.ts` — Court rule query functions
- `src/lib/actions/court-rules.ts` — Court rule CRUD server actions
- `src/lib/validators/court-rule.ts` — Zod schema for court rules
- `src/lib/db/schema/court-rules.ts` — Court rule templates table schema (if not in existing schema)

**Files to Modify:**
- `src/lib/db/seed.ts` — Add pre-built workflow templates and default court rule templates
- `src/app/(dashboard)/settings/workflows/page.tsx` — Display system templates with badge, restrict delete
- `src/lib/actions/calendar-events.ts` — Integrate court rules engine on court event creation
- `src/lib/db/schema/` — Add `court_rule_templates` table if not already defined

### References

- [Source: epics.md — Epic 16, Story 16.2: Pre-Built Templates & Court Rules Engine]
- [Source: a.md — Module 22: Automated Workflows — Pre-built workflow templates]
- [Source: a.md — Best Practices from Clio — Court rules engine: auto-calculate deadlines from court dates]
- [Source: a.md — Module 7: Calendar & Deadlines — Statute of limitations warnings, Court Rules Engine]
- [Source: epics.md — Story 8.2: Calendar Events CRUD & Deadline Tracker — Court Rules Engine: auto-calculate deadlines]
- [Source: a.md — Module 16: Kenya Court & E-Filing Integration — Court date types, court hierarchy]
- [Source: a.md — Kenya Legal Requirements — Mandatory Compliance Features]

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
