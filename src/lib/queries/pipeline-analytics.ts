import { db } from "@/lib/db";
import { caseStageHistory, pipelineStages, cases } from "@/lib/db/schema/cases";
import { clients } from "@/lib/db/schema/clients";
import { eq, sql, and, isNotNull } from "drizzle-orm";

export async function getAverageStageDuration(practiceAreaId?: string | null) {
  const paCondition = practiceAreaId
    ? eq(pipelineStages.practiceAreaId, practiceAreaId)
    : sql`${pipelineStages.practiceAreaId} IS NULL`;

  return db
    .select({
      stageId: caseStageHistory.stageId,
      stageName: pipelineStages.name,
      stageOrder: pipelineStages.order,
      stageColor: pipelineStages.color,
      avgDays: sql<number>`ROUND(AVG(EXTRACT(EPOCH FROM (${caseStageHistory.exitedAt} - ${caseStageHistory.enteredAt})) / 86400)::numeric, 1)`,
    })
    .from(caseStageHistory)
    .innerJoin(pipelineStages, eq(caseStageHistory.stageId, pipelineStages.id))
    .where(and(isNotNull(caseStageHistory.exitedAt), paCondition))
    .groupBy(caseStageHistory.stageId, pipelineStages.name, pipelineStages.order, pipelineStages.color)
    .orderBy(pipelineStages.order);
}

export async function getPipelineThroughput(practiceAreaId?: string | null, months = 6) {
  const paCondition = practiceAreaId
    ? eq(pipelineStages.practiceAreaId, practiceAreaId)
    : sql`${pipelineStages.practiceAreaId} IS NULL`;

  return db
    .select({
      month: sql<string>`to_char(${caseStageHistory.enteredAt}, 'YYYY-MM')`,
      stageName: pipelineStages.name,
      stageColor: pipelineStages.color,
      count: sql<number>`count(*)::int`,
    })
    .from(caseStageHistory)
    .innerJoin(pipelineStages, eq(caseStageHistory.stageId, pipelineStages.id))
    .where(
      and(
        paCondition,
        sql`${caseStageHistory.enteredAt} >= NOW() - make_interval(months => ${months})`
      )
    )
    .groupBy(sql`to_char(${caseStageHistory.enteredAt}, 'YYYY-MM')`, pipelineStages.name, pipelineStages.color)
    .orderBy(sql`to_char(${caseStageHistory.enteredAt}, 'YYYY-MM')`);
}

export async function getConversionRate(practiceAreaId?: string | null) {
  const paCondition = practiceAreaId
    ? eq(pipelineStages.practiceAreaId, practiceAreaId)
    : sql`${pipelineStages.practiceAreaId} IS NULL`;

  return db
    .select({
      stageId: caseStageHistory.stageId,
      stageName: pipelineStages.name,
      stageOrder: pipelineStages.order,
      stageColor: pipelineStages.color,
      uniqueCases: sql<number>`COUNT(DISTINCT ${caseStageHistory.caseId})::int`,
    })
    .from(caseStageHistory)
    .innerJoin(pipelineStages, eq(caseStageHistory.stageId, pipelineStages.id))
    .where(paCondition)
    .groupBy(caseStageHistory.stageId, pipelineStages.name, pipelineStages.order, pipelineStages.color)
    .orderBy(pipelineStages.order);
}

export async function getBottleneckCases(practiceAreaId?: string | null) {
  const paCondition = practiceAreaId
    ? eq(pipelineStages.practiceAreaId, practiceAreaId)
    : sql`${pipelineStages.practiceAreaId} IS NULL`;

  return db
    .select({
      caseId: cases.id,
      caseNumber: cases.caseNumber,
      title: cases.title,
      stageName: pipelineStages.name,
      stageColor: pipelineStages.color,
      maxDurationDays: pipelineStages.maxDurationDays,
      stageEnteredAt: cases.stageEnteredAt,
      daysInStage: sql<number>`EXTRACT(EPOCH FROM (NOW() - ${cases.stageEnteredAt}))::int / 86400`,
      clientName: sql<string>`COALESCE(${clients.firstName} || ' ' || ${clients.lastName}, 'Unknown')`,
    })
    .from(cases)
    .innerJoin(pipelineStages, eq(cases.pipelineStageId, pipelineStages.id))
    .leftJoin(clients, eq(cases.clientId, clients.id))
    .where(
      and(
        paCondition,
        isNotNull(cases.stageEnteredAt),
        isNotNull(pipelineStages.maxDurationDays),
        sql`EXTRACT(EPOCH FROM (NOW() - ${cases.stageEnteredAt})) / 86400 > ${pipelineStages.maxDurationDays}`
      )
    )
    .orderBy(sql`EXTRACT(EPOCH FROM (NOW() - ${cases.stageEnteredAt})) DESC`);
}
