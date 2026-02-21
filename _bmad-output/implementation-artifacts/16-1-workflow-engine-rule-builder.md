# Story 16.1: Workflow Engine & Rule Builder

Status: ready-for-dev

## Story

As an Admin,
I want automated workflow rules that trigger actions based on system events,
so that routine follow-ups and notifications happen automatically without manual intervention.

## Acceptance Criteria (ACs)

1. Workflow management page (Admin only) displays a list of all workflow rules showing: name, trigger type, action type, active/inactive status toggle, and last triggered date.
2. Admin can create, edit, and delete workflow rules from the management page.
3. Admin can enable or disable individual workflow rules via an active/inactive toggle without deleting them.
4. Rule creation/edit form includes: name (required), trigger type (required, from predefined list), trigger condition (configurable per trigger type), action type (required, from predefined list), and action configuration (configurable per action type).
5. Supported trigger types are: Case Status Change, Deadline Approaching, Document Uploaded, Payment Received, New Client Created, Bring-Up Due, Certificate Expiring, Invoice Overdue, and Pipeline Stage Change.
6. Supported action types are: Send Notification (in-app), Create Task, Send Email, Send SMS, Update Field, and Create Calendar Event.
7. Trigger conditions are configurable per trigger type (e.g., for "Case Status Change" the admin specifies from-status and to-status; for "Deadline Approaching" the admin specifies days before deadline).
8. Action configuration is specific per action type (e.g., for "Send Email" the admin selects the email template and specifies the recipient role; for "Create Task" the admin specifies the task title, priority, and assignee pattern).
9. Workflow rules are evaluated within server actions when the corresponding trigger events occur; only active rules matching the trigger type and conditions are executed.
10. An execution log is maintained showing: rule name, trigger event, action performed, timestamp, and success/failure status.
11. The execution log is viewable on the workflow management page with filtering by rule, date range, and success/failure.

## Tasks / Subtasks

- [ ] **Task 1: Build Workflow Rules Database Queries** (AC 1, AC 10, AC 11)
  - [ ] Create `src/lib/queries/workflows.ts` with:
    - `getWorkflowRules(filters?)` — list all rules with pagination, filter by active/inactive status
    - `getWorkflowRuleById(id)` — single rule with full config
    - `getActiveRulesByTrigger(triggerType)` — all active rules matching a trigger type
    - `getWorkflowExecutionLog(filters?)` — paginated execution log with filter by rule, date, status
  - [ ] Create `src/lib/queries/workflow-execution-log.ts` for execution log queries

- [ ] **Task 2: Build Workflow Management Page** (AC 1, AC 2, AC 3)
  - [ ] Create `src/app/(dashboard)/settings/workflows/page.tsx` (Admin only)
  - [ ] Display rules in a DataTable: name, trigger type badge, action type badge, active/inactive toggle (shadcn Switch), last triggered date, actions (edit, delete)
  - [ ] Active/inactive toggle calls `toggleWorkflowRule(id, active)` server action and updates immediately
  - [ ] "Create Rule" button opens the rule form
  - [ ] Delete button with confirmation dialog
  - [ ] Add tabs or section for the Execution Log (see Task 6)

