"use server";

import { db } from "@/lib/db";
import { documents, documentTemplates, documentVersions } from "@/lib/db/schema/documents";
import { clients } from "@/lib/db/schema/clients";
import { getTenantContext } from "@/lib/auth/get-session";
import { createTemplateSchema, createDocumentRecordSchema, createDocumentVersionSchema, clientUploadDocumentSchema, updateDocumentSchema } from "@/lib/validators/document";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { safeAction } from "@/lib/utils/safe-action";
import { dispatchWorkflowEvent } from "@/lib/workflows/engine";
import { createAuditLog } from "@/lib/utils/audit";
import { deleteFile, isStorageKey } from "@/lib/storage";
import { organizations } from "@/lib/db/schema/organizations";

export async function createDocumentRecord(data: unknown) {
  return safeAction(async () => {
    const validated = createDocumentRecordSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { organizationId, userId } = await getTenantContext();

    const result = await db
      .insert(documents)
      .values({
        ...validated.data,
        organizationId,
        uploadedBy: userId,
      })
      .returning();

    // Fire workflow event for document upload (fire-and-forget)
    dispatchWorkflowEvent("document_uploaded", {
      organizationId,
      entityId: result[0].id,
      entityType: "document",
      userId,
    }).catch(console.error);

    revalidatePath("/documents");
    return { data: result[0] };
  });
}

export async function updateDocumentStatus(id: string, status: "draft" | "final" | "signed" | "archived") {
  return safeAction(async () => {
    const idParsed = z.string().uuid().safeParse(id);
    if (!idParsed.success) return { error: "Invalid document ID" };

    const statusSchema = z.enum(["draft", "final", "signed", "archived"]);
    const statusParsed = statusSchema.safeParse(status);
    if (!statusParsed.success) return { error: "Invalid status" };

    const { organizationId } = await getTenantContext();

    await db.update(documents).set({ status: statusParsed.data, updatedAt: new Date() }).where(and(eq(documents.id, idParsed.data), eq(documents.organizationId, organizationId)));
    revalidatePath("/documents");
    return { success: true };
  });
}

export async function updateDocument(data: unknown) {
  return safeAction(async () => {
    const validated = updateDocumentSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { organizationId, userId, role } = await getTenantContext();

    const { id, ...fields } = validated.data;

    // Only allow editing own documents unless admin
    if (role !== "admin") {
      const [doc] = await db
        .select({ uploadedBy: documents.uploadedBy })
        .from(documents)
        .where(and(eq(documents.id, id), eq(documents.organizationId, organizationId)))
        .limit(1);
      if (!doc) return { error: "Document not found" };
      if (doc.uploadedBy !== userId) {
        return { error: "You can only edit your own documents" };
      }
    }

    await db
      .update(documents)
      .set({
        ...fields,
        caseId: fields.caseId ?? null,
        clientId: fields.clientId ?? null,
        updatedAt: new Date(),
      })
      .where(and(eq(documents.id, id), eq(documents.organizationId, organizationId)));

    revalidatePath("/documents");
    return { success: true };
  });
}

export async function createTemplate(data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized" };

    const validated = createTemplateSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const result = await db
      .insert(documentTemplates)
      .values({
        ...validated.data,
        organizationId,
        createdBy: userId,
      })
      .returning();

    revalidatePath("/documents/templates");
    return { data: result[0] };
  });
}

