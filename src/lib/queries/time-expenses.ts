import { db } from "@/lib/db";
import { timeEntries, expenses, requisitions } from "@/lib/db/schema/time-expenses";
import { cases } from "@/lib/db/schema/cases";
import { users } from "@/lib/db/schema/auth";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";

interface TimeFilters {
  userId?: string;
  caseId?: string;
  startDate?: Date;
  endDate?: Date;
}

export async function getTimeEntries(organizationId: string, filters: TimeFilters = {}) {
  const conditions = [eq(timeEntries.organizationId, organizationId)];
  if (filters.userId) conditions.push(eq(timeEntries.userId, filters.userId));
  if (filters.caseId) conditions.push(eq(timeEntries.caseId, filters.caseId));
  if (filters.startDate) conditions.push(gte(timeEntries.date, filters.startDate));
  if (filters.endDate) conditions.push(lte(timeEntries.date, filters.endDate));

  return db
    .select({
      id: timeEntries.id,
      caseId: timeEntries.caseId,
      description: timeEntries.description,
      date: timeEntries.date,
      hours: timeEntries.hours,
      rate: timeEntries.rate,
      amount: timeEntries.amount,
      isBillable: timeEntries.isBillable,
      isBilled: timeEntries.isBilled,
      caseNumber: cases.caseNumber,
      caseTitle: cases.title,
      userName: users.name,
      userAvatar: users.avatar,
    })
    .from(timeEntries)
    .leftJoin(cases, eq(timeEntries.caseId, cases.id))
    .innerJoin(users, eq(timeEntries.userId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(timeEntries.date));
}

export async function getWeeklyTimesheet(organizationId: string, userId: string, weekStart: Date) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  return getTimeEntries(organizationId, { userId, startDate: weekStart, endDate: weekEnd });
}

export async function getWeeklyTimeEntries(organizationId: string, userId: string, weekStart: string, weekEnd: string) {
  return db
    .select({
      id: timeEntries.id,
      caseId: timeEntries.caseId,
      date: timeEntries.date,
      hours: timeEntries.hours,
      description: timeEntries.description,
      isBillable: timeEntries.isBillable,
    })
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.organizationId, organizationId),
        eq(timeEntries.userId, userId),
        sql`${timeEntries.date} >= ${weekStart}::timestamptz`,
        sql`${timeEntries.date} <= ${weekEnd}::timestamptz`
      )
    )
    .orderBy(timeEntries.date);
}

export async function getExpenses(organizationId: string, filters: { userId?: string; caseId?: string } = {}) {
  const conditions = [eq(expenses.organizationId, organizationId)];
  if (filters.userId) conditions.push(eq(expenses.userId, filters.userId));
  if (filters.caseId) conditions.push(eq(expenses.caseId, filters.caseId));

  return db
    .select({
      id: expenses.id,
      caseId: expenses.caseId,
      category: expenses.category,
      description: expenses.description,
      amount: expenses.amount,
      date: expenses.date,
      receiptUrl: expenses.receiptUrl,
      isBillable: expenses.isBillable,
      isBilled: expenses.isBilled,
      caseNumber: cases.caseNumber,
      userName: users.name,
      userAvatar: users.avatar,
    })
    .from(expenses)
    .leftJoin(cases, eq(expenses.caseId, cases.id))
    .innerJoin(users, eq(expenses.userId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(expenses.date));
}

export async function getRequisitions(organizationId: string) {
  return db
    .select({
      id: requisitions.id,
      requisitionNumber: requisitions.requisitionNumber,
      description: requisitions.description,
      amount: requisitions.amount,
      status: requisitions.status,
      caseId: requisitions.caseId,
      notes: requisitions.notes,
      createdAt: requisitions.createdAt,
      requestedByName: users.name,
      caseNumber: cases.caseNumber,
    })
    .from(requisitions)
    .innerJoin(users, eq(requisitions.requestedBy, users.id))
    .leftJoin(cases, eq(requisitions.caseId, cases.id))
    .where(eq(requisitions.organizationId, organizationId))
    .orderBy(desc(requisitions.createdAt));
}