- [ ] **Task 3: Build Workflow Rule Form** (AC 4, AC 5, AC 6, AC 7, AC 8)
  - [ ] Create `src/components/forms/workflow-rule-form.tsx` as a multi-step or dynamic form (react-hook-form + Zod)
  - [ ] Create `src/lib/validators/workflow-rule.ts` with Zod schema:
    - `name` (required, string)
    - `triggerType` (required, enum of all trigger types)
    - `triggerCondition` (required, object — shape depends on triggerType)
    - `actionType` (required, enum of all action types)
    - `actionConfig` (required, object — shape depends on actionType)
    - `isActive` (boolean, default true)
  - [ ] **Trigger Type Selection + Condition Configuration:**
    - **Case Status Change:** condition fields — `fromStatus` (dropdown), `toStatus` (dropdown), `caseType` (optional filter)
    - **Deadline Approaching:** condition fields — `daysBefore` (number: 1, 3, 7, 14, 30), `priority` (optional filter), `deadlineType` (optional: SoL, Court, General)
    - **Document Uploaded:** condition fields — `documentCategory` (optional filter), `caseType` (optional filter)
    - **Payment Received:** condition fields — `paymentMethod` (optional filter), `minimumAmount` (optional KES threshold)
    - **New Client Created:** condition fields — `clientType` (optional: Individual/Organization), `riskLevel` (optional filter)
    - **Bring-Up Due:** condition fields — `priority` (optional filter), `daysBefore` (0 = day of, 1 = day before)
    - **Certificate Expiring:** condition fields — `daysBefore` (7, 30, 60), `certificateType` (Practising/CPD)
    - **Invoice Overdue:** condition fields — `daysOverdue` (number: 7, 14, 30, 60, 90)
    - **Pipeline Stage Change:** condition fields — `fromStage` (optional), `toStage` (optional), `practiceArea` (optional)
  - [ ] **Action Type Selection + Configuration:**
    - **Send Notification:** config fields — `recipientRole` (dropdown: Lead Attorney, All Assigned, Admin, Client), `title` (text with placeholders), `message` (text with placeholders)
    - **Create Task:** config fields — `taskTitle` (text with placeholders), `priority` (dropdown), `assigneePattern` (Lead Attorney/Admin/Specific User), `dueDateOffset` (days from trigger, optional)
    - **Send Email:** config fields — `emailTemplateId` (dropdown from email templates), `recipientRole` (dropdown), `attachDocument` (boolean for document-trigger workflows)
    - **Send SMS:** config fields — `smsTemplateId` (dropdown from SMS templates), `recipientRole` (dropdown)
    - **Update Field:** config fields — `entityType` (Case/Client/Invoice), `fieldName` (dropdown per entity), `newValue` (text)
    - **Create Calendar Event:** config fields — `eventTitle` (text with placeholders), `eventType` (dropdown), `durationMinutes` (number), `offsetDays` (days from trigger date), `attendeePattern` (Lead Attorney/All Assigned)

- [ ] **Task 4: Create Workflow Rule CRUD Server Actions** (AC 2, AC 3)
  - [ ] Create `src/lib/actions/workflows.ts` with:
    - `createWorkflowRule(formData)` — validate with Zod, insert into `workflow_templates`/`workflow_rules`
    - `updateWorkflowRule(id, formData)` — validate, update
    - `deleteWorkflowRule(id)` — soft delete or hard delete
    - `toggleWorkflowRule(id, isActive)` — toggle active status
  - [ ] Add audit log entries for all workflow rule mutations

- [ ] **Task 5: Implement Workflow Execution Engine** (AC 9)
  - [ ] Create `src/lib/workflows/engine.ts` with the core engine:
    ```typescript
    async function evaluateWorkflowRules(triggerType: TriggerType, triggerContext: TriggerContext): Promise<void>
    ```
    - Query all active rules matching `triggerType` from `workflow_rules`
    - For each matching rule, evaluate the trigger condition against the `triggerContext`
    - If condition matches, execute the action
    - Log execution result (success/failure) to `workflow_execution_log`
  - [ ] Create `src/lib/workflows/conditions.ts` with condition evaluator functions:
    - `evaluateCondition(triggerType, condition, context): boolean` — dispatches to type-specific evaluators
    - Example: for "Case Status Change", check if `context.fromStatus === condition.fromStatus && context.toStatus === condition.toStatus`
  - [ ] Create `src/lib/workflows/actions.ts` with action executor functions:
    - `executeAction(actionType, actionConfig, context): Promise<ActionResult>` — dispatches to type-specific executors
    - **Send Notification executor:** calls `createNotification()` utility with config data
    - **Create Task executor:** inserts a task into the `tasks` table
    - **Send Email executor:** calls `sendEmailNotification()` from the email service
    - **Send SMS executor:** calls `sendSmsNotification()` from the SMS service
    - **Update Field executor:** updates the specified field on the specified entity
    - **Create Calendar Event executor:** inserts a calendar event
  - [ ] Create `src/lib/workflows/placeholders.ts` to resolve placeholders in action config using trigger context data:
    - Map trigger context to available placeholders: `{{case_number}}`, `{{client_name}}`, `{{attorney_name}}`, `{{date}}`, etc.
  - [ ] **Integration Points:** Add `evaluateWorkflowRules()` calls to relevant server actions:
    - Case status change server action -> trigger `case_status_change` with context
    - Payment recording server action -> trigger `payment_received` with context
    - Document upload server action -> trigger `document_uploaded` with context
    - Client creation server action -> trigger `new_client` with context
    - Pipeline stage change -> trigger `pipeline_stage_change` with context
    - (Other triggers like deadline approaching, bring-up due, certificate expiring are evaluated by cron/scheduled tasks or by the notification service)

