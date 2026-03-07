import { db } from "@/lib/db";
import { cases } from "@/lib/db/schema/cases";
import { invoices } from "@/lib/db/schema/billing";
import { documents } from "@/lib/db/schema/documents";
import { clients } from "@/lib/db/schema/clients";
import { messages } from "@/lib/db/schema/messaging";
import { eq, desc, and } from "drizzle-orm";

export async function getPortalCases(organizationId: string, clientUserId: string) {
  const client = await db.select({ id: clients.id }).from(clients).where(and(eq(clients.organizationId, organizationId), eq(clients.userId, clientUserId))).limit(1);
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
    .where(and(eq(cases.organizationId, organizationId), eq(cases.clientId, client[0].id)))
    .orderBy(desc(cases.createdAt))
    .limit(200);
}

export async function getPortalInvoices(organizationId: string, clientUserId: string) {
  const client = await db.select({ id: clients.id }).from(clients).where(and(eq(clients.organizationId, organizationId), eq(clients.userId, clientUserId))).limit(1);
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
    .where(and(eq(invoices.organizationId, organizationId), eq(invoices.clientId, client[0].id)))
    .orderBy(desc(invoices.createdAt))
    .limit(200);
}

export async function getPortalDocuments(organizationId: string, clientUserId: string) {
  const client = await db.select({ id: clients.id }).from(clients).where(and(eq(clients.organizationId, organizationId), eq(clients.userId, clientUserId))).limit(1);
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
    .where(and(eq(documents.organizationId, organizationId), eq(documents.clientId, client[0].id)))
    .orderBy(desc(documents.createdAt))
    .limit(200);
}

export async function getPortalMessages(organizationId: string, userId: string) {
  return db
    .select({
      id: messages.id,
      subject: messages.subject,
      body: messages.body,
      senderId: messages.senderId,
      readAt: messages.readAt,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(and(eq(messages.organizationId, organizationId), eq(messages.recipientId, userId)))
    .orderBy(desc(messages.createdAt))
    .limit(20);
}
