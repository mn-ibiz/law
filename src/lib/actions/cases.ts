"use server";

import { db } from "@/lib/db";
import { cases, caseAssignments, caseNotes, caseTimeline, caseParties, pipelineStages, caseStageHistory } from "@/lib/db/schema/cases";
import { clients, conflictChecks } from "@/lib/db/schema/clients";
import { trustAccounts } from "@/lib/db/schema/billing";
import { getTenantContext } from "@/lib/auth/get-session";
import { createAuditLog } from "@/lib/utils/audit";
import { createCaseSchema, updateCaseSchema, createCaseNoteSchema, addCasePartySchema, assignCaseSchema } from "@/lib/validators/case";
import { pipelineStageSchema } from "@/lib/validators/pipeline";
import { generateCaseNumber } from "@/lib/queries/cases";
import { executeStageAutomations } from "@/lib/actions/pipeline";
import { runConflictCheck } from "@/lib/actions/conflicts";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { safeAction } from "@/lib/utils/safe-action";
import { withUniqueRetry } from "@/lib/utils/with-retry";
import { dispatchWorkflowEvent } from "@/lib/workflows/engine";
import { checkPlanLimit } from "@/lib/utils/plan-limits";
import { getOrgConfig } from "@/lib/utils/tenant-config";

async function isAssignedToCase(userId: string, caseId: string, organizationId: string): Promise<boolean> {
  const [assignment] = await db
    .select({ id: caseAssignments.id })
    .from(caseAssignments)
    .where(and(
      eq(caseAssignments.caseId, caseId),
      eq(caseAssignments.userId, userId),
      eq(caseAssignments.organizationId, organizationId),
      sql`${caseAssignments.unassignedAt} IS NULL`
    ))
    .limit(1);
  return !!assignment;
}

export async function createCase(data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    // Check plan limit for cases
    const caseLimit = await checkPlanLimit(organizationId, "cases");
    if (!caseLimit.allowed) {
      return { error: caseLimit.error };
    }

    const validated = createCaseSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { hourlyRate, flatFeeAmount, contingencyPercentage, estimatedValue, statuteOfLimitations, dateFiled, conflictAcknowledged, ...rest } = validated.data;

    // --- Auto Conflict Check ---
    // Look up the client to get their name for conflict search
    const [client] = await db
      .select({ id: clients.id, firstName: clients.firstName, lastName: clients.lastName })
      .from(clients)
      .where(and(eq(clients.id, rest.clientId), eq(clients.organizationId, organizationId)))
      .limit(1);
    if (!client) return { error: "Client not found" };

    const clientName = `${client.firstName} ${client.lastName}`;
    const conflictResult = await runConflictCheck(clientName, organizationId);

    // Also check opposing party if provided
    if (rest.opposingParty) {
      const opposingResult = await runConflictCheck(rest.opposingParty, organizationId);
      for (const m of opposingResult.matches) {
        // Avoid duplicate matches
        const isDuplicate = conflictResult.matches.some(
          (existing) => existing.type === m.type && existing.name === m.name && existing.detail === m.detail
        );
        if (!isDuplicate) {
          conflictResult.matches.push(m);
          conflictResult.hasConflict = true;
        }
      }
    }

    // Store conflict check result regardless
    const severity = conflictResult.hasConflict ? "potential" as const : "clear" as const;
    await db.insert(conflictChecks).values({
      organizationId,
      clientId: client.id,
      searchQuery: rest.opposingParty
        ? `${clientName}; ${rest.opposingParty}`
        : clientName,
      result: severity,
      matchDetails: conflictResult.matches.length > 0
        ? JSON.stringify(conflictResult.matches)
        : null,
      checkedBy: userId,
    });

    // If conflicts found and not acknowledged, return error with conflict details
    if (conflictResult.hasConflict && !conflictAcknowledged) {
      return {
        error: "Conflict detected",
        conflicts: conflictResult.matches,
      };
    }

    // Retry on unique constraint violation (concurrent number generation race)
    const result = await withUniqueRetry(async () => {
      const config = await getOrgConfig(organizationId);
      const caseNumber = await generateCaseNumber(organizationId, config.prefixes.case);
      return await db
        .insert(cases)
        .values({
          ...rest,
          organizationId,
          caseNumber,
          hourlyRate: hourlyRate ? String(hourlyRate) : undefined,
          flatFeeAmount: flatFeeAmount ? String(flatFeeAmount) : undefined,
          contingencyPercentage: contingencyPercentage ? String(contingencyPercentage) : undefined,
          estimatedValue: estimatedValue ? String(estimatedValue) : undefined,
          statuteOfLimitations: statuteOfLimitations ? new Date(statuteOfLimitations) : undefined,
          dateFiled: dateFiled ? new Date(dateFiled) : undefined,
        })
        .returning();
    });

    await db.insert(caseTimeline).values({
      organizationId,
      caseId: result[0].id,
      userId,
      eventType: "case_created",
      title: "Case created",
      description: `Case ${result[0].caseNumber} was created`,
      isAutoGenerated: true,
    });

    await createAuditLog(
      organizationId,
      userId,
      "create",
      "case",
      result[0].id,
      { caseNumber: result[0].caseNumber, ...validated.data }
    );

    revalidatePath("/cases");
    return { data: result[0] };
  });
}

