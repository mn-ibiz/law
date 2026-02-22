import { db } from "@/lib/db";
import { courts, courtStations, courtFilings, serviceOfDocuments } from "@/lib/db/schema/courts";
import { cases } from "@/lib/db/schema/cases";
import { users } from "@/lib/db/schema/auth";
import { eq, desc, asc, sql, and } from "drizzle-orm";

export async function getCourts() {
  return db
    .select()
    .from(courts)
    .where(eq(courts.isActive, true))
    .orderBy(asc(courts.level), asc(courts.name));
}

export async function getCourtStations(courtId: string) {
  return db
    .select()
    .from(courtStations)
    .where(and(eq(courtStations.courtId, courtId), eq(courtStations.isActive, true)))
    .orderBy(asc(courtStations.name));
}

export async function getCourtFilings(caseId: string) {
  return db
    .select({
      id: courtFilings.id,
      filingType: courtFilings.filingType,
      filingNumber: courtFilings.filingNumber,
      status: courtFilings.status,
      filingDate: courtFilings.filingDate,
      notes: courtFilings.notes,
      createdAt: courtFilings.createdAt,
      courtName: courts.name,
      filedByName: users.name,
    })
    .from(courtFilings)
    .leftJoin(courts, eq(courtFilings.courtId, courts.id))
    .innerJoin(users, eq(courtFilings.filedBy, users.id))
    .where(eq(courtFilings.caseId, caseId))
    .orderBy(desc(courtFilings.createdAt));
}

export async function getCourtHierarchy() {
  const courtList = await db.select().from(courts).where(eq(courts.isActive, true)).orderBy(asc(courts.level));
  const stationList = await db.select().from(courtStations).where(eq(courtStations.isActive, true));

  return courtList.map((court) => ({
    ...court,
    stations: stationList.filter((s) => s.courtId === court.id),
  }));
}
