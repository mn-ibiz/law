"use server";

import { db } from "@/lib/db";
import { invoices, invoiceLineItems, payments } from "@/lib/db/schema/billing";
import { auth } from "@/lib/auth/auth";
import { createAuditLog } from "@/lib/utils/audit";
import { createInvoiceSchema, recordPaymentSchema } from "@/lib/validators/billing";
import { generateInvoiceNumber } from "@/lib/queries/billing";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createInvoice(data: unknown) {
  const session = await auth();
  if (!session?.user || !["admin", "attorney"].includes(session.user.role as string)) {
    return { error: "Unauthorized" };
  }

  const validated = createInvoiceSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const invoiceNumber = await generateInvoiceNumber();
  const subtotal = validated.data.lineItems.reduce((sum, item) => sum + item.amount, 0);
  const vatRate = 16;
  const vatAmount = subtotal * (vatRate / 100);
  const totalAmount = subtotal + vatAmount;

  const result = await db
    .insert(invoices)
    .values({
      invoiceNumber,
      caseId: validated.data.caseId,
      clientId: validated.data.clientId,
      createdBy: session.user.id as string,
      subtotal: String(subtotal),
      vatRate: String(vatRate),
      vatAmount: String(vatAmount),
      totalAmount: String(totalAmount),
      dueDate: new Date(validated.data.dueDate),
      notes: validated.data.notes,
    })
    .returning();

  const lineItemValues = validated.data.lineItems.map((item) => ({
    invoiceId: result[0].id,
    description: item.description,
    quantity: String(item.quantity),
    unitPrice: String(item.unitPrice),
    amount: String(item.amount),
  }));

  await db.insert(invoiceLineItems).values(lineItemValues);

  await createAuditLog(
    session.user.id as string,
    "create",
    "invoice",
    result[0].id,
    { invoiceNumber, totalAmount }
  );

  revalidatePath("/billing");
  return { data: result[0] };
}

export async function sendInvoice(id: string) {
  const session = await auth();
  if (!session?.user || !["admin", "attorney"].includes(session.user.role as string)) {
    return { error: "Unauthorized" };
  }

  await db
    .update(invoices)
    .set({ status: "sent", sentAt: new Date(), updatedAt: new Date() })
    .where(eq(invoices.id, id));

  revalidatePath("/billing");
  return { success: true };
}

export async function recordPayment(data: unknown) {
  const session = await auth();
  if (!session?.user || !["admin", "attorney"].includes(session.user.role as string)) {
    return { error: "Unauthorized" };
  }

  const validated = recordPaymentSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const result = await db
    .insert(payments)
    .values({
      invoiceId: validated.data.invoiceId,
      amount: String(validated.data.amount),
      method: validated.data.paymentMethod,
      reference: validated.data.referenceNumber,
      mpesaTransactionId: validated.data.mpesaCode,
      receivedBy: session.user.id as string,
      notes: validated.data.notes,
    })
    .returning();

  // Update paid amount on invoice
  const invoice = await db.select().from(invoices).where(eq(invoices.id, validated.data.invoiceId)).limit(1);
  if (invoice[0]) {
    const newPaid = Number(invoice[0].paidAmount) + validated.data.amount;
    const totalAmount = Number(invoice[0].totalAmount);
    const newStatus = newPaid >= totalAmount ? "paid" : "partially_paid";

    await db
      .update(invoices)
      .set({
        paidAmount: String(newPaid),
        status: newStatus,
        paidAt: newPaid >= totalAmount ? new Date() : undefined,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, validated.data.invoiceId));
  }

  revalidatePath("/billing");
  return { data: result[0] };
}

export async function cancelInvoice(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  await db.update(invoices).set({ status: "cancelled", updatedAt: new Date() }).where(eq(invoices.id, id));
  revalidatePath("/billing");
  return { success: true };
}