export async function deleteDocument(id: string) {
  return safeAction(async () => {
    const idParsed = z.string().uuid().safeParse(id);
    if (!idParsed.success) return { error: "Invalid document ID" };

    const { organizationId, userId, role } = await getTenantContext();

    // Fetch file info (also used for ownership check and cleanup)
    const [docRecord] = await db
      .select({ uploadedBy: documents.uploadedBy, fileUrl: documents.fileUrl, fileSize: documents.fileSize })
      .from(documents)
      .where(and(eq(documents.id, idParsed.data), eq(documents.organizationId, organizationId)))
      .limit(1);

    if (!docRecord) return { error: "Document not found" };

    // Only allow deletion of own uploads (unless admin)
    if (role !== "admin" && docRecord.uploadedBy !== userId) {
      return { error: "You can only delete your own documents" };
    }

    await db.delete(documents).where(and(eq(documents.id, idParsed.data), eq(documents.organizationId, organizationId)));

    // Clean up cloud storage and decrement usage
    if (docRecord.fileUrl && isStorageKey(docRecord.fileUrl)) {
      deleteFile(docRecord.fileUrl).catch(console.error);
      if (docRecord.fileSize && docRecord.fileSize > 0) {
        await db
          .update(organizations)
          .set({
            storageUsedBytes: sql`GREATEST(${organizations.storageUsedBytes} - ${docRecord.fileSize}, 0)`,
            updatedAt: new Date(),
          })
          .where(eq(organizations.id, organizationId));
      }
    }

    revalidatePath("/documents");
    return { success: true };
  });
}

// --- Document Versions ---
export async function createDocumentVersion(data: unknown) {
  return safeAction(async () => {
    const validated = createDocumentVersionSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { organizationId, userId } = await getTenantContext();

    const result = await db
      .insert(documentVersions)
      .values({
        ...validated.data,
        organizationId,
        uploadedBy: userId,
      })
      .returning();

    revalidatePath("/documents");
    return { data: result[0] };
  });
}

// --- Client Document Upload ---
export async function clientUploadDocument(data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId } = await getTenantContext();

    const validated = clientUploadDocumentSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    // Get client record for this user
    const [client] = await db
      .select({ id: clients.id })
      .from(clients)
      .where(and(eq(clients.userId, userId), eq(clients.organizationId, organizationId)))
      .limit(1);

    const result = await db
      .insert(documents)
      .values({
        ...validated.data,
        organizationId,
        uploadedBy: userId,
        clientId: client?.id,
        status: "draft",
        reviewStatus: "pending_review",
      })
      .returning();

    revalidatePath("/portal/documents");
    revalidatePath("/documents/review");
    return { data: result[0] };
  });
}

export async function approveDocument(documentId: string) {
  return safeAction(async () => {
    const idParsed = z.string().uuid().safeParse(documentId);
    if (!idParsed.success) return { error: "Invalid document ID" };

    const { organizationId, userId } = await getTenantContext();

    // Atomic conditional update — only approve documents pending review
    const result = await db
      .update(documents)
      .set({
        reviewStatus: "approved",
        reviewedBy: userId,
        reviewedAt: new Date(),
        status: "final",
        updatedAt: new Date(),
      })
      .where(sql`${documents.id} = ${idParsed.data} AND ${documents.organizationId} = ${organizationId} AND ${documents.reviewStatus} = 'pending_review'`)
      .returning({ id: documents.id });

    if (result.length === 0) {
      return { error: "Document not found or not in pending review status" };
    }

    await createAuditLog(organizationId, userId, "update", "document", idParsed.data, { action: "approve" });

    revalidatePath("/documents/review");
    revalidatePath("/portal/documents");
    return { success: true };
  });
}

export async function rejectDocument(documentId: string, notes: string) {
  return safeAction(async () => {
    const idParsed = z.string().uuid().safeParse(documentId);
    if (!idParsed.success) return { error: "Invalid document ID" };

    const { organizationId, userId } = await getTenantContext();

    const safeNotes = (notes ?? "").slice(0, 5000);

    // Atomic conditional update — only reject documents pending review
    const result = await db
      .update(documents)
      .set({
        reviewStatus: "rejected",
        reviewedBy: userId,
        reviewedAt: new Date(),
        reviewNotes: safeNotes,
        updatedAt: new Date(),
      })
      .where(sql`${documents.id} = ${idParsed.data} AND ${documents.organizationId} = ${organizationId} AND ${documents.reviewStatus} = 'pending_review'`)
      .returning({ id: documents.id });

    if (result.length === 0) {
      return { error: "Document not found or not in pending review status" };
    }

    await createAuditLog(organizationId, userId, "update", "document", idParsed.data, { action: "reject" });

    revalidatePath("/documents/review");
    revalidatePath("/portal/documents");
    return { success: true };
  });
}
