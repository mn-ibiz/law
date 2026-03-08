"use server";

import { db } from "@/lib/db";
import { courts, courtFilings, courtStations, causeLists, causeListEntries, courtRules } from "@/lib/db/schema/courts";
import { bringUps, deadlines } from "@/lib/db/schema/calendar";
import { getTenantContext } from "@/lib/auth/get-session";
import { createAuditLog } from "@/lib/utils/audit";
import { createCourtSchema, updateCourtSchema, createFilingSchema, updateFilingStatusSchema, createBringUpSchema, updateBringUpSchema, createServiceOfDocumentSchema, createCauseListSchema, createCauseListEntrySchema, createCourtRuleSchema, updateFilingSchema, updateCourtRuleSchema, updateCauseListSchema, updateCauseListEntrySchema } from "@/lib/validators/court";
import { serviceOfDocuments } from "@/lib/db/schema/courts";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { safeAction } from "@/lib/utils/safe-action";
import { validateId } from "@/lib/utils/validate-id";

export async function createCourt(data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (role !== "super_admin") {
      return { error: "Only platform administrators can manage courts" };
    }

    const validated = createCourtSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const result = await db.insert(courts).values({ ...validated.data }).returning();

    await createAuditLog(organizationId, userId, "create", "court", result[0].id, validated.data);

    revalidatePath("/courts");
    return { data: result[0] };
  });
}

export async function updateCourt(id: string, data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (role !== "super_admin") {
      return { error: "Only platform administrators can manage courts" };
    }

    if (!validateId(id)) return { error: "Invalid ID" };

    const validated = updateCourtSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const result = await db
      .update(courts)
      .set(validated.data)
      .where(eq(courts.id, id))
      .returning();

    if (result.length === 0) {
      return { error: "Court not found" };
    }

    await createAuditLog(organizationId, userId, "update", "court", id, validated.data);

    revalidatePath("/courts");
    return { data: result[0] };
  });
}

export async function toggleCourtActive(id: string) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (role !== "super_admin") {
      return { error: "Only platform administrators can manage courts" };
    }

    if (!validateId(id)) return { error: "Invalid ID" };

    const result = await db
      .update(courts)
      .set({ isActive: sql`NOT ${courts.isActive}` })
      .where(eq(courts.id, id))
      .returning({ id: courts.id, isActive: courts.isActive });

    if (result.length === 0) {
      return { error: "Court not found" };
    }

    await createAuditLog(organizationId, userId, "update", "court", id, {
      action: result[0].isActive ? "activate" : "deactivate",
    });

    revalidatePath("/courts");
    return { success: true };
  });
}

export async function createCourtFiling(data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    const validated = createFilingSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { filingDate, documentUrl, ...rest } = validated.data;

    const result = await db
      .insert(courtFilings)
      .values({
        ...rest,
        organizationId,
        filedBy: userId,
        filingDate: filingDate ? new Date(filingDate) : undefined,
        documentUrl: documentUrl || null,
      })
      .returning();

    revalidatePath("/courts");
    revalidatePath(`/cases/${validated.data.caseId}`);
    return { data: result[0] };
  });
}

export async function updateFilingStatus(filingId: string, data: unknown) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    const validated = updateFilingStatusSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    await db
      .update(courtFilings)
      .set({ status: validated.data.status, updatedAt: new Date() })
      .where(and(eq(courtFilings.id, filingId), eq(courtFilings.organizationId, organizationId)));

    revalidatePath("/courts");
    return { success: true };
  });
}

export async function createServiceOfDocument(data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    const validated = createServiceOfDocumentSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { serviceDate, proofOfServiceUrl, ...rest } = validated.data;

    const result = await db
      .insert(serviceOfDocuments)
      .values({
        ...rest,
        organizationId,
        servedBy: userId,
        serviceDate: serviceDate ? new Date(serviceDate) : undefined,
        proofOfServiceUrl: proofOfServiceUrl || null,
      })
      .returning();

    revalidatePath("/courts");
    return { data: result[0] };
  });
}

