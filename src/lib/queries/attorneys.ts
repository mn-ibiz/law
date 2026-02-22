import { db } from "@/lib/db";
import { attorneys, attorneyPracticeAreas, attorneyLicenses } from "@/lib/db/schema/attorneys";
import { users } from "@/lib/db/schema/auth";
import { practiceAreas } from "@/lib/db/schema/settings";
import { eq, ilike, or, and, sql, desc } from "drizzle-orm";

interface AttorneyFilters {
  search?: string;
  status?: string;
  department?: string;
  title?: string;
  page?: number;
  limit?: number;
}

export async function getAttorneys(filters: AttorneyFilters = {}) {
  const { search, status, department, title, page = 1, limit = 20 } = filters;

  const conditions = [];
  if (status === "active") conditions.push(eq(attorneys.isActive, true));
  if (status === "inactive") conditions.push(eq(attorneys.isActive, false));
  if (department) conditions.push(eq(attorneys.department, department));
  if (title) conditions.push(eq(attorneys.title, title as "partner" | "senior_associate" | "associate" | "of_counsel" | "paralegal"));

  if (search) {
    conditions.push(
      or(
        ilike(users.name, `%${search}%`),
        ilike(attorneys.barNumber, `%${search}%`),
        ilike(attorneys.lskNumber, `%${search}%`)
      )
    );
  }

  const result = await db
    .select({
      id: attorneys.id,
      userId: attorneys.userId,
      barNumber: attorneys.barNumber,
      jurisdiction: attorneys.jurisdiction,
      title: attorneys.title,
      department: attorneys.department,
      hourlyRate: attorneys.hourlyRate,
      lskNumber: attorneys.lskNumber,
      isActive: attorneys.isActive,
      name: users.name,
      email: users.email,
    })
    .from(attorneys)
    .innerJoin(users, eq(attorneys.userId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(attorneys.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  const countResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(attorneys)
    .innerJoin(users, eq(attorneys.userId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return {
    data: result,
    total: countResult[0]?.count ?? 0,
    page,
    limit,
  };
}

export async function getAttorneyById(id: string) {
  const result = await db
    .select({
      id: attorneys.id,
      userId: attorneys.userId,
      barNumber: attorneys.barNumber,
      jurisdiction: attorneys.jurisdiction,
      title: attorneys.title,
      department: attorneys.department,
      hourlyRate: attorneys.hourlyRate,
      dateAdmitted: attorneys.dateAdmitted,
      bio: attorneys.bio,
      lskNumber: attorneys.lskNumber,
      commissionerForOaths: attorneys.commissionerForOaths,
      notaryPublic: attorneys.notaryPublic,
      seniorCounsel: attorneys.seniorCounsel,
      isActive: attorneys.isActive,
      createdAt: attorneys.createdAt,
      name: users.name,
      email: users.email,
      phone: users.phone,
    })
    .from(attorneys)
    .innerJoin(users, eq(attorneys.userId, users.id))
    .where(eq(attorneys.id, id))
    .limit(1);

  return result[0] ?? null;
}

export async function getAttorneyLicenses(attorneyId: string) {
  return db
    .select()
    .from(attorneyLicenses)
    .where(eq(attorneyLicenses.attorneyId, attorneyId))
    .orderBy(desc(attorneyLicenses.issueDate));
}

export async function getAttorneyPracticeAreas(attorneyId: string) {
  return db
    .select({
      id: attorneyPracticeAreas.id,
      practiceAreaId: attorneyPracticeAreas.practiceAreaId,
      name: practiceAreas.name,
    })
    .from(attorneyPracticeAreas)
    .innerJoin(practiceAreas, eq(attorneyPracticeAreas.practiceAreaId, practiceAreas.id))
    .where(eq(attorneyPracticeAreas.attorneyId, attorneyId));
}

export async function getAvailableUsers() {
  // Users with attorney role that don't already have an attorney profile
  return db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.role, "attorney"));
}
