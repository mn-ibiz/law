import { db } from "@/lib/db";
import { documents, documentVersions, documentTemplates } from "@/lib/db/schema/documents";
import { cases } from "@/lib/db/schema/cases";
import { users } from "@/lib/db/schema/auth";
import { eq, desc, ilike, or, and } from "drizzle-orm";

interface DocFilters {
  search?: string;
  caseId?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export async function getDocuments(filters: DocFilters = {}) {
  const { search, caseId, category, page = 1, limit = 20 } = filters;
  const conditions = [];
  if (caseId) conditions.push(eq(documents.caseId, caseId));
  if (category) conditions.push(eq(documents.category, category as "pleading" | "correspondence" | "contract" | "evidence" | "court_order" | "filing" | "template" | "other"));
  if (search) {
    const escaped = search.replace(/[%_\\]/g, "\\$&");
    conditions.push(or(ilike(documents.title, `%${escaped}%`), ilike(documents.fileName, `%${escaped}%`)));
  }

  const result = await db
    .select({
      id: documents.id,
      title: documents.title,
      category: documents.category,
      status: documents.status,
      description: documents.description,
      fileName: documents.fileName,
      fileSize: documents.fileSize,
      fileUrl: documents.fileUrl,
      mimeType: documents.mimeType,
      caseId: documents.caseId,
      clientId: documents.clientId,
      createdAt: documents.createdAt,
      caseNumber: cases.caseNumber,
      uploadedByName: users.name,
    })
    .from(documents)
    .leftJoin(cases, eq(documents.caseId, cases.id))
    .innerJoin(users, eq(documents.uploadedBy, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(documents.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  return result;
}

export async function getDocumentTemplates() {
  return db.select().from(documentTemplates).orderBy(desc(documentTemplates.createdAt)).limit(200);
}

export async function getDocumentVersions(documentId: string) {
  return db
    .select({
      id: documentVersions.id,
      versionNumber: documentVersions.versionNumber,
      fileName: documentVersions.fileName,
      fileSize: documentVersions.fileSize,
      changeNotes: documentVersions.changeNotes,
      createdAt: documentVersions.createdAt,
      uploadedByName: users.name,
    })
    .from(documentVersions)
    .innerJoin(users, eq(documentVersions.uploadedBy, users.id))
    .where(eq(documentVersions.documentId, documentId))
    .orderBy(desc(documentVersions.versionNumber));
}

export async function getPendingReviewDocuments() {
  return db
    .select({
      id: documents.id,
      title: documents.title,
      fileName: documents.fileName,
      fileUrl: documents.fileUrl,
      category: documents.category,
      description: documents.description,
      reviewStatus: documents.reviewStatus,
      createdAt: documents.createdAt,
      uploaderName: users.name,
    })
    .from(documents)
    .innerJoin(users, eq(documents.uploadedBy, users.id))
    .where(eq(documents.reviewStatus, "pending_review"))
    .orderBy(desc(documents.createdAt));
}
