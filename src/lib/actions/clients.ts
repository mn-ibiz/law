"use server";

import { db } from "@/lib/db";
import { clients, clientContacts } from "@/lib/db/schema/clients";
import { auth } from "@/lib/auth/auth";
import { createAuditLog } from "@/lib/utils/audit";
import { createClientSchema, updateClientSchema, createContactLogSchema } from "@/lib/validators/client";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createClient(data: unknown) {
  const session = await auth();
  if (!session?.user || !["admin", "attorney"].includes(session.user.role as string)) {
    return { error: "Unauthorized" };
  }

  const validated = createClientSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { dateOfBirth, ...rest } = validated.data;

  const result = await db
    .insert(clients)
    .values({
      ...rest,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    })
    .returning();

  await createAuditLog(
    session.user.id as string,
    "create",
    "client",
    result[0].id,
    { new: validated.data }
  );

  revalidatePath("/clients");
  return { data: result[0] };
}

export async function updateClient(id: string, data: unknown) {
  const session = await auth();
  if (!session?.user || !["admin", "attorney"].includes(session.user.role as string)) {
    return { error: "Unauthorized" };
  }

  const validated = updateClientSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { dateOfBirth, ...rest } = validated.data;

  const result = await db
    .update(clients)
    .set({
      ...rest,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(clients.id, id))
    .returning();

  await createAuditLog(
    session.user.id as string,
    "update",
    "client",
    id,
    { updated: validated.data }
  );

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  return { data: result[0] };
}

export async function deactivateClient(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  await db
    .update(clients)
    .set({ status: "inactive", updatedAt: new Date() })
    .where(eq(clients.id, id));

  await createAuditLog(
    session.user.id as string,
    "update",
    "client",
    id,
    { action: "deactivate" }
  );

  revalidatePath("/clients");
  return { success: true };
}

export async function addContactLog(clientId: string, data: unknown) {
  const session = await auth();
  if (!session?.user || !["admin", "attorney"].includes(session.user.role as string)) {
    return { error: "Unauthorized" };
  }

  const validated = createContactLogSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const result = await db
    .insert(clientContacts)
    .values({
      clientId,
      contactedBy: session.user.id as string,
      type: validated.data.type,
      subject: validated.data.subject,
      notes: validated.data.notes,
      contactDate: new Date(validated.data.contactDate),
    })
    .returning();

  revalidatePath(`/clients/${clientId}`);
  return { data: result[0] };
}
