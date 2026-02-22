import { db } from "@/lib/db";
import { disciplinaryRecords, attorneys } from "@/lib/db/schema/attorneys";
import { users } from "@/lib/db/schema/auth";
import { eq, and, sql, desc } from "drizzle-orm";

export async function getAttorneyDisciplinaryRecords(attorneyId: string) {
  return db
    .select()
    .from(disciplinaryRecords)
    .where(eq(disciplinaryRecords.attorneyId, attorneyId))
    .orderBy(desc(disciplinaryRecords.date));
}

export async function getActiveDisciplinaryProceedings(attorneyId: string) {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(disciplinaryRecords)
    .where(
      and(
        eq(disciplinaryRecords.attorneyId, attorneyId),
        eq(disciplinaryRecords.status, "pending")
      )
    );
  return result[0]?.count ?? 0;
}

export async function getAllActiveDisciplinaryProceedings() {
  return db
    .select({
      id: disciplinaryRecords.id,
      attorneyName: users.name,
      caseReference: disciplinaryRecords.caseReference,
      date: disciplinaryRecords.date,
      status: disciplinaryRecords.status,
    })
    .from(disciplinaryRecords)
    .innerJoin(attorneys, eq(disciplinaryRecords.attorneyId, attorneys.id))
    .innerJoin(users, eq(attorneys.userId, users.id))
    .where(eq(disciplinaryRecords.status, "pending"))
    .orderBy(desc(disciplinaryRecords.date));
}
