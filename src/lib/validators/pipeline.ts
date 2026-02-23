import { z } from "zod";

export const pipelineStageSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  order: z.number().int().min(0),
  color: z.string().max(20).optional(),
  isDefault: z.boolean().default(false),
  practiceAreaId: z.string().uuid("Invalid practice area").nullable().optional(),
  maxDurationDays: z.number().int().min(1).nullable().optional(),
});

export const stageAutomationSchema = z.object({
  stageId: z.string().uuid("Invalid stage"),
  triggerOn: z.enum(["enter", "exit"]),
  actionType: z.enum(["send_notification", "create_task", "update_status"]),
  actionConfig: z.string().max(2000).optional(),
  isActive: z.boolean().default(true),
});

export type PipelineStageInput = z.infer<typeof pipelineStageSchema>;
export type StageAutomationInput = z.infer<typeof stageAutomationSchema>;
