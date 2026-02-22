"use server";

import { db } from "@/lib/db";
import { documents, documentTemplates } from "@/lib/db/schema/documents";
import { auth } from "@/lib/auth/auth";
import { createTemplateSchema } from "@/lib/validators/document";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createDocumentRecord(data: {
  title: string;
  category: string;
  caseId?: string;
  clientId?: string;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  description?: string;
}) {
  const session = await auth();
  if (!session?.user || !["admin", "attorney"].includes(session.user.role as string)) {
    return { error: "Unauthorized" };
  }

  const result = await db
    .insert(documents)
    .values({
      ...data,
      category: data.category as "pleading" | "correspondence" | "contract" | "evidence" | "court_order" | "filing" | "template" | "other",
      uploadedBy: session.user.id as string,
    })
    .returning();

  revalidatePath("/documents");
  return { data: result[0] };
}

export async function updateDocumentStatus(id: string, status: "draft" | "final" | "signed" | "archived") {
  const session = await auth();
  if (!session?.user || !["admin", "attorney"].includes(session.user.role as string)) {
    return { error: "Unauthorized" };
  }

  await db.update(documents).set({ status, updatedAt: new Date() }).where(eq(documents.id, id));
  revalidatePath("/documents");
  return { success: true };
}

export async function createTemplate(data: unknown) {
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
      createdBy: session.user.id as string,
    })
    .returning();

  revalidatePath("/documents/templates");
  return { data: result[0] };
}
