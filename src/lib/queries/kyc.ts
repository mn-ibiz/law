import { db } from "@/lib/db";
import { kycDocuments, clientRiskAssessments } from "@/lib/db/schema/clients";
import { users } from "@/lib/db/schema/auth";
import { eq, and, sql, desc, lte } from "drizzle-orm";

export async function getClientKycDocuments(organizationId: string, clientId: string) {
  return db
    .select({
      id: kycDocuments.id,
      documentType: kycDocuments.documentType,
      documentNumber: kycDocuments.documentNumber,
      fileUrl: kycDocuments.fileUrl,
      status: kycDocuments.status,
      verifiedAt: kycDocuments.verifiedAt,
      expiryDate: kycDocuments.expiryDate,
      createdAt: kycDocuments.createdAt,
      verifiedByName: users.name,
    })
    .from(kycDocuments)
    .leftJoin(users, eq(kycDocuments.verifiedBy, users.id))
    .where(and(eq(kycDocuments.organizationId, organizationId), eq(kycDocuments.clientId, clientId)))
    .orderBy(desc(kycDocuments.createdAt));
}

export async function getClientRiskAssessment(organizationId: string, clientId: string) {
  const result = await db
    .select()
    .from(clientRiskAssessments)
    .where(and(eq(clientRiskAssessments.organizationId, organizationId), eq(clientRiskAssessments.clientId, clientId)))
    .orderBy(desc(clientRiskAssessments.createdAt))
    .limit(1);
  return result[0] ?? null;
}

export async function getKycComplianceStats(organizationId: string) {
  const [pendingKyc, expiredDocs, riskDistribution] = await Promise.all([
    db
      .select({ count: sql<number>`count(distinct ${kycDocuments.clientId})::int` })
      .from(kycDocuments)
      .where(and(eq(kycDocuments.organizationId, organizationId), eq(kycDocuments.status, "pending"))),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(kycDocuments)
      .where(
        and(
          eq(kycDocuments.organizationId, organizationId),
          eq(kycDocuments.status, "verified"),
          lte(kycDocuments.expiryDate, new Date())
        )
      ),
    db
      .select({
        riskLevel: clientRiskAssessments.riskLevel,
        count: sql<number>`count(*)::int`,
      })
      .from(clientRiskAssessments)
      .where(eq(clientRiskAssessments.organizationId, organizationId))
      .groupBy(clientRiskAssessments.riskLevel),
  ]);

  return {
    pendingKyc: pendingKyc[0]?.count ?? 0,
    expiredDocs: expiredDocs[0]?.count ?? 0,
    riskDistribution,
  };
}
