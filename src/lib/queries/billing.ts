import { cache } from "react";
import { db } from "@/lib/db";
import { invoices, invoiceLineItems, payments, quotes } from "@/lib/db/schema/billing";
import { cases } from "@/lib/db/schema/cases";
import { clients } from "@/lib/db/schema/clients";
import { users } from "@/lib/db/schema/auth";
import { auditLog } from "@/lib/db/schema/settings";
import { eq, desc, sql, and } from "drizzle-orm";

interface InvoiceFilters {
  status?: string;
  clientId?: string;
  caseId?: string;
}

export async function getInvoices(filters: InvoiceFilters = {}) {
  const conditions = [];
  if (filters.status) conditions.push(eq(invoices.status, filters.status as "draft" | "sent" | "viewed" | "partially_paid" | "paid" | "overdue" | "cancelled" | "written_off"));
  if (filters.clientId) conditions.push(eq(invoices.clientId, filters.clientId));
  if (filters.caseId) conditions.push(eq(invoices.caseId, filters.caseId));

  return db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      status: invoices.status,
      totalAmount: invoices.totalAmount,
      paidAmount: invoices.paidAmount,
      dueDate: invoices.dueDate,
      createdAt: invoices.createdAt,
      clientName: sql<string>`${clients.firstName} || ' ' || ${clients.lastName}`,
      clientPhotoUrl: clients.photoUrl,
      caseNumber: cases.caseNumber,
    })
    .from(invoices)
    .innerJoin(clients, eq(invoices.clientId, clients.id))
    .leftJoin(cases, eq(invoices.caseId, cases.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(invoices.createdAt))
    .limit(500);
}

export const getInvoiceById = cache(async (id: string) => {
  const result = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      status: invoices.status,
      subtotal: invoices.subtotal,
      vatRate: invoices.vatRate,
      vatAmount: invoices.vatAmount,
      totalAmount: invoices.totalAmount,
      paidAmount: invoices.paidAmount,
      currency: invoices.currency,
      dueDate: invoices.dueDate,
      sentAt: invoices.sentAt,
      paidAt: invoices.paidAt,
      notes: invoices.notes,
      createdAt: invoices.createdAt,
      updatedAt: invoices.updatedAt,
      clientId: invoices.clientId,
      caseId: invoices.caseId,
      clientName: sql<string>`${clients.firstName} || ' ' || ${clients.lastName}`,
      clientEmail: clients.email,
      clientPhone: clients.phone,
      clientAddress: clients.physicalAddress,
      clientCity: clients.city,
      clientPoBox: clients.poBox,
      clientCounty: clients.county,
      caseNumber: cases.caseNumber,
      caseTitle: cases.title,
      createdByName: users.name,
    })
    .from(invoices)
    .innerJoin(clients, eq(invoices.clientId, clients.id))
    .leftJoin(cases, eq(invoices.caseId, cases.id))
    .innerJoin(users, eq(invoices.createdBy, users.id))
    .where(eq(invoices.id, id))
    .limit(1);

  return result[0] ?? null;
});

export async function getInvoiceLineItems(invoiceId: string) {
  return db.select().from(invoiceLineItems).where(eq(invoiceLineItems.invoiceId, invoiceId));
}

export async function getInvoicePayments(invoiceId: string) {
  return db
    .select({
      id: payments.id,
      amount: payments.amount,
      method: payments.method,
      reference: payments.reference,
      mpesaTransactionId: payments.mpesaTransactionId,
      paymentDate: payments.paymentDate,
      receivedByName: users.name,
    })
    .from(payments)
    .leftJoin(users, eq(payments.receivedBy, users.id))
    .where(eq(payments.invoiceId, invoiceId))
    .orderBy(desc(payments.paymentDate));
}

export async function getQuotes() {
  return db
    .select({
      id: quotes.id,
      quoteNumber: quotes.quoteNumber,
      status: quotes.status,
      totalAmount: quotes.totalAmount,
      validUntil: quotes.validUntil,
      createdAt: quotes.createdAt,
      clientName: sql<string>`${clients.firstName} || ' ' || ${clients.lastName}`,
    })
    .from(quotes)
    .innerJoin(clients, eq(quotes.clientId, clients.id))
    .orderBy(desc(quotes.createdAt))
    .limit(500);
}

export async function getInvoiceHistory(invoiceId: string) {
  return db
    .select({
      id: auditLog.id,
      action: auditLog.action,
      details: auditLog.details,
      createdAt: auditLog.createdAt,
      userName: users.name,
      userAvatar: users.avatar,
    })
    .from(auditLog)
    .leftJoin(users, eq(auditLog.userId, users.id))
    .where(and(eq(auditLog.entityType, "invoice"), eq(auditLog.entityId, invoiceId)))
    .orderBy(desc(auditLog.createdAt))
    .limit(50);
}

export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const [result] = await db
    .select({ maxNum: sql<string>`MAX(${invoices.invoiceNumber})` })
    .from(invoices)
    .where(sql`${invoices.invoiceNumber} LIKE ${prefix + '%'}`);

  const maxNum = result?.maxNum;
  let next = 1;
  if (maxNum) {
    const parts = maxNum.split("-");
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) next = lastNum + 1;
  }
  return `${prefix}${String(next).padStart(4, "0")}`;
}