export async function updateCase(id: string, data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    if (role === "attorney") {
      const assigned = await isAssignedToCase(userId, id, organizationId);
      if (!assigned) return { error: "You are not assigned to this case" };
    }

    const validated = updateCaseSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const {
      hourlyRate,
      flatFeeAmount,
      contingencyPercentage,
      estimatedValue,
      statuteOfLimitations,
      dateFiled,
      conflictAcknowledged,
      ...rest
    } = validated.data;
    void conflictAcknowledged;

    const result = await db
      .update(cases)
      .set({
        ...rest,
        hourlyRate: hourlyRate !== undefined ? String(hourlyRate) : undefined,
        flatFeeAmount: flatFeeAmount !== undefined ? String(flatFeeAmount) : undefined,
        contingencyPercentage: contingencyPercentage !== undefined ? String(contingencyPercentage) : undefined,
        estimatedValue: estimatedValue !== undefined ? String(estimatedValue) : undefined,
        statuteOfLimitations: statuteOfLimitations ? new Date(statuteOfLimitations) : undefined,
        dateFiled: dateFiled ? new Date(dateFiled) : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(cases.id, id), eq(cases.organizationId, organizationId)))
      .returning();

    if (validated.data.status) {
      await db.insert(caseTimeline).values({
        organizationId,
        caseId: id,
        userId,
        eventType: "status_change",
        title: `Status changed to ${validated.data.status}`,
        isAutoGenerated: true,
      });

      // Fire workflow event for status change (fire-and-forget)
      dispatchWorkflowEvent("case_status_change", {
        organizationId,
        entityId: id,
        entityType: "case",
        userId,
        data: { status: validated.data.status },
      }).catch(console.error);
    }

    await createAuditLog(
      organizationId,
      userId,
      "update",
      "case",
      id,
      { updated: validated.data }
    );

    revalidatePath("/cases");
    revalidatePath(`/cases/${id}`);
    return { data: result[0] };
  });
}

export async function addCaseNote(caseId: string, data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    if (role === "attorney") {
      const assigned = await isAssignedToCase(userId, caseId, organizationId);
      if (!assigned) return { error: "You are not assigned to this case" };
    }

    const validated = createCaseNoteSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const result = await db
      .insert(caseNotes)
      .values({
        organizationId,
        caseId,
        authorId: userId,
        content: validated.data.content,
        isPrivate: validated.data.isPrivate,
      })
      .returning();

    revalidatePath(`/cases/${caseId}`);
    return { data: result[0] };
  });
}