export async function updateServiceOfDocument(id: string, data: unknown) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    if (!validateId(id)) return { error: "Invalid ID" };

    const validated = createServiceOfDocumentSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { serviceDate, proofOfServiceUrl, ...rest } = validated.data;

    const result = await db
      .update(serviceOfDocuments)
      .set({
        ...rest,
        serviceDate: serviceDate ? new Date(serviceDate) : null,
        proofOfServiceUrl: proofOfServiceUrl || null,
      })
      .where(and(eq(serviceOfDocuments.id, id), eq(serviceOfDocuments.organizationId, organizationId)))
      .returning();

    if (result.length === 0) {
      return { error: "Service record not found" };
    }

    revalidatePath("/courts");
    return { data: result[0] };
  });
}

export async function deleteServiceOfDocument(id: string) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    if (!validateId(id)) return { error: "Invalid ID" };

    await db.delete(serviceOfDocuments).where(and(eq(serviceOfDocuments.id, id), eq(serviceOfDocuments.organizationId, organizationId)));

    revalidatePath("/courts");
    return { success: true };
  });
}

export async function createBringUp(data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    const validated = createBringUpSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { date, ...rest } = validated.data;

    const result = await db
      .insert(bringUps)
      .values({
        ...rest,
        organizationId,
        date: new Date(date),
        createdBy: userId,
      })
      .returning();

    revalidatePath("/bring-ups");
    revalidatePath(`/cases/${validated.data.caseId}`);
    return { data: result[0] };
  });
}

export async function completeBringUp(id: string) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    if (!validateId(id)) return { error: "Invalid ID" };

    // Atomic conditional update — prevents completing an already-completed bring-up
    const result = await db
      .update(bringUps)
      .set({ status: "completed", completedAt: new Date(), updatedAt: new Date() })
      .where(sql`${bringUps.id} = ${id} AND ${bringUps.organizationId} = ${organizationId} AND ${bringUps.status} != 'completed'`)
      .returning({ id: bringUps.id });

    if (result.length === 0) {
      return { error: "Bring-up not found or already completed" };
    }

    revalidatePath("/bring-ups");
    return { success: true };
  });
}

export async function updateBringUp(id: string, data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    if (!validateId(id)) return { error: "Invalid ID" };

    const validated = updateBringUpSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { date, ...rest } = validated.data;

    // Only allow editing pending bring-ups — atomic conditional update
    const result = await db
      .update(bringUps)
      .set({
        ...rest,
        assignedTo: validated.data.assignedTo || null,
        date: new Date(date),
        updatedAt: new Date(),
      })
      .where(sql`${bringUps.id} = ${id} AND ${bringUps.organizationId} = ${organizationId} AND ${bringUps.status} = 'pending'`)
      .returning({ id: bringUps.id });

    if (result.length === 0) {
      return { error: "Bring-up not found or cannot be edited (not in pending status)" };
    }

    await createAuditLog(organizationId, userId, "update", "bring_up", id, validated.data);

    revalidatePath("/bring-ups");
    return { success: true };
  });
}

// --- Court Stations ---
const courtStationSchema = z.object({
  courtId: z.string().uuid("Invalid court ID"),
  name: z.string().min(1, "Name is required"),
  location: z.string().optional(),
  county: z.string().optional(),
  isActive: z.boolean().default(true),
});

export async function createCourtStation(data: unknown) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "super_admin") {
      return { error: "Only platform administrators can manage court stations" };
    }

    const validated = courtStationSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const result = await db.insert(courtStations).values({ ...validated.data }).returning();

    revalidatePath("/courts");
    return { data: result[0] };
  });
}

export async function updateCourtStation(id: string, data: unknown) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "super_admin") {
      return { error: "Only platform administrators can manage court stations" };
    }

    const validated = courtStationSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    await db.update(courtStations).set(validated.data).where(eq(courtStations.id, id));

    revalidatePath("/courts");
    return { success: true };
  });
}

