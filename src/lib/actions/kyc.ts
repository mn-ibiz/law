"use server";

import { db } from "@/lib/db";
import { kycDocuments, clientRiskAssessments } from "@/lib/db/schema/clients";
import { auth } from "@/lib/auth/auth";
import { createAuditLog } from "@/lib/utils/audit";
import { riskAssessmentSchema } from "@/lib/validators/kyc";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function verifyKycDocument(docId: string, status: "verified" | "rejected", notes?: string) {
  const session = await auth();
  if (!session?.user || !["admin", "attorney"].includes(session.user.role as string)) {
    return { error: "Unauthorized" };
  }

  await db
    .update(kycDocuments)
    .set({
      status,
      verifiedBy: session.user.id as string,
      verifiedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(kycDocuments.id, docId));

  await createAuditLog(
    session.user.id as string,
    "update",
    "kyc_document",
    docId,
    { status, notes }
  );

  return { success: true };
}

export async function addRiskAssessment(clientId: string, data: unknown) {
  const session = await auth();
  if (!session?.user || !["admin", "attorney"].includes(session.user.role as string)) {
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
      assessedBy: session.user.id as string,
    })
    .returning();

  await createAuditLog(
    session.user.id as string,
    "create",
    "risk_assessment",
    result[0].id,
    { clientId, ...validated.data }
  );

  revalidatePath(`/clients/${clientId}`);
  return { data: result[0] };
}