export async function addCaseParty(caseId: string, data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    if (role === "attorney") {
      const assigned = await isAssignedToCase(userId, caseId, organizationId);
      if (!assigned) return { error: "You are not assigned to this case" };
    }

    const validated = addCasePartySchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const result = await db
      .insert(caseParties)
      .values({
        organizationId,
        caseId,
        ...validated.data,
      })
      .returning();

    revalidatePath(`/cases/${caseId}`);
    return { data: result[0] };
  });
}

export async function assignCase(caseId: string, data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    const validated = assignCaseSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const result = await db
      .insert(caseAssignments)
      .values({
        organizationId,
        caseId,
        userId: validated.data.userId,
        role: validated.data.role,
      })
      .returning();

    await db.insert(caseTimeline).values({
      organizationId,
      caseId,
      userId,
      eventType: "assignment",
      title: `Attorney assigned (${validated.data.role})`,
      isAutoGenerated: true,
    });

    revalidatePath(`/cases/${caseId}`);
    return { data: result[0] };
  });
}

export async function unassignCase(assignmentId: string, caseId: string) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    // Verify assignment exists and belongs to the given case
    const [assignment] = await db
      .select({ id: caseAssignments.id })
      .from(caseAssignments)
      .where(and(eq(caseAssignments.id, assignmentId), eq(caseAssignments.caseId, caseId), eq(caseAssignments.organizationId, organizationId)))
      .limit(1);
    if (!assignment) return { error: "Assignment not found" };

    await db
      .update(caseAssignments)
      .set({ unassignedAt: new Date() })
      .where(and(eq(caseAssignments.id, assignmentId), eq(caseAssignments.organizationId, organizationId)));

    revalidatePath(`/cases/${caseId}`);
    return { success: true };
  });
}

export async function updateCasePipelineStage(caseId: string, stageId: string) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(caseId) || !uuidRegex.test(stageId)) {
      return { error: "Invalid ID" };
    }

    // Fetch current case to get old stage
    const [currentCase] = await db
      .select({ pipelineStageId: cases.pipelineStageId })
      .from(cases)
      .where(and(eq(cases.id, caseId), eq(cases.organizationId, organizationId)))
      .limit(1);
    if (!currentCase) return { error: "Case not found" };

    const now = new Date();
    const fromStageId = currentCase.pipelineStageId;

    // Close old history record if transitioning from a stage
    if (fromStageId) {
      await db
        .update(caseStageHistory)
        .set({ exitedAt: now })
        .where(
          and(
            eq(caseStageHistory.caseId, caseId),
            eq(caseStageHistory.stageId, fromStageId),
            eq(caseStageHistory.organizationId, organizationId),
            sql`${caseStageHistory.exitedAt} IS NULL`
          )
        );
    }

    // Insert new history record
    await db.insert(caseStageHistory).values({
      organizationId,
      caseId,
      stageId,
      enteredAt: now,
      movedBy: userId,
    });

    // Update case
    await db
      .update(cases)
      .set({ pipelineStageId: stageId, stageEnteredAt: now, updatedAt: now })
      .where(and(eq(cases.id, caseId), eq(cases.organizationId, organizationId)));

    // Timeline entry
    await db.insert(caseTimeline).values({
      organizationId,
      caseId,
      userId,
      eventType: "pipeline_stage_change",
      title: "Pipeline stage changed",
      isAutoGenerated: true,
    });

    // Execute automations (fire-and-forget, errors logged not thrown)
    executeStageAutomations(caseId, stageId, fromStageId, userId, organizationId).catch(() => {});

    revalidatePath("/cases");
    revalidatePath("/cases/pipeline");
    return { success: true };
  });
}

export async function updateCaseNote(noteId: string, caseId: string, data: unknown) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    const validated = createCaseNoteSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    await db
      .update(caseNotes)
      .set({
        content: validated.data.content,
        isPrivate: validated.data.isPrivate,
      })
      .where(and(eq(caseNotes.id, noteId), eq(caseNotes.caseId, caseId), eq(caseNotes.organizationId, organizationId)));

    revalidatePath(`/cases/${caseId}`);
    return { success: true };
  });
}