export async function deleteBringUp(id: string) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    if (!validateId(id)) return { error: "Invalid ID" };

    await db.delete(bringUps).where(and(eq(bringUps.id, id), eq(bringUps.organizationId, organizationId)));
    revalidatePath("/bring-ups");
    return { success: true };
  });
}

export async function dismissBringUp(id: string) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    if (!validateId(id)) return { error: "Invalid ID" };

    const result = await db
      .update(bringUps)
      .set({ status: "dismissed", updatedAt: new Date() })
      .where(sql`${bringUps.id} = ${id} AND ${bringUps.organizationId} = ${organizationId} AND ${bringUps.status} != 'dismissed'`)
      .returning({ id: bringUps.id });

    if (result.length === 0) {
      return { error: "Bring-up not found or already dismissed" };
    }

    revalidatePath("/bring-ups");
    return { success: true };
  });
}

export async function toggleCourtStationActive(id: string) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "super_admin") {
      return { error: "Only platform administrators can manage court stations" };
    }

    if (!validateId(id)) return { error: "Invalid ID" };

    await db.update(courtStations).set({ isActive: sql`NOT ${courtStations.isActive}` }).where(eq(courtStations.id, id));

    revalidatePath("/courts");
    return { success: true };
  });
}

// --- Cause Lists ---

export async function createCauseList(data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    const validated = createCauseListSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { date, ...rest } = validated.data;

    const result = await db
      .insert(causeLists)
      .values({
        ...rest,
        organizationId,
        date: new Date(date),
        createdBy: userId,
      })
      .returning();

    revalidatePath("/cause-lists");
    return { data: result[0] };
  });
}

export async function addCauseListEntry(data: unknown) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    const validated = createCauseListEntrySchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const result = await db
      .insert(causeListEntries)
      .values({ ...validated.data, organizationId })
      .returning();

    revalidatePath("/cause-lists");
    return { data: result[0] };
  });
}

// --- Court Rules ---

export async function createCourtRule(data: unknown) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") {
      return { error: "Unauthorized" };
    }

    const validated = createCourtRuleSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const result = await db.insert(courtRules).values({ ...validated.data, organizationId }).returning();

    revalidatePath("/settings/court-rules");
    return { data: result[0] };
  });
}

export async function deleteCourtRule(id: string) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") {
      return { error: "Unauthorized" };
    }

    if (!validateId(id)) return { error: "Invalid ID" };

    await db.delete(courtRules).where(and(eq(courtRules.id, id), eq(courtRules.organizationId, organizationId)));
    revalidatePath("/settings/court-rules");
    return { success: true };
  });
}

export async function toggleCourtRuleActive(id: string) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") {
      return { error: "Unauthorized" };
    }

    if (!validateId(id)) return { error: "Invalid ID" };

    await db
      .update(courtRules)
      .set({ isActive: sql`NOT ${courtRules.isActive}`, updatedAt: new Date() })
      .where(and(eq(courtRules.id, id), eq(courtRules.organizationId, organizationId)));

    revalidatePath("/settings/court-rules");
    return { success: true };
  });
}

// --- Court Filing: Update & Delete ---

export async function updateCourtFiling(id: string, data: unknown) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    if (!validateId(id)) return { error: "Invalid ID" };

    const validated = updateFilingSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { filingDate, ...rest } = validated.data;

    const result = await db
      .update(courtFilings)
      .set({
        ...rest,
        filingDate: filingDate ? new Date(filingDate) : null,
        updatedAt: new Date(),
      })
      .where(and(eq(courtFilings.id, id), eq(courtFilings.organizationId, organizationId)))
      .returning();

    if (result.length === 0) {
      return { error: "Filing not found" };
    }

    revalidatePath("/courts");
    revalidatePath(`/cases/${validated.data.caseId}`);
    return { data: result[0] };
  });
}

export async function deleteCourtFiling(id: string) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    if (!validateId(id)) return { error: "Invalid ID" };

    await db.delete(courtFilings).where(and(eq(courtFilings.id, id), eq(courtFilings.organizationId, organizationId)));

    revalidatePath("/courts");
    return { success: true };
  });
}

