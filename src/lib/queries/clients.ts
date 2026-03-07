import { cache } from "react";
import { db } from "@/lib/db";
import { clients, clientContacts } from "@/lib/db/schema/clients";
import { users } from "@/lib/db/schema/auth";
import { eq, ilike, or, and, sql, desc } from "drizzle-orm";

interface ClientFilters {
  search?: string;
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export async function getClients(organizationId: string, filters: ClientFilters = {}) {
  const { search, status, type, page = 1, limit = 20 } = filters;

  const conditions = [eq(clients.organizationId, organizationId)];
  if (status) conditions.push(eq(clients.status, status as "active" | "inactive" | "prospective"));
  if (type) conditions.push(eq(clients.type, type as "individual" | "organization"));

  if (search) {
    const escaped = search.replace(/[%_\\]/g, "\\$&");
    conditions.push(
      or(
        ilike(clients.firstName, `%${escaped}%`),
        ilike(clients.lastName, `%${escaped}%`),
        ilike(clients.email, `%${escaped}%`),
        ilike(clients.companyName, `%${escaped}%`)
      )!
    );
  }

  const result = await db
    .select({
      id: clients.id,
      type: clients.type,
      status: clients.status,
      firstName: clients.firstName,
      lastName: clients.lastName,
      email: clients.email,
      phone: clients.phone,
      companyName: clients.companyName,
      county: clients.county,
      isPep: clients.isPep,
      photoUrl: clients.photoUrl,
      createdAt: clients.createdAt,
    })
    .from(clients)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(clients.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  const countResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(clients)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return {
    data: result,
    total: countResult[0]?.count ?? 0,
    page,
    limit,
  };
}

export const getClientById = cache(async (organizationId: string, id: string) => {
  const result = await db
    .select()
    .from(clients)
    .where(and(eq(clients.organizationId, organizationId), eq(clients.id, id)))
    .limit(1);

  return result[0] ?? null;
});

export async function getClientsByPipelineStage(organizationId: string) {
  const result = await db
    .select({
      id: clients.id,
      firstName: clients.firstName,
      lastName: clients.lastName,
      email: clients.email,
      phone: clients.phone,
      companyName: clients.companyName,
      status: clients.status,
      type: clients.type,
      leadSource: clients.leadSource,
      leadScore: clients.leadScore,
      followUpDate: clients.followUpDate,
      createdAt: clients.createdAt,
    })
    .from(clients)
    .where(eq(clients.organizationId, organizationId))
    .orderBy(desc(clients.createdAt));

  const grouped: Record<string, typeof result> = {
    prospective: [],
    active: [],
    inactive: [],
  };

  for (const client of result) {
    const stage = client.status ?? "active";
    if (grouped[stage]) {
      grouped[stage].push(client);
    }
  }

  return grouped;
}

export async function getClientContacts(organizationId: string, clientId: string) {
  return db
    .select({
      id: clientContacts.id,
      type: clientContacts.type,
      subject: clientContacts.subject,
      notes: clientContacts.notes,
      contactDate: clientContacts.contactDate,
      contactedByName: users.name,
    })
    .from(clientContacts)
    .leftJoin(users, eq(clientContacts.contactedBy, users.id))
    .where(and(eq(clientContacts.organizationId, organizationId), eq(clientContacts.clientId, clientId)))
    .orderBy(desc(clientContacts.contactDate));
}
