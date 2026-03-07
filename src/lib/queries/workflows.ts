import { db } from "@/lib/db";
import { workflowTemplates, workflowRules, workflowExecutionLog } from "@/lib/db/schema/workflows";
import { users } from "@/lib/db/schema/auth";
import { eq, desc, and } from "drizzle-orm";

export async function getWorkflowTemplates(organizationId: string) {
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
    .where(eq(workflowTemplates.organizationId, organizationId))
    .orderBy(desc(workflowTemplates.createdAt));
}

export async function getWorkflowTemplateById(organizationId: string, id: string) {
  const result = await db
    .select()
    .from(workflowTemplates)
    .where(and(eq(workflowTemplates.organizationId, organizationId), eq(workflowTemplates.id, id)))
    .limit(1);
  return result[0] ?? null;
}

export async function getWorkflowRules(organizationId: string, templateId: string) {
  // workflowRules doesn't have organizationId — scope through parent template
  return db
    .select({
      id: workflowRules.id,
      templateId: workflowRules.templateId,
      actionType: workflowRules.actionType,
      actionConfig: workflowRules.actionConfig,
      conditionConfig: workflowRules.conditionConfig,
      order: workflowRules.order,
      createdAt: workflowRules.createdAt,
    })
    .from(workflowRules)
    .innerJoin(workflowTemplates, eq(workflowRules.templateId, workflowTemplates.id))
    .where(and(eq(workflowTemplates.organizationId, organizationId), eq(workflowRules.templateId, templateId)))
    .orderBy(workflowRules.order);
}

export async function getWorkflowExecutionLog(organizationId: string, templateId?: string) {
  // workflowExecutionLog doesn't have organizationId — scope through parent template
  const baseCondition = eq(workflowTemplates.organizationId, organizationId);

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
    .innerJoin(workflowTemplates, eq(workflowExecutionLog.templateId, workflowTemplates.id))
    .orderBy(desc(workflowExecutionLog.executedAt));

  if (templateId) {
    return query.where(and(baseCondition, eq(workflowExecutionLog.templateId, templateId)));
  }
  return query.where(baseCondition);
}
