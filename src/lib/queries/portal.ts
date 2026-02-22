import { db } from "@/lib/db";
import { cases } from "@/lib/db/schema/cases";
import { invoices } from "@/lib/db/schema/billing";
import { documents } from "@/lib/db/schema/documents";
import { clients } from "@/lib/db/schema/clients";
import { messages } from "@/lib/db/schema/messaging";
import { eq, desc, sql, and } from "drizzle-orm";

export async function getPortalCases(clientUserId: string) {
  const client = await db.select().from(clients).where(eq(clients.userId, clientUserId)).limit(1);
  if (!client[0]) return [];

  return db
    .select({
      id: cases.id,
      caseNumber: cases.caseNumber,
      title: cases.title,
      status: cases.status,
      caseType: cases.caseType,
      createdAt: cases.createdAt,
    })
    .from(cases)
    .where(eq(cases.clientId, client[0].id))
    .orderBy(desc(cases.createdAt));
}

export async function getPortalInvoices(clientUserId: string) {
  const client = await db.select().from(clients).where(eq(clients.userId, clientUserId)).limit(1);
  if (!client[0]) return [];

  return db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      status: invoices.status,
      totalAmount: invoices.totalAmount,
      paidAmount: invoices.paidAmount,
      dueDate: invoices.dueDate,
    })
    .from(invoices)
    .where(eq(invoices.clientId, client[0].id))
    .orderBy(desc(invoices.createdAt));
}

export async function getPortalDocuments(clientUserId: string) {
  const client = await db.select().from(clients).where(eq(clients.userId, clientUserId)).limit(1);
  if (!client[0]) return [];

  return db
    .select({
      id: documents.id,
      title: documents.title,
      category: documents.category,
      fileName: documents.fileName,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(eq(documents.clientId, client[0].id))
    .orderBy(desc(documents.createdAt));
}

export async function getPortalMessages(userId: string) {
  return db
    .select()
    .from(messages)
    .where(eq(messages.recipientId, userId))
    .orderBy(desc(messages.createdAt))
    .limit(20);
}