export async function deleteCaseNote(noteId: string, caseId: string) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    await db.delete(caseNotes).where(and(eq(caseNotes.id, noteId), eq(caseNotes.caseId, caseId), eq(caseNotes.organizationId, organizationId)));

    revalidatePath(`/cases/${caseId}`);
    return { success: true };
  });
}

export async function updateCaseParty(partyId: string, caseId: string, data: unknown) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    const validated = addCasePartySchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    await db
      .update(caseParties)
      .set(validated.data)
      .where(and(eq(caseParties.id, partyId), eq(caseParties.caseId, caseId), eq(caseParties.organizationId, organizationId)));

    revalidatePath(`/cases/${caseId}`);
    return { success: true };
  });
}

export async function deleteCaseParty(partyId: string, caseId: string) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    await db.delete(caseParties).where(and(eq(caseParties.id, partyId), eq(caseParties.caseId, caseId), eq(caseParties.organizationId, organizationId)));

    revalidatePath(`/cases/${caseId}`);
    return { success: true };
  });
}

export async function archiveCase(id: string) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return { error: "Invalid ID" };
    }

    if (role === "attorney") {
      const assigned = await isAssignedToCase(userId, id, organizationId);
      if (!assigned) return { error: "You are not assigned to this case" };
    }

    // Check for active trust balance before archiving
    // Get the case's client, then check their trust accounts
    const [caseRecord] = await db
      .select({ clientId: cases.clientId })
      .from(cases)
      .where(and(eq(cases.id, id), eq(cases.organizationId, organizationId)))
      .limit(1);

    if (!caseRecord) {
      return { error: "Case not found" };
    }

    const activeTrustAccounts = await db
      .select({ id: trustAccounts.id, balance: trustAccounts.balance })
      .from(trustAccounts)
      .where(
        and(
          eq(trustAccounts.clientId, caseRecord.clientId),
          eq(trustAccounts.organizationId, organizationId),
          sql`CAST(${trustAccounts.balance} AS numeric) <> 0`
        )
      )
      .limit(1);

    if (activeTrustAccounts.length > 0) {
      return { error: "Cannot archive case with active trust balance" };
    }

    const result = await db
      .update(cases)
      .set({ status: "closed", updatedAt: new Date() })
      .where(and(eq(cases.id, id), eq(cases.organizationId, organizationId)))
      .returning({ id: cases.id });

    if (result.length === 0) {
      return { error: "Case not found" };
    }

    await db.insert(caseTimeline).values({
      organizationId,
      caseId: id,
      userId,
      eventType: "status_change",
      title: "Case archived (closed)",
      isAutoGenerated: true,
    });

    await createAuditLog(organizationId, userId, "update", "case", id, { action: "archive" });

    revalidatePath("/cases");
    revalidatePath(`/cases/${id}`);
    return { success: true };
  });
}

// --- Pipeline Stages ---

export async function createPipelineStage(data: unknown) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") {
      return { error: "Unauthorized" };
    }

    const validated = pipelineStageSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const result = await db.insert(pipelineStages).values({ ...validated.data, organizationId }).returning();

    revalidatePath("/cases/pipeline");
    revalidatePath("/settings");
    return { data: result[0] };
  });
}

export async function updatePipelineStage(id: string, data: unknown) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") {
      return { error: "Unauthorized" };
    }

    const validated = pipelineStageSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    await db.update(pipelineStages).set(validated.data).where(and(eq(pipelineStages.id, id), eq(pipelineStages.organizationId, organizationId)));

    revalidatePath("/cases/pipeline");
    revalidatePath("/settings");
    return { success: true };
  });
}

export async function deletePipelineStage(id: string) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") {
      return { error: "Unauthorized" };
    }

    await db.delete(pipelineStages).where(and(eq(pipelineStages.id, id), eq(pipelineStages.organizationId, organizationId)));

    revalidatePath("/cases/pipeline");
    revalidatePath("/settings");
    return { success: true };
  });
}
