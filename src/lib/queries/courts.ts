import { db } from "@/lib/db";
import { courts, courtStations, courtFilings, serviceOfDocuments, causeLists, causeListEntries, courtRules } from "@/lib/db/schema/courts";
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

export async function getCourtFilings(organizationId: string, caseId: string) {
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
    .where(and(eq(courtFilings.organizationId, organizationId), eq(courtFilings.caseId, caseId)))
    .orderBy(desc(courtFilings.createdAt));
}

export async function getAllCourtFilings(organizationId: string) {
  return db
    .select({
      id: courtFilings.id,
      caseId: courtFilings.caseId,
      courtId: courtFilings.courtId,
      filingType: courtFilings.filingType,
      filingNumber: courtFilings.filingNumber,
      status: courtFilings.status,
      filingDate: courtFilings.filingDate,
      documentUrl: courtFilings.documentUrl,
      notes: courtFilings.notes,
      createdAt: courtFilings.createdAt,
      courtName: courts.name,
      caseNumber: cases.caseNumber,
      filedByName: users.name,
    })
    .from(courtFilings)
    .leftJoin(courts, eq(courtFilings.courtId, courts.id))
    .innerJoin(cases, eq(courtFilings.caseId, cases.id))
    .innerJoin(users, eq(courtFilings.filedBy, users.id))
    .where(eq(courtFilings.organizationId, organizationId))
    .orderBy(desc(courtFilings.createdAt))
    .limit(500);
}

export async function getAllServiceOfDocuments(organizationId: string) {
  return db
    .select({
      id: serviceOfDocuments.id,
      documentTitle: serviceOfDocuments.documentTitle,
      servedTo: serviceOfDocuments.servedTo,
      method: serviceOfDocuments.method,
      serviceDate: serviceOfDocuments.serviceDate,
      notes: serviceOfDocuments.notes,
      proofOfServiceUrl: serviceOfDocuments.proofOfServiceUrl,
      caseId: serviceOfDocuments.caseId,
      createdAt: serviceOfDocuments.createdAt,
      caseNumber: cases.caseNumber,
      servedByName: users.name,
    })
    .from(serviceOfDocuments)
    .innerJoin(cases, eq(serviceOfDocuments.caseId, cases.id))
    .leftJoin(users, eq(serviceOfDocuments.servedBy, users.id))
    .where(eq(serviceOfDocuments.organizationId, organizationId))
    .orderBy(desc(serviceOfDocuments.createdAt))
    .limit(500);
}

export async function getCourtHierarchy(includeInactive = false) {
  const courtConditions = includeInactive ? undefined : eq(courts.isActive, true);
  const courtList = await db.select().from(courts).where(courtConditions).orderBy(asc(courts.level));
  const stationList = await db.select().from(courtStations).where(eq(courtStations.isActive, true));

  return courtList.map((court) => ({
    ...court,
    stations: stationList.filter((s) => s.courtId === court.id),
  }));
}

export async function getCauseLists(organizationId: string, filters: { courtId?: string; dateFrom?: string; dateTo?: string } = {}) {
  const conditions = [eq(causeLists.organizationId, organizationId)];
  if (filters.courtId) conditions.push(eq(causeLists.courtId, filters.courtId));
  if (filters.dateFrom) conditions.push(sql`${causeLists.date} >= ${filters.dateFrom}`);
  if (filters.dateTo) conditions.push(sql`${causeLists.date} <= ${filters.dateTo}`);

  return db
    .select({
      id: causeLists.id,
      courtId: causeLists.courtId,
      date: causeLists.date,
      judge: causeLists.judge,
      courtRoom: causeLists.courtRoom,
      notes: causeLists.notes,
      createdAt: causeLists.createdAt,
      courtName: courts.name,
    })
    .from(causeLists)
    .leftJoin(courts, eq(causeLists.courtId, courts.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(causeLists.date));
}

export async function getCauseListEntries(organizationId: string, causeListId: string) {
  return db
    .select()
    .from(causeListEntries)
    .where(and(eq(causeListEntries.organizationId, organizationId), eq(causeListEntries.causeListId, causeListId)))
    .orderBy(causeListEntries.order);
}

export async function getUpcomingCauseLists(organizationId: string, limit = 5) {
  return db
    .select({
      id: causeLists.id,
      date: causeLists.date,
      judge: causeLists.judge,
      courtRoom: causeLists.courtRoom,
      courtName: courts.name,
    })
    .from(causeLists)
    .leftJoin(courts, eq(causeLists.courtId, courts.id))
    .where(and(eq(causeLists.organizationId, organizationId), sql`${causeLists.date} >= NOW()`))
    .orderBy(causeLists.date)
    .limit(limit);
}

export async function getCourtRules(organizationId: string, courtId?: string) {
  const conditions = [eq(courtRules.organizationId, organizationId)];
  if (courtId) conditions.push(eq(courtRules.courtId, courtId));

  return db
    .select({
      id: courtRules.id,
      courtId: courtRules.courtId,
      name: courtRules.name,
      description: courtRules.description,
      triggerEvent: courtRules.triggerEvent,
      offsetDays: courtRules.offsetDays,
      deadlineTitle: courtRules.deadlineTitle,
      priority: courtRules.priority,
      isStatutory: courtRules.isStatutory,
      isActive: courtRules.isActive,
      courtName: courts.name,
    })
    .from(courtRules)
    .leftJoin(courts, eq(courtRules.courtId, courts.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(courtRules.name);
}
