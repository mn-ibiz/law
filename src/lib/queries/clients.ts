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

export async function getClients(filters: ClientFilters = {}) {
  const { search, status, type, page = 1, limit = 20 } = filters;

  const conditions = [];
  if (status) conditions.push(eq(clients.status, status as "active" | "inactive" | "prospective"));
  if (type) conditions.push(eq(clients.type, type as "individual" | "organization"));

  if (search) {
    conditions.push(
      or(
        ilike(clients.firstName, `%${search}%`),
        ilike(clients.lastName, `%${search}%`),
        ilike(clients.email, `%${search}%`),
        ilike(clients.companyName, `%${search}%`)
      )
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

export async function getClientById(id: string) {
  const result = await db
    .select()
    .from(clients)
    .where(eq(clients.id, id))
    .limit(1);

  return result[0] ?? null;
}

export async function getClientContacts(clientId: string) {
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
    .where(eq(clientContacts.clientId, clientId))
    .orderBy(desc(clientContacts.contactDate));
}
