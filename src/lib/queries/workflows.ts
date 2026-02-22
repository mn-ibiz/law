import { db } from "@/lib/db";
import { workflowTemplates, workflowRules, workflowExecutionLog } from "@/lib/db/schema/workflows";
import { users } from "@/lib/db/schema/auth";
import { eq, desc } from "drizzle-orm";

export async function getWorkflowTemplates() {
  return db
    .select({
      id: workflowTemplates.id,
      name: workflowTemplates.name,
      description: workflowTemplates.description,
      triggerType: workflowTemplates.triggerType,
      isActive: workflowTemplates.isActive,
      createdByName: users.name,
      createdAt: workflowTemplates.createdAt,
    })
    .from(workflowTemplates)
    .leftJoin(users, eq(workflowTemplates.createdBy, users.id))
    .orderBy(desc(workflowTemplates.createdAt));
}

export async function getWorkflowTemplateById(id: string) {
  const result = await db
    .select()
    .from(workflowTemplates)
    .where(eq(workflowTemplates.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function getWorkflowRules(templateId: string) {
  return db
    .select()
    .from(workflowRules)
    .where(eq(workflowRules.templateId, templateId))
    .orderBy(workflowRules.order);
}

export async function getWorkflowExecutionLog(templateId?: string) {
  const query = db
    .select({
      id: workflowExecutionLog.id,
      templateId: workflowExecutionLog.templateId,
      templateName: workflowTemplates.name,
      ruleId: workflowExecutionLog.ruleId,
      triggeredBy: workflowExecutionLog.triggeredBy,
      status: workflowExecutionLog.status,
      details: workflowExecutionLog.details,
      executedAt: workflowExecutionLog.executedAt,
    })
    .from(workflowExecutionLog)
    .leftJoin(workflowTemplates, eq(workflowExecutionLog.templateId, workflowTemplates.id))
    .orderBy(desc(workflowExecutionLog.executedAt));

  if (templateId) {
    return query.where(eq(workflowExecutionLog.templateId, templateId));
  }
  return query;
}
