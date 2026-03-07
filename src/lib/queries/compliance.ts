import { db } from "@/lib/db";
import { practisingCertificates, cpdRecords, attorneys } from "@/lib/db/schema/attorneys";
import { users } from "@/lib/db/schema/auth";
import { eq, and, sql, desc, lte, gte } from "drizzle-orm";

export async function getAttorneyCertificates(organizationId: string, attorneyId: string) {
  return db
    .select()
    .from(practisingCertificates)
    .where(and(eq(practisingCertificates.organizationId, organizationId), eq(practisingCertificates.attorneyId, attorneyId)))
    .orderBy(desc(practisingCertificates.year));
}

export async function getAttorneyCpdRecords(organizationId: string, attorneyId: string, year?: number) {
  const currentYear = year ?? new Date().getFullYear();
  return db
    .select()
    .from(cpdRecords)
    .where(
      and(
        eq(cpdRecords.organizationId, organizationId),
        eq(cpdRecords.attorneyId, attorneyId),
        eq(cpdRecords.year, String(currentYear))
      )
    )
    .orderBy(desc(cpdRecords.completionDate));
}

export async function getCpdSummary(organizationId: string, attorneyId: string, year?: number) {
  const currentYear = year ?? new Date().getFullYear();

  const totalResult = await db
    .select({
      total: sql<number>`coalesce(sum(${cpdRecords.units}::numeric), 0)::float`,
    })
    .from(cpdRecords)
    .where(
      and(
        eq(cpdRecords.organizationId, organizationId),
        eq(cpdRecords.attorneyId, attorneyId),
        eq(cpdRecords.year, String(currentYear))
      )
    );

  const lskResult = await db
    .select({
      total: sql<number>`coalesce(sum(${cpdRecords.units}::numeric), 0)::float`,
    })
    .from(cpdRecords)
    .where(
      and(
        eq(cpdRecords.organizationId, organizationId),
        eq(cpdRecords.attorneyId, attorneyId),
        eq(cpdRecords.year, String(currentYear)),
        eq(cpdRecords.isLskProgram, true)
      )
    );

  const totalUnits = totalResult[0]?.total ?? 0;
  const lskProgramUnits = lskResult[0]?.total ?? 0;

  return {
    year: currentYear,
    totalUnits,
    lskProgramUnits,
    requiredTotal: 5,
    requiredLsk: 2,
    isCompliant: totalUnits >= 5 && lskProgramUnits >= 2,
  };
}

export async function getExpiringCertificates(organizationId: string, daysAhead = 60) {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + daysAhead);

  return db
    .select({
      attorneyId: attorneys.id,
      attorneyName: users.name,
      attorneyPhotoUrl: attorneys.photoUrl,
      certificateNumber: practisingCertificates.certificateNumber,
      expiryDate: practisingCertificates.expiryDate,
      year: practisingCertificates.year,
    })
    .from(practisingCertificates)
    .innerJoin(attorneys, eq(practisingCertificates.attorneyId, attorneys.id))
    .innerJoin(users, eq(attorneys.userId, users.id))
    .where(
      and(
        eq(practisingCertificates.organizationId, organizationId),
        gte(practisingCertificates.expiryDate, now),
        lte(practisingCertificates.expiryDate, futureDate),
        eq(practisingCertificates.status, "active")
      )
    )
    .orderBy(practisingCertificates.expiryDate);
}

export async function getNonCompliantCpdAttorneys(organizationId: string, year?: number) {
  const currentYear = year ?? new Date().getFullYear();

  const result = await db.execute<{
    attorney_id: string;
    attorney_name: string;
    attorney_photo_url: string | null;
    total_units: number;
    lsk_units: number;
  }>(sql`
    SELECT
      a.id as attorney_id,
      u.name as attorney_name,
      a.photo_url as attorney_photo_url,
      coalesce(sum(c.units::numeric), 0)::float as total_units,
      coalesce(sum(case when c.is_lsk_program then c.units::numeric else 0 end), 0)::float as lsk_units
    FROM ${attorneys} a
    INNER JOIN ${users} u ON a.user_id = u.id
    LEFT JOIN ${cpdRecords} c ON c.attorney_id = a.id AND c.year = ${String(currentYear)}
    WHERE a.organization_id = ${organizationId}
      AND a.is_active = true
    GROUP BY a.id, u.name, a.photo_url
    HAVING coalesce(sum(c.units::numeric), 0) < 5
       OR coalesce(sum(case when c.is_lsk_program then c.units::numeric else 0 end), 0) < 2
  `);

  return result.rows ?? [];
}
