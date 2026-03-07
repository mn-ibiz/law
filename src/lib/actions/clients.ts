"use server";

import { db } from "@/lib/db";
import { clients, clientContacts, kycDocuments, clientRiskAssessments } from "@/lib/db/schema/clients";
import { auth } from "@/lib/auth/auth";
import { createAuditLog } from "@/lib/utils/audit";
import { createClientSchema, updateClientSchema, createContactLogSchema, createKycDocumentSchema, updateKycDocumentSchema, createRiskAssessmentSchema } from "@/lib/validators/client";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { safeAction } from "@/lib/utils/safe-action";
import { validateId } from "@/lib/utils/validate-id";
import { z } from "zod";

export async function createClient(data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
      return { error: "Unauthorized" };
    }

    const validated = createClientSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { dateOfBirth, followUpDate, ...rest } = validated.data;

    const result = await db
      .insert(clients)
      .values({
        ...rest,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      })
      .returning();

    await createAuditLog(
      session.user.id,
      "create",
      "client",
      result[0].id,
      { new: validated.data }
    );

    revalidatePath("/clients");
    return { data: result[0] };
  });
}

export async function updateClient(id: string, data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
      return { error: "Unauthorized" };
    }

    const validated = updateClientSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { dateOfBirth, followUpDate, ...rest } = validated.data;

    const result = await db
      .update(clients)
      .set({
        ...rest,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        followUpDate: followUpDate ? new Date(followUpDate) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, id))
      .returning();

    await createAuditLog(
      session.user.id,
      "update",
      "client",
      id,
      { updated: validated.data }
    );

    revalidatePath("/clients");
    revalidatePath(`/clients/${id}`);
    return { data: result[0] };
  });
}

export async function deactivateClient(id: string) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return { error: "Unauthorized" };
    }

    if (!validateId(id)) return { error: "Invalid ID" };

    await db
      .update(clients)
      .set({ status: "inactive", updatedAt: new Date() })
      .where(eq(clients.id, id));

    await createAuditLog(
      session.user.id,
      "update",
      "client",
      id,
      { action: "deactivate" }
    );

    revalidatePath("/clients");
    return { success: true };
  });
}

export async function addContactLog(clientId: string, data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
      return { error: "Unauthorized" };
    }

    const validated = createContactLogSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const result = await db
      .insert(clientContacts)
      .values({
        clientId,
        contactedBy: session.user.id,
        type: validated.data.type,
        subject: validated.data.subject,
        notes: validated.data.notes,
        contactDate: new Date(validated.data.contactDate),
      })
      .returning();

    revalidatePath(`/clients/${clientId}`);
    return { data: result[0] };
  });
}

// --- Contact Log CRUD ---

export async function updateContactLog(contactId: string, clientId: string, data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
      return { error: "Unauthorized" };
    }
    if (!validateId(contactId) || !validateId(clientId)) return { error: "Invalid ID" };

    const validated = createContactLogSchema.safeParse(data);
    if (!validated.success) return { error: validated.error.issues[0].message };

    await db
      .update(clientContacts)
      .set({
        type: validated.data.type,
        subject: validated.data.subject,
        notes: validated.data.notes,
        contactDate: new Date(validated.data.contactDate),
      })
      .where(and(eq(clientContacts.id, contactId), eq(clientContacts.clientId, clientId)));

    revalidatePath(`/clients/${clientId}`);
    return { success: true };
  });
}

export async function deleteContactLog(contactId: string, clientId: string) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
      return { error: "Unauthorized" };
    }
    if (!validateId(contactId) || !validateId(clientId)) return { error: "Invalid ID" };

    await db.delete(clientContacts).where(and(eq(clientContacts.id, contactId), eq(clientContacts.clientId, clientId)));
    revalidatePath(`/clients/${clientId}`);
    return { success: true };
  });
}

// --- KYC Document CRUD ---

