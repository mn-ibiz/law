import { db } from "@/lib/db";
import { cases, caseAssignments } from "@/lib/db/schema/cases";
import { clients } from "@/lib/db/schema/clients";
import { deadlines } from "@/lib/db/schema/calendar";
import { tasks } from "@/lib/db/schema/calendar";
import { timeEntries } from "@/lib/db/schema/time-expenses";
import { sql, eq, and, isNull, inArray, gte, desc, ne } from "drizzle-orm";

export async function getAttorneyCases(organizationId: string, userId: string) {
  const result = await db
    .select({
      id: cases.id,
      caseNumber: cases.caseNumber,
      title: cases.title,
      status: cases.status,
      clientName: sql<string>`${clients.firstName} || ' ' || ${clients.lastName}`,
    })
    .from(caseAssignments)
    .innerJoin(cases, eq(caseAssignments.caseId, cases.id))
    .innerJoin(clients, eq(cases.clientId, clients.id))
    .where(
      and(
        eq(cases.organizationId, organizationId),
        eq(caseAssignments.userId, userId),
        isNull(caseAssignments.unassignedAt),
        inArray(cases.status, ["open", "in_progress", "hearing"])
      )
    )
    .orderBy(desc(cases.updatedAt))
    .limit(10);
  return result;
}

export async function getAttorneyDeadlines(organizationId: string, userId: string, limit = 7) {
  const now = new Date();
  const result = await db
    .select({
      id: deadlines.id,
      title: deadlines.title,
      dueDate: deadlines.dueDate,
      priority: deadlines.priority,
      caseId: deadlines.caseId,
      caseNumber: cases.caseNumber,
    })
    .from(deadlines)
    .leftJoin(cases, eq(deadlines.caseId, cases.id))
    .where(
      and(
        eq(deadlines.organizationId, organizationId),
        eq(deadlines.assignedTo, userId),
        isNull(deadlines.completedAt),
        gte(deadlines.dueDate, now)
      )
    )
    .orderBy(deadlines.dueDate)
    .limit(limit);
  return result;
}

export async function getAttorneyRecentTimeEntries(organizationId: string, userId: string, limit = 5) {
  const result = await db
    .select({
      id: timeEntries.id,
      description: timeEntries.description,
      hours: timeEntries.hours,
      date: timeEntries.date,
      caseNumber: cases.caseNumber,
    })
    .from(timeEntries)
    .leftJoin(cases, eq(timeEntries.caseId, cases.id))
    .where(and(eq(timeEntries.organizationId, organizationId), eq(timeEntries.userId, userId)))
    .orderBy(desc(timeEntries.date))
    .limit(limit);
  return result;
}

export async function getAttorneyTasks(organizationId: string, userId: string) {
  const result = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
      caseId: tasks.caseId,
      caseNumber: cases.caseNumber,
    })
    .from(tasks)
    .leftJoin(cases, eq(tasks.caseId, cases.id))
    .where(
      and(
        eq(tasks.organizationId, organizationId),
        eq(tasks.assignedTo, userId),
        ne(tasks.status, "completed"),
        ne(tasks.status, "cancelled")
      )
    )
    .orderBy(tasks.dueDate)
    .limit(10);
  return result;
}
