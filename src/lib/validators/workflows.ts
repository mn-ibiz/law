import { z } from "zod";

export const createWorkflowTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  triggerType: z.enum([
    "case_status_change",
    "deadline_approaching",
    "document_uploaded",
    "invoice_created",
    "payment_received",
    "task_completed",
    "manual",
  ]),
  triggerConfig: z.string().optional(),
});

export type CreateWorkflowTemplateInput = z.infer<typeof createWorkflowTemplateSchema>;

export const createWorkflowRuleSchema = z.object({
  templateId: z.string().uuid(),
  actionType: z.enum([
    "send_email",
    "send_sms",
    "create_task",
    "update_status",
    "send_notification",
    "assign_attorney",
  ]),
  actionConfig: z.string().optional(),
  conditionConfig: z.string().optional(),
  order: z.string().optional(),
});

export type CreateWorkflowRuleInput = z.infer<typeof createWorkflowRuleSchema>;
