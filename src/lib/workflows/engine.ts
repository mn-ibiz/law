import { db } from "@/lib/db";
import {
  workflowTemplates,
  workflowRules,
  workflowExecutionLog,
} from "@/lib/db/schema/workflows";
import { eq, and } from "drizzle-orm";

export interface WorkflowContext {
  organizationId: string;
  entityId: string;
  entityType: string;
  userId?: string;
  data?: Record<string, unknown>;
}

type TriggerType =
  | "case_status_change"
  | "deadline_approaching"
  | "document_uploaded"
  | "invoice_created"
  | "payment_received"
  | "task_completed"
  | "manual";

export async function dispatchWorkflowEvent(
  triggerType: TriggerType,
  context: WorkflowContext
): Promise<void> {
  try {
    // 1. Find active templates matching this trigger
    const templates = await db
      .select()
      .from(workflowTemplates)
      .where(
        and(
          eq(workflowTemplates.organizationId, context.organizationId),
          eq(workflowTemplates.triggerType, triggerType),
          eq(workflowTemplates.isActive, true)
        )
      );

    for (const template of templates) {
      // 2. Check trigger config conditions if any
      if (template.triggerConfig) {
        try {
          const config = JSON.parse(template.triggerConfig) as Record<string, unknown>;
          if (!evaluateCondition(config, context)) continue;
        } catch {
          // Invalid config, skip this template
          continue;
        }
      }

      // 3. Get rules for this template, ordered
      const rules = await db
        .select()
        .from(workflowRules)
        .where(eq(workflowRules.templateId, template.id))
        .orderBy(workflowRules.order);

      // 4. Execute each rule
      for (const rule of rules) {
        // Check rule-level conditions
        if (rule.conditionConfig) {
          try {
            const condition = JSON.parse(rule.conditionConfig) as Record<string, unknown>;
            if (!evaluateCondition(condition, context)) continue;
          } catch {
            continue;
          }
        }

        try {
          await executeAction(rule.actionType, rule.actionConfig, context);

          // Log success
          await db.insert(workflowExecutionLog).values({
            templateId: template.id,
            ruleId: rule.id,
            triggeredBy: context.userId ?? "system",
            status: "success",
            details: JSON.stringify({
              triggerType,
              context: {
                entityId: context.entityId,
                entityType: context.entityType,
              },
            }),
          });
        } catch (error) {
          // Log failure but don't block the caller
          await db
            .insert(workflowExecutionLog)
            .values({
              templateId: template.id,
              ruleId: rule.id,
              triggeredBy: context.userId ?? "system",
              status: "error",
              details: String(error),
            })
            .catch(console.error);
        }
      }
    }
  } catch (error) {
    console.error("Workflow dispatch error:", error);
  }
}

function evaluateCondition(
  config: Record<string, unknown>,
  context: WorkflowContext
): boolean {
  if (!config || typeof config !== "object") return true;

  const { entityType, status, ...rest } = config;

  if (entityType && entityType !== context.entityType) return false;
  if (status && context.data?.status !== status) return false;

  // Check additional conditions against context.data
  for (const [key, value] of Object.entries(rest)) {
    if (context.data && context.data[key] !== value) return false;
  }

  return true;
}

async function executeAction(
  actionType: string,
  actionConfig: string | null,
  context: WorkflowContext
): Promise<void> {
  const config = actionConfig
    ? (JSON.parse(actionConfig) as Record<string, unknown>)
    : {};

  switch (actionType) {
    case "send_email":
      await handleSendEmail(config, context);
      break;
    case "send_sms":
      await handleSendSMS(config, context);
      break;
    case "create_task":
      await handleCreateTask(config, context);
      break;
    case "send_notification":
      await handleSendNotification(config, context);
      break;
    case "update_status":
      await handleUpdateStatus(config, context);
      break;
    case "assign_attorney":
      // Future implementation
      console.warn("assign_attorney action not yet implemented");
      break;
    default:
      console.warn(`Unknown workflow action type: ${actionType}`);
  }
}

async function handleSendEmail(
  config: Record<string, unknown>,
  context: WorkflowContext
): Promise<void> {
  const { sendEmail } = await import("@/lib/email/send-email");
  const to = (config.to as string) ?? (context.data?.email as string);
  const subject =
    (config.subject as string) ?? `Notification: ${context.entityType}`;
  const html =
    (config.html as string) ??
    `<p>A workflow event was triggered for ${context.entityType} (${context.entityId}).</p>`;

  if (to) {
    await sendEmail({ to, subject, html });
  }
}

async function handleSendSMS(
  config: Record<string, unknown>,
  context: WorkflowContext
): Promise<void> {
  const { sendSMS } = await import("@/lib/sms/send-sms");
  const to = (config.to as string) ?? (context.data?.phone as string);
  const message =
    (config.message as string) ??
    `Notification for ${context.entityType}`;

  if (to) {
    await sendSMS({ organizationId: context.organizationId, to, message, userId: context.userId });
  }
}

async function handleCreateTask(
  config: Record<string, unknown>,
  context: WorkflowContext
): Promise<void> {
  const { tasks } = await import("@/lib/db/schema/calendar");
  const dueDays =
    typeof config.dueDays === "number" ? config.dueDays : 3;

  await db.insert(tasks).values({
    organizationId: context.organizationId,
    title:
      (config.title as string) ?? `Follow up: ${context.entityType}`,
    description:
      (config.description as string) ??
      `Auto-created by workflow for ${context.entityId}`,
    caseId:
      context.entityType === "case"
        ? context.entityId
        : ((context.data?.caseId as string) ?? null),
    assignedTo: (config.assignTo as string) ?? context.userId ?? null,
    createdBy: context.userId ?? "00000000-0000-0000-0000-000000000000",
    dueDate: new Date(Date.now() + dueDays * 86400000),
    status: "pending",
  });
}

async function handleSendNotification(
  config: Record<string, unknown>,
  context: WorkflowContext
): Promise<void> {
  const { notifications } = await import("@/lib/db/schema/messaging");
  const userId = (config.userId as string) ?? context.userId;
  if (!userId) return;

  await db.insert(notifications).values({
    organizationId: context.organizationId,
    userId,
    type:
      (config.type as
        | "info"
        | "warning"
        | "deadline"
        | "assignment"
        | "billing"
        | "system") ?? "info",
    title: (config.title as string) ?? "Workflow notification",
    message:
      (config.message as string) ??
      `An event occurred for ${context.entityType}`,
  });
}

async function handleUpdateStatus(
  config: Record<string, unknown>,
  context: WorkflowContext
): Promise<void> {
  const newStatus = config.status as string;
  if (!newStatus) return;

  if (context.entityType === "case") {
    const { cases } = await import("@/lib/db/schema/cases");
    await db
      .update(cases)
      .set({
        status: newStatus as
          | "open"
          | "in_progress"
          | "hearing"
          | "resolved"
          | "closed"
          | "archived",
        updatedAt: new Date(),
      })
      .where(eq(cases.id, context.entityId));
  }
}