export async function addKycDocument(clientId: string, data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
      return { error: "Unauthorized" };
    }
    if (!validateId(clientId)) return { error: "Invalid ID" };

    const validated = createKycDocumentSchema.safeParse(data);
    if (!validated.success) return { error: validated.error.issues[0].message };

    const result = await db
      .insert(kycDocuments)
      .values({
        clientId,
        documentType: validated.data.documentType,
        documentNumber: validated.data.documentNumber,
        expiryDate: validated.data.expiryDate ? new Date(validated.data.expiryDate) : undefined,
      })
      .returning();

    revalidatePath(`/clients/${clientId}`);
    return { data: result[0] };
  });
}

export async function updateKycDocument(docId: string, clientId: string, data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
      return { error: "Unauthorized" };
    }
    if (!validateId(docId) || !validateId(clientId)) return { error: "Invalid ID" };

    const validated = updateKycDocumentSchema.safeParse(data);
    if (!validated.success) return { error: validated.error.issues[0].message };

    const { expiryDate, status, ...rest } = validated.data;

    await db
      .update(kycDocuments)
      .set({
        ...rest,
        status: status ?? undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        verifiedBy: status === "verified" ? session.user.id : undefined,
        verifiedAt: status === "verified" ? new Date() : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(kycDocuments.id, docId), eq(kycDocuments.clientId, clientId)));

    revalidatePath(`/clients/${clientId}`);
    return { success: true };
  });
}

export async function deleteKycDocument(docId: string, clientId: string) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
      return { error: "Unauthorized" };
    }
    if (!validateId(docId) || !validateId(clientId)) return { error: "Invalid ID" };

    await db.delete(kycDocuments).where(and(eq(kycDocuments.id, docId), eq(kycDocuments.clientId, clientId)));
    revalidatePath(`/clients/${clientId}`);
    return { success: true };
  });
}

// --- Risk Assessment CRUD ---

export async function addRiskAssessment(clientId: string, data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
      return { error: "Unauthorized" };
    }
    if (!validateId(clientId)) return { error: "Invalid ID" };

    const validated = createRiskAssessmentSchema.safeParse(data);
    if (!validated.success) return { error: validated.error.issues[0].message };

    const result = await db
      .insert(clientRiskAssessments)
      .values({
        clientId,
        riskLevel: validated.data.riskLevel,
        factors: validated.data.factors,
        notes: validated.data.notes,
        assessedBy: session.user.id,
      })
      .returning();

    revalidatePath(`/clients/${clientId}`);
    return { data: result[0] };
  });
}

export async function updateRiskAssessment(assessmentId: string, clientId: string, data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
      return { error: "Unauthorized" };
    }
    if (!validateId(assessmentId) || !validateId(clientId)) return { error: "Invalid ID" };

    const validated = createRiskAssessmentSchema.safeParse(data);
    if (!validated.success) return { error: validated.error.issues[0].message };

    await db
      .update(clientRiskAssessments)
      .set({
        riskLevel: validated.data.riskLevel,
        factors: validated.data.factors,
        notes: validated.data.notes,
        assessedBy: session.user.id,
        updatedAt: new Date(),
      })
      .where(and(eq(clientRiskAssessments.id, assessmentId), eq(clientRiskAssessments.clientId, clientId)));

    revalidatePath(`/clients/${clientId}`);
    return { success: true };
  });
}

export async function deleteRiskAssessment(assessmentId: string, clientId: string) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
      return { error: "Unauthorized" };
    }
    if (!validateId(assessmentId) || !validateId(clientId)) return { error: "Invalid ID" };

    await db.delete(clientRiskAssessments).where(and(eq(clientRiskAssessments.id, assessmentId), eq(clientRiskAssessments.clientId, clientId)));
    revalidatePath(`/clients/${clientId}`);
    return { success: true };
  });
}

// --- Pipeline ---

export async function updateClientPipelineStage(clientId: string, status: string) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
      return { error: "Unauthorized" };
    }

    const statusSchema = z.enum(["active", "inactive", "prospective"]);
    const parsed = statusSchema.safeParse(status);
    if (!parsed.success) return { error: "Invalid status" };

    if (!validateId(clientId)) return { error: "Invalid ID" };

    await db
      .update(clients)
      .set({ status: parsed.data, updatedAt: new Date() })
      .where(eq(clients.id, clientId));

    revalidatePath("/clients");
    revalidatePath("/clients/pipeline");
    return { success: true };
  });
}
