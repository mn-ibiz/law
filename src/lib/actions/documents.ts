"use server";

import { db } from "@/lib/db";
import { documents, documentTemplates, documentVersions } from "@/lib/db/schema/documents";
import { auth } from "@/lib/auth/auth";
import { createTemplateSchema, createDocumentRecordSchema, createDocumentVersionSchema } from "@/lib/validators/document";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { safeAction } from "@/lib/utils/safe-action";

export async function createDocumentRecord(data: unknown) {
  return safeAction(async () => {
    const validated = createDocumentRecordSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
      return { error: "Unauthorized" };
    }

    const result = await db
      .insert(documents)
      .values({
        ...validated.data,
        uploadedBy: session.user.id,
      })
      .returning();

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

    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
      return { error: "Unauthorized" };
    }

    await db.update(documents).set({ status: statusParsed.data, updatedAt: new Date() }).where(eq(documents.id, idParsed.data));
    revalidatePath("/documents");
    return { success: true };
  });
}

export async function createTemplate(data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return { error: "Unauthorized" };
    }

    const validated = createTemplateSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const result = await db
      .insert(documentTemplates)
      .values({
        ...validated.data,
        createdBy: session.user.id,
      })
      .returning();

    revalidatePath("/documents/templates");
    return { data: result[0] };
  });
}

// --- Document Versions ---
export async function createDocumentVersion(data: unknown) {
  return safeAction(async () => {
    const validated = createDocumentVersionSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
      return { error: "Unauthorized" };
    }

    const result = await db
      .insert(documentVersions)
      .values({
        ...validated.data,
        uploadedBy: session.user.id,
      })
      .returning();

    revalidatePath("/documents");
    return { data: result[0] };
  });
}