- [ ] **Task 6: Build Execution Log Viewer** (AC 10, AC 11)
  - [ ] Add execution log section to `src/app/(dashboard)/settings/workflows/page.tsx` (as a tab or separate section below rules)
  - [ ] Display DataTable: rule name, trigger event description, action performed, timestamp, status badge (success=green, failure=red)
  - [ ] Expandable row or click to view: full trigger context (JSON), full action config (JSON), error message (if failed)
  - [ ] Filters: rule name dropdown, date range, status (success/failure)
  - [ ] Pagination (50 per page)

## Dev Notes

- **Architecture:** The workflow engine follows an event-driven pattern. Server actions are the "event sources" — after performing their primary operation, they call `evaluateWorkflowRules()` which queries for matching rules and executes actions. This is synchronous in the current request cycle but non-critical (workflow execution failure should not block the primary action).
- **Database:** Three tables are involved:
  - `workflow_templates`: pre-built templates (seeded, referenced in Story 16.2)
  - `workflow_rules`: user-created/activated rules with `triggerType`, `triggerCondition` (JSONB), `actionType`, `actionConfig` (JSONB), `isActive`, `lastTriggeredAt`
  - `workflow_execution_log`: `ruleId`, `triggerType`, `triggerContext` (JSONB), `actionType`, `actionResult` (JSONB), `status` (success/failure), `errorMessage`, `createdAt`
- **Condition Evaluation:** Conditions are stored as JSONB and evaluated at runtime. The evaluator uses a switch/dispatch pattern based on trigger type. Keep conditions simple (equality checks, numeric comparisons) to avoid complexity.
- **Action Execution:** Actions are also dispatched by type. Each action executor is an async function that performs the side effect (create notification, send email, etc.) and returns a result. Failures are caught and logged but do not throw.
- **Error Handling:** Wrap each rule execution in a try-catch. If one rule fails, continue evaluating remaining rules. Log all failures to the execution log.
- **Performance:** Rules are queried per trigger event. For high-frequency triggers (e.g., document upload), keep the rule count reasonable. Index `workflow_rules` on `(triggerType, isActive)`.
- **Placeholder Resolution:** Action configs can contain `{{placeholder}}` patterns. Before executing an action, run the config through the placeholder resolver using the trigger context data.

### Project Structure Notes

**Files to Create:**
- `src/app/(dashboard)/settings/workflows/page.tsx` — Workflow management page with rules and execution log
- `src/components/forms/workflow-rule-form.tsx` — Dynamic workflow rule form
- `src/lib/queries/workflows.ts` — Workflow rule query functions
- `src/lib/queries/workflow-execution-log.ts` — Execution log queries
- `src/lib/actions/workflows.ts` — Workflow CRUD server actions
- `src/lib/validators/workflow-rule.ts` — Zod schemas for workflow rules
- `src/lib/workflows/engine.ts` — Core workflow evaluation engine
- `src/lib/workflows/conditions.ts` — Trigger condition evaluators
- `src/lib/workflows/actions.ts` — Action executors
- `src/lib/workflows/placeholders.ts` — Placeholder resolution for action configs
- `src/types/workflows.ts` — Workflow type definitions (TriggerType, ActionType, TriggerContext, etc.)

**Files to Modify:**
- Various server actions — Add `evaluateWorkflowRules()` integration calls
- `src/lib/db/schema/` — Verify `workflow_templates`, `workflow_rules`, `workflow_execution_log` tables

### References

- [Source: epics.md — Epic 16, Story 16.1: Workflow Engine & Rule Builder]
- [Source: a.md — Module 22: Automated Workflows — Rule-based automation engine, trigger types, action types]
- [Source: a.md — Database — workflow_templates, workflow_rules, workflow_execution_log tables in Workflows domain]
- [Source: a.md — Best Practices from Clio — Automated workflows reduce manual follow-up by 40%+]
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
