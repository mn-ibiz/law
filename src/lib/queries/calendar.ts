import { db } from "@/lib/db";
import { calendarEvents, deadlines, tasks, bringUps } from "@/lib/db/schema/calendar";
import { cases } from "@/lib/db/schema/cases";
import { users } from "@/lib/db/schema/auth";
import { eq, and, gte, lte, desc, asc, sql, isNull } from "drizzle-orm";

export async function getCalendarEvents(start: Date, end: Date, userId?: string) {
  const conditions = [
    gte(calendarEvents.startTime, start),
    lte(calendarEvents.startTime, end),
  ];
  if (userId) conditions.push(eq(calendarEvents.createdBy, userId));

  return db
    .select({
      id: calendarEvents.id,
      title: calendarEvents.title,
      type: calendarEvents.type,
      startTime: calendarEvents.startTime,
      endTime: calendarEvents.endTime,
      allDay: calendarEvents.allDay,
      isCourtDate: calendarEvents.isCourtDate,
      location: calendarEvents.location,
      caseId: calendarEvents.caseId,
    })
    .from(calendarEvents)
    .where(and(...conditions))
    .orderBy(asc(calendarEvents.startTime));
}

export async function getEventById(id: string) {
  const result = await db
    .select()
    .from(calendarEvents)
    .where(eq(calendarEvents.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function getDeadlines(filters: { caseId?: string; userId?: string; overdue?: boolean } = {}) {
  const conditions = [];
  if (filters.caseId) conditions.push(eq(deadlines.caseId, filters.caseId));
  if (filters.userId) conditions.push(eq(deadlines.assignedTo, filters.userId));
  if (filters.overdue) {
    conditions.push(lte(deadlines.dueDate, new Date()));
    conditions.push(isNull(deadlines.completedAt));
  }

  return db
    .select({
      id: deadlines.id,
      title: deadlines.title,
      description: deadlines.description,
      priority: deadlines.priority,
      dueDate: deadlines.dueDate,
      completedAt: deadlines.completedAt,
      isStatutory: deadlines.isStatutory,
      caseId: deadlines.caseId,
      caseNumber: cases.caseNumber,
      assignedToName: users.name,
      assignedToAvatar: users.avatar,
    })
    .from(deadlines)
    .leftJoin(cases, eq(deadlines.caseId, cases.id))
    .leftJoin(users, eq(deadlines.assignedTo, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(deadlines.dueDate));
}

export async function getTasks(filters: { caseId?: string; userId?: string; status?: string } = {}) {
  const conditions = [];
  if (filters.caseId) conditions.push(eq(tasks.caseId, filters.caseId));
  if (filters.userId) conditions.push(eq(tasks.assignedTo, filters.userId));
  if (filters.status) conditions.push(eq(tasks.status, filters.status as "pending" | "in_progress" | "completed" | "cancelled"));

  return db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
      caseId: tasks.caseId,
      caseNumber: cases.caseNumber,
      assignedToName: users.name,
      createdByName: sql<string>`(SELECT name FROM users WHERE id = ${tasks.createdBy})`,
    })
    .from(tasks)
    .leftJoin(cases, eq(tasks.caseId, cases.id))
    .leftJoin(users, eq(tasks.assignedTo, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(tasks.createdAt));
}

export async function getBringUps(filters: { caseId?: string; status?: string } = {}) {
  const conditions = [];
  if (filters.caseId) conditions.push(eq(bringUps.caseId, filters.caseId));
  if (filters.status) conditions.push(eq(bringUps.status, filters.status as "pending" | "completed" | "dismissed" | "overdue"));

  return db
    .select({
      id: bringUps.id,
      date: bringUps.date,
      reason: bringUps.reason,
      status: bringUps.status,
      notes: bringUps.notes,
      caseId: bringUps.caseId,
      assignedTo: bringUps.assignedTo,
      caseNumber: cases.caseNumber,
      caseTitle: cases.title,
      createdByName: users.name,
    })
    .from(bringUps)
    .innerJoin(cases, eq(bringUps.caseId, cases.id))
    .leftJoin(users, eq(bringUps.createdBy, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(bringUps.date));
}
