import { cache } from "react";
import { db } from "@/lib/db";
import { cases, caseAssignments, caseNotes, caseTimeline, caseParties, pipelineStages } from "@/lib/db/schema/cases";
import { clients } from "@/lib/db/schema/clients";
import { users } from "@/lib/db/schema/auth";
import { eq, ilike, or, and, sql, desc, asc, inArray } from "drizzle-orm";

interface CaseFilters {
  search?: string;
  status?: string;
  priority?: string;
  clientId?: string;
  assignedTo?: string;
  page?: number;
  limit?: number;
}

export async function getCases(organizationId: string, filters: CaseFilters = {}) {
  const { search, status, priority, clientId, page = 1, limit = 20 } = filters;

  const conditions = [eq(cases.organizationId, organizationId)];
  if (status) conditions.push(eq(cases.status, status as "open" | "in_progress" | "hearing" | "resolved" | "closed" | "archived"));
  if (priority) conditions.push(eq(cases.priority, priority as "low" | "medium" | "high" | "urgent"));
  if (clientId) conditions.push(eq(cases.clientId, clientId));

  if (search) {
    const escaped = search.replace(/[%_\\]/g, "\\$&");
    conditions.push(
      or(
        ilike(cases.title, `%${escaped}%`),
        ilike(cases.caseNumber, `%${escaped}%`),
        ilike(cases.fileNumber, `%${escaped}%`),
        ilike(cases.opposingParty, `%${escaped}%`)
      )!
    );
  }

  const query = db
    .select({
      id: cases.id,
      caseNumber: cases.caseNumber,
      fileNumber: cases.fileNumber,
      title: cases.title,
      status: cases.status,
      priority: cases.priority,
      caseType: cases.caseType,
      billingType: cases.billingType,
      dateFiled: cases.dateFiled,
      clientName: sql<string>`COALESCE(${clients.firstName}, '') || ' ' || COALESCE(${clients.lastName}, '')`,
      clientPhotoUrl: clients.photoUrl,
      clientId: cases.clientId,
      createdAt: cases.createdAt,
    })
    .from(cases)
    .innerJoin(clients, eq(cases.clientId, clients.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(cases.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  const result = await query;

  const countResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(cases)
    .innerJoin(clients, eq(cases.clientId, clients.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return {
    data: result,
    total: countResult[0]?.count ?? 0,
    page,
    limit,
  };
}

export async function getCaseStats(organizationId: string) {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [result] = await db
    .select({
      total: sql<number>`count(*)::int`,
      open: sql<number>`count(*) FILTER (WHERE ${cases.status} IN ('open', 'in_progress', 'hearing'))::int`,
      highPriority: sql<number>`count(*) FILTER (WHERE ${cases.priority} IN ('high', 'urgent'))::int`,
      closedThisMonth: sql<number>`count(*) FILTER (WHERE ${cases.status} = 'closed' AND ${cases.updatedAt} >= ${firstOfMonth.toISOString()})::int`,
    })
    .from(cases)
    .where(eq(cases.organizationId, organizationId));

  return result ?? { total: 0, open: 0, highPriority: 0, closedThisMonth: 0 };
}

export const getCaseById = cache(async (organizationId: string, id: string) => {
  const result = await db
    .select({
      id: cases.id,
      caseNumber: cases.caseNumber,
      fileNumber: cases.fileNumber,
      title: cases.title,
      status: cases.status,
      priority: cases.priority,
      caseType: cases.caseType,
      practiceArea: cases.practiceArea,
      billingType: cases.billingType,
      hourlyRate: cases.hourlyRate,
      flatFeeAmount: cases.flatFeeAmount,
      contingencyPercentage: cases.contingencyPercentage,
      courtName: cases.courtName,
      courtCaseNumber: cases.courtCaseNumber,
      judge: cases.judge,
      opposingCounsel: cases.opposingCounsel,
      opposingParty: cases.opposingParty,
      statuteOfLimitations: cases.statuteOfLimitations,
      dateFiled: cases.dateFiled,
      estimatedValue: cases.estimatedValue,
      description: cases.description,
      notes: cases.notes,
      clientId: cases.clientId,
      clientName: sql<string>`COALESCE(${clients.firstName}, '') || ' ' || COALESCE(${clients.lastName}, '')`,
      createdAt: cases.createdAt,
      updatedAt: cases.updatedAt,
    })
    .from(cases)
    .innerJoin(clients, eq(cases.clientId, clients.id))
    .where(and(eq(cases.organizationId, organizationId), eq(cases.id, id)))
    .limit(1);

  return result[0] ?? null;
});

export async function getCaseAssignments(organizationId: string, caseId: string) {
  return db
    .select({
      id: caseAssignments.id,
      role: caseAssignments.role,
      assignedAt: caseAssignments.assignedAt,
      userName: users.name,
      userAvatar: users.avatar,
      userId: caseAssignments.userId,
    })
    .from(caseAssignments)
    .innerJoin(users, eq(caseAssignments.userId, users.id))
    .where(and(eq(caseAssignments.organizationId, organizationId), eq(caseAssignments.caseId, caseId), sql`${caseAssignments.unassignedAt} IS NULL`))
    .orderBy(asc(caseAssignments.assignedAt));
}

export async function getCaseNotes(organizationId: string, caseId: string) {
  return db
    .select({
      id: caseNotes.id,
      content: caseNotes.content,
      isPrivate: caseNotes.isPrivate,
      createdAt: caseNotes.createdAt,
      authorName: users.name,
    })
    .from(caseNotes)
    .innerJoin(users, eq(caseNotes.authorId, users.id))
    .where(and(eq(caseNotes.organizationId, organizationId), eq(caseNotes.caseId, caseId)))
    .orderBy(desc(caseNotes.createdAt))
    .limit(200);
}

export async function getCaseTimeline(organizationId: string, caseId: string) {
  return db
    .select({
      id: caseTimeline.id,
      eventType: caseTimeline.eventType,
      title: caseTimeline.title,
      description: caseTimeline.description,
      isAutoGenerated: caseTimeline.isAutoGenerated,
      createdAt: caseTimeline.createdAt,
      userName: users.name,
    })
    .from(caseTimeline)
    .leftJoin(users, eq(caseTimeline.userId, users.id))
    .where(and(eq(caseTimeline.organizationId, organizationId), eq(caseTimeline.caseId, caseId)))
    .orderBy(desc(caseTimeline.createdAt))
    .limit(200);
}

export async function getCaseParties(organizationId: string, caseId: string) {
  return db
    .select()
    .from(caseParties)
    .where(and(eq(caseParties.organizationId, organizationId), eq(caseParties.caseId, caseId)))
    .orderBy(asc(caseParties.createdAt));
}

export async function getPipelineStages(organizationId: string) {
  return db
    .select()
    .from(pipelineStages)
    .where(eq(pipelineStages.organizationId, organizationId))
    .orderBy(asc(pipelineStages.order));
}

export async function getCasesByPipelineStage(organizationId: string, practiceAreaId?: string | null) {
  // Fetch stages filtered by practice area (null = default/universal stages)
  const stageCondition = practiceAreaId
    ? and(eq(pipelineStages.organizationId, organizationId), eq(pipelineStages.practiceAreaId, practiceAreaId))
    : and(eq(pipelineStages.organizationId, organizationId), sql`${pipelineStages.practiceAreaId} IS NULL`);

  const stages = await db
    .select()
    .from(pipelineStages)
    .where(stageCondition)
    .orderBy(pipelineStages.order);

  if (stages.length === 0) return [];

  const stageIds = stages.map((s) => s.id);

  const allCases = await db
    .select({
      id: cases.id,
      caseNumber: cases.caseNumber,
      title: cases.title,
      status: cases.status,
      priority: cases.priority,
      pipelineStageId: cases.pipelineStageId,
      stageEnteredAt: cases.stageEnteredAt,
      clientName: sql<string>`COALESCE(${clients.firstName} || ' ' || ${clients.lastName}, 'Unknown')`,
    })
    .from(cases)
    .leftJoin(clients, eq(cases.clientId, clients.id))
    .where(and(eq(cases.organizationId, organizationId), inArray(cases.pipelineStageId, stageIds)));

  // Group cases by pipeline stage
  const casesByStage = new Map<string, typeof allCases>();
  for (const c of allCases) {
    const stageId = c.pipelineStageId!;
    if (!casesByStage.has(stageId)) {
      casesByStage.set(stageId, []);
    }
    const stageCases = casesByStage.get(stageId)!;
    if (stageCases.length < 50) {
      stageCases.push(c);
    }
  }

  return stages.map((stage) => ({
    ...stage,
    cases: casesByStage.get(stage.id) ?? [],
  }));
}

export async function generateCaseNumber(organizationId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `CASE-${year}-`;
  const [result] = await db
    .select({ maxNum: sql<string>`MAX(${cases.caseNumber})` })
    .from(cases)
    .where(and(eq(cases.organizationId, organizationId), sql`${cases.caseNumber} LIKE ${prefix + '%'}`));

  const maxNum = result?.maxNum;
  let next = 1;
  if (maxNum) {
    const parts = maxNum.split("-");
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) next = lastNum + 1;
  }
  return `${prefix}${String(next).padStart(4, "0")}`;
}

/** Lightweight case list for select dropdowns (id, caseNumber, title) */
export async function getCaseOptions(organizationId: string) {
  return db
    .select({
      id: cases.id,
      caseNumber: cases.caseNumber,
      title: cases.title,
    })
    .from(cases)
    .where(eq(cases.organizationId, organizationId))
    .orderBy(desc(cases.createdAt));
}
