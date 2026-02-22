"use server";

import { db } from "@/lib/db";
import { kycDocuments, clientRiskAssessments } from "@/lib/db/schema/clients";
import { auth } from "@/lib/auth/auth";
import { createAuditLog } from "@/lib/utils/audit";
import { riskAssessmentSchema, verifyKycDocumentSchema } from "@/lib/validators/kyc";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { safeAction } from "@/lib/utils/safe-action";

export async function verifyKycDocument(docId: string, status: "verified" | "rejected", notes?: string) {
  return safeAction(async () => {
    const docIdParsed = z.string().uuid().safeParse(docId);
    if (!docIdParsed.success) return { error: "Invalid document ID" };

    const validated = verifyKycDocumentSchema.safeParse({ status, notes });
    if (!validated.success) return { error: validated.error.issues[0].message };

    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
      return { error: "Unauthorized" };
    }

    await db
      .update(kycDocuments)
      .set({
        status: validated.data.status,
        verifiedBy: session.user.id,
        verifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(kycDocuments.id, docIdParsed.data));

    await createAuditLog(
      session.user.id,
      "update",
      "kyc_document",
      docIdParsed.data,
      { status: validated.data.status, notes: validated.data.notes }
    );

    revalidatePath("/clients");
    return { success: true };
  });
}

export async function addRiskAssessment(clientId: string, data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
      return { error: "Unauthorized" };
    }

    const validated = riskAssessmentSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

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

    await createAuditLog(
      session.user.id,
      "create",
      "risk_assessment",
      result[0].id,
      { clientId, ...validated.data }
    );

    revalidatePath(`/clients/${clientId}`);
    return { data: result[0] };
  });
}