// --- Court Rules: Update ---

export async function updateCourtRule(id: string, data: unknown) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") {
      return { error: "Unauthorized" };
    }

    if (!validateId(id)) return { error: "Invalid ID" };

    const validated = updateCourtRuleSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const result = await db
      .update(courtRules)
      .set({ ...validated.data, updatedAt: new Date() })
      .where(and(eq(courtRules.id, id), eq(courtRules.organizationId, organizationId)))
      .returning();

    if (result.length === 0) {
      return { error: "Court rule not found" };
    }

    revalidatePath("/settings/court-rules");
    return { data: result[0] };
  });
}

// --- Cause Lists: Update & Delete ---

export async function updateCauseList(id: string, data: unknown) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    if (!validateId(id)) return { error: "Invalid ID" };

    const validated = updateCauseListSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { date, ...rest } = validated.data;

    const result = await db
      .update(causeLists)
      .set({
        ...rest,
        date: new Date(date),
        updatedAt: new Date(),
      })
      .where(and(eq(causeLists.id, id), eq(causeLists.organizationId, organizationId)))
      .returning();

    if (result.length === 0) {
      return { error: "Cause list not found" };
    }

    revalidatePath("/cause-lists");
    return { data: result[0] };
  });
}

export async function deleteCauseList(id: string) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    if (!validateId(id)) return { error: "Invalid ID" };

    await db.delete(causeLists).where(and(eq(causeLists.id, id), eq(causeLists.organizationId, organizationId)));

    revalidatePath("/cause-lists");
    return { success: true };
  });
}

// --- Cause List Entries: Update & Delete ---

export async function updateCauseListEntry(id: string, data: unknown) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    if (!validateId(id)) return { error: "Invalid ID" };

    const validated = updateCauseListEntrySchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const result = await db
      .update(causeListEntries)
      .set({ ...validated.data, updatedAt: new Date() })
      .where(and(eq(causeListEntries.id, id), eq(causeListEntries.organizationId, organizationId)))
      .returning();

    if (result.length === 0) {
      return { error: "Entry not found" };
    }

    revalidatePath("/cause-lists");
    return { data: result[0] };
  });
}

export async function deleteCauseListEntry(id: string) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    if (!validateId(id)) return { error: "Invalid ID" };

    await db.delete(causeListEntries).where(and(eq(causeListEntries.id, id), eq(causeListEntries.organizationId, organizationId)));

    revalidatePath("/cause-lists");
    return { success: true };
  });
}

export async function generateDeadlinesFromCourtDate(
  caseId: string,
  hearingDate: Date,
  courtId: string | null,
  assignedTo: string,
  organizationId?: string
) {
  // If no organizationId passed, get it from tenant context
  let orgId = organizationId;
  if (!orgId) {
    const ctx = await getTenantContext();
    orgId = ctx.organizationId;
  }

  // Find applicable court rules
  const conditions = [eq(courtRules.isActive, true), eq(courtRules.organizationId, orgId)];
  if (courtId) {
    conditions.push(
      sql`(${courtRules.courtId} = ${courtId} OR ${courtRules.courtId} IS NULL)`
    );
  } else {
    conditions.push(sql`${courtRules.courtId} IS NULL`);
  }

  const rules = await db
    .select()
    .from(courtRules)
    .where(and(...conditions));

  if (rules.length === 0) return [];

  const deadlineValues = rules.map((rule) => {
    const dueDate = new Date(hearingDate);
    dueDate.setDate(dueDate.getDate() + rule.offsetDays);
    return {
      organizationId: orgId!,
      title: rule.deadlineTitle,
      description: `Auto-generated from court rule: ${rule.name}`,
      caseId,
      assignedTo,
      dueDate,
      priority: rule.priority as "low" | "medium" | "high" | "critical",
      isStatutory: rule.isStatutory,
    };
  });

  const result = await db.insert(deadlines).values(deadlineValues).returning();
  return result;
}
