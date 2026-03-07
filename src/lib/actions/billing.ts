"use server";

import { db } from "@/lib/db";
import { invoices, invoiceLineItems, payments, quotes, receipts, creditNotes } from "@/lib/db/schema/billing";
import { clients } from "@/lib/db/schema/clients";
import { getTenantContext } from "@/lib/auth/get-session";
import { createAuditLog } from "@/lib/utils/audit";
import { createInvoiceSchema, updateInvoiceSchema, recordPaymentSchema, createQuoteSchema, createQuoteWithLineItemsSchema, createReceiptSchema, createCreditNoteSchema } from "@/lib/validators/billing";
import { generateInvoiceNumber } from "@/lib/queries/billing";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { safeAction } from "@/lib/utils/safe-action";
import { validateId } from "@/lib/utils/validate-id";
import { withUniqueRetry } from "@/lib/utils/with-retry";
import { sendEmail } from "@/lib/email/send-email";
import { invoiceDeliveryEmailHtml } from "@/lib/email/templates/invoice-delivery";
import { APP_LOCALE } from "@/lib/constants/locale";
import { dispatchWorkflowEvent } from "@/lib/workflows/engine";

export async function createInvoice(data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    const validated = createInvoiceSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    // Compute line item amounts server-side to prevent billing fraud
    const computedLineItems = validated.data.lineItems.map((item) => ({
      ...item,
      amount: item.quantity * item.unitPrice,
    }));
    const subtotal = computedLineItems.reduce((sum, item) => sum + item.amount, 0);
    const vatRate = 16;
    const vatAmount = Math.round(subtotal * vatRate) / 100;
    const totalAmount = Math.round((subtotal + vatAmount) * 100) / 100;

    // Retry on unique constraint violation (concurrent number generation race)
    const result = await withUniqueRetry(async () => {
      const invoiceNumber = await generateInvoiceNumber(organizationId);
      return await db
        .insert(invoices)
        .values({
          organizationId,
          invoiceNumber,
          caseId: validated.data.caseId,
          clientId: validated.data.clientId,
          createdBy: userId,
          subtotal: subtotal.toFixed(2),
          vatRate: String(vatRate),
          vatAmount: vatAmount.toFixed(2),
          totalAmount: totalAmount.toFixed(2),
          dueDate: new Date(validated.data.dueDate),
          notes: validated.data.notes,
        })
        .returning();
    });

    const lineItemValues = computedLineItems.map((item) => ({
      organizationId,
      invoiceId: result[0].id,
      description: item.description,
      quantity: String(item.quantity),
      unitPrice: String(item.unitPrice),
      amount: String(item.amount),
    }));

    await db.insert(invoiceLineItems).values(lineItemValues);

    await createAuditLog(
      organizationId,
      userId,
      "create",
      "invoice",
      result[0].id,
      { invoiceNumber: result[0].invoiceNumber, totalAmount }
    );

    // Fire workflow event for invoice creation (fire-and-forget)
    dispatchWorkflowEvent("invoice_created", {
      organizationId,
      entityId: result[0].id,
      entityType: "invoice",
      userId,
      data: { clientId: validated.data.clientId },
    }).catch(console.error);

    revalidatePath("/billing");
    return { data: result[0] };
  });
}

export async function updateInvoice(data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    const validated = updateInvoiceSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const invoiceId = validated.data.invoiceId;
    if (!validateId(invoiceId)) return { error: "Invalid ID" };

    // Compute line item amounts server-side to prevent billing fraud
    const computedLineItems = validated.data.lineItems.map((item) => ({
      ...item,
      amount: item.quantity * item.unitPrice,
    }));
    const subtotal = computedLineItems.reduce((sum, item) => sum + item.amount, 0);
    const vatRate = 16;
    const vatAmount = Math.round(subtotal * vatRate) / 100;
    const totalAmount = Math.round((subtotal + vatAmount) * 100) / 100;

    // Atomic conditional update — only allow editing draft invoices
    const result = await db
      .update(invoices)
      .set({
        caseId: validated.data.caseId,
        clientId: validated.data.clientId,
        subtotal: subtotal.toFixed(2),
        vatRate: String(vatRate),
        vatAmount: vatAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        dueDate: new Date(validated.data.dueDate),
        notes: validated.data.notes,
        updatedAt: new Date(),
      })
      .where(sql`${invoices.id} = ${invoiceId} AND ${invoices.status} = 'draft' AND ${invoices.organizationId} = ${organizationId}`)
      .returning({ id: invoices.id });

    if (result.length === 0) {
      return { error: "Invoice not found or not in draft status" };
    }

    // Delete existing line items and insert new ones
    await db.delete(invoiceLineItems).where(and(eq(invoiceLineItems.invoiceId, invoiceId), eq(invoiceLineItems.organizationId, organizationId)));

    const lineItemValues = computedLineItems.map((item) => ({
      organizationId,
      invoiceId,
      description: item.description,
      quantity: String(item.quantity),
      unitPrice: String(item.unitPrice),
      amount: String(item.amount),
    }));

    await db.insert(invoiceLineItems).values(lineItemValues);

    await createAuditLog(
      organizationId,
      userId,
      "update",
      "invoice",
      invoiceId,
      { totalAmount }
    );

    revalidatePath("/billing");
    revalidatePath(`/billing/${invoiceId}`);
    return { data: result[0] };
  });
}

interface SendInvoiceEmailOptions {
  to: string;
  cc?: string[];
  subject: string;
  body: string;
  pdfBase64?: string;
}

export async function sendInvoice(id: string, emailOptions?: SendInvoiceEmailOptions) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    if (!validateId(id)) return { error: "Invalid ID" };

    // Atomic conditional update — prevents TOCTOU race
    const result = await db
      .update(invoices)
      .set({ status: "sent", sentAt: new Date(), updatedAt: new Date() })
      .where(sql`${invoices.id} = ${id} AND ${invoices.status} = 'draft' AND ${invoices.organizationId} = ${organizationId}`)
      .returning({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        totalAmount: invoices.totalAmount,
        dueDate: invoices.dueDate,
        clientId: invoices.clientId,
      });

    if (result.length === 0) {
      return { error: "Invoice not found or not in draft status" };
    }

    const invoice = result[0];

    if (emailOptions) {
      // Send with user-composed email
      const attachments = emailOptions.pdfBase64
        ? [{ filename: `${invoice.invoiceNumber}.pdf`, content: emailOptions.pdfBase64 }]
        : undefined;

      sendEmail({
        to: emailOptions.to,
        cc: emailOptions.cc?.filter(Boolean),
        subject: emailOptions.subject,
        html: emailOptions.body,
        attachments,
      }).catch((err) => console.error("Invoice email failed:", err));
    } else {
      // Fallback: send with default template
      db.select({
        email: clients.email,
        firstName: clients.firstName,
        lastName: clients.lastName,
      })
        .from(clients)
        .where(and(eq(clients.id, invoice.clientId), eq(clients.organizationId, organizationId)))
        .limit(1)
        .then(([client]) => {
          if (!client?.email) return;
          const formattedAmount = Number(invoice.totalAmount).toLocaleString(APP_LOCALE, {
            style: "currency",
            currency: "KES",
          });
          const formattedDue = invoice.dueDate
            ? new Date(invoice.dueDate).toLocaleDateString(APP_LOCALE)
            : "N/A";
          return sendEmail({
            to: client.email,
            subject: `Invoice ${invoice.invoiceNumber}`,
            html: invoiceDeliveryEmailHtml({
              clientName: `${client.firstName} ${client.lastName}`,
              invoiceNumber: invoice.invoiceNumber,
              amount: formattedAmount,
              dueDate: formattedDue,
            }),
          });
        })
        .catch((err) => console.error("Invoice email failed:", err));
    }

    await createAuditLog(organizationId, userId, "update", "invoice", id, { action: "sent" });

    revalidatePath("/billing");
    revalidatePath(`/billing/${id}`);
    return { success: true };
  });
}

export async function recordPayment(data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    const validated = recordPaymentSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const invoiceId = validated.data.invoiceId;
    const paymentAmount = String(validated.data.amount);

    // Atomic conditional update: guard status + prevent overpayment in a single statement
    const updateResult = await db
      .update(invoices)
      .set({
        paidAmount: sql`${invoices.paidAmount}::numeric + ${paymentAmount}::numeric`,
        status: sql`CASE WHEN ${invoices.paidAmount}::numeric + ${paymentAmount}::numeric >= ${invoices.totalAmount}::numeric THEN 'paid' ELSE 'partially_paid' END`,
        paidAt: sql`CASE WHEN ${invoices.paidAmount}::numeric + ${paymentAmount}::numeric >= ${invoices.totalAmount}::numeric THEN NOW() ELSE ${invoices.paidAt} END`,
        updatedAt: new Date(),
      })
      .where(
        sql`${invoices.id} = ${invoiceId} AND ${invoices.organizationId} = ${organizationId} AND ${invoices.status} IN ('sent', 'partially_paid', 'overdue') AND (${invoices.totalAmount}::numeric - ${invoices.paidAmount}::numeric) >= ${paymentAmount}::numeric`
      )
      .returning({ id: invoices.id });

    if (updateResult.length === 0) {
      return { error: "Payment failed: invoice is not in a payable state or amount exceeds outstanding balance" };
    }

    const result = await db
      .insert(payments)
      .values({
        organizationId,
        invoiceId,
        amount: paymentAmount,
        method: validated.data.paymentMethod,
        reference: validated.data.referenceNumber,
        mpesaTransactionId: validated.data.mpesaCode,
        receivedBy: userId,
        notes: validated.data.notes,
      })
      .returning();

    await createAuditLog(organizationId, userId, "create", "payment", result[0].id, {
      invoiceId,
      amount: validated.data.amount,
      method: validated.data.paymentMethod,
    });

    // Fire workflow event for payment received (fire-and-forget)
    dispatchWorkflowEvent("payment_received", {
      organizationId,
      entityId: result[0].id,
      entityType: "payment",
      userId,
      data: { invoiceId, amount: validated.data.amount },
    }).catch(console.error);

    revalidatePath("/billing");
    return { data: result[0] };
  });
}

export async function cancelInvoice(id: string) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (role !== "admin") {
      return { error: "Unauthorized" };
    }

    if (!validateId(id)) return { error: "Invalid ID" };

    // Atomic conditional update — prevents TOCTOU race
    const result = await db
      .update(invoices)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(sql`${invoices.id} = ${id} AND ${invoices.organizationId} = ${organizationId} AND ${invoices.status} NOT IN ('paid', 'cancelled')`)
      .returning({ id: invoices.id });

    if (result.length === 0) {
      return { error: "Invoice not found, already paid, or already cancelled" };
    }

    await createAuditLog(organizationId, userId, "update", "invoice", id, { action: "cancel" });

    revalidatePath("/billing");
    return { success: true };
  });
}

export async function deleteInvoice(id: string) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    if (!validateId(id)) return { error: "Invalid ID" };

    // Only allow deletion of draft invoices
    const result = await db
      .delete(invoices)
      .where(sql`${invoices.id} = ${id} AND ${invoices.organizationId} = ${organizationId} AND ${invoices.status} = 'draft'`)
      .returning({ id: invoices.id });

    if (result.length === 0) {
      return { error: "Invoice not found or not in draft status" };
    }

    await createAuditLog(organizationId, userId, "delete", "invoice", id, {});
    revalidatePath("/billing");
    return { success: true };
  });
}

// --- Quotes ---
export async function createQuote(data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    const validated = createQuoteSchema.safeParse(data);
    if (!validated.success) return { error: validated.error.issues[0].message };

    // Retry on unique constraint violation (concurrent number generation race)
    const result = await withUniqueRetry(async () => {
      const year = new Date().getFullYear();
      const qtPrefix = `QT-${year}-`;
      const [qtResult] = await db
        .select({ maxNum: sql<string>`MAX(${quotes.quoteNumber})` })
        .from(quotes)
        .where(sql`${quotes.quoteNumber} LIKE ${qtPrefix + '%'} AND ${quotes.organizationId} = ${organizationId}`);
      let qtNext = 1;
      if (qtResult?.maxNum) {
        const parts = qtResult.maxNum.split("-");
        const lastNum = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastNum)) qtNext = lastNum + 1;
      }
      const quoteNumber = `${qtPrefix}${String(qtNext).padStart(4, "0")}`;

      return await db
        .insert(quotes)
        .values({
          organizationId,
          quoteNumber,
          clientId: validated.data.clientId,
          caseId: validated.data.caseId || undefined,
          createdBy: userId,
          subtotal: String(validated.data.amount),
          vatAmount: "0",
          totalAmount: String(validated.data.amount),
          validUntil: validated.data.validUntil ? new Date(validated.data.validUntil) : undefined,
          notes: validated.data.notes,
        })
        .returning();
    });

    revalidatePath("/billing");
    return { data: result[0] };
  });
}

export async function createQuoteWithLineItems(data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    const validated = createQuoteWithLineItemsSchema.safeParse(data);
    if (!validated.success) return { error: validated.error.issues[0].message };

    // Compute line item amounts server-side to prevent billing fraud
    const computedLineItems = validated.data.lineItems.map((item) => ({
      ...item,
      amount: item.quantity * item.rate,
    }));
    const subtotal = computedLineItems.reduce((sum, item) => sum + item.amount, 0);
    const vatRate = 16;
    const vatAmount = Math.round(subtotal * vatRate) / 100;
    const totalAmount = Math.round((subtotal + vatAmount) * 100) / 100;

    // Retry on unique constraint violation (concurrent number generation race)
    const result = await withUniqueRetry(async () => {
      const year = new Date().getFullYear();
      const qtPrefix = `QT-${year}-`;
      const [qtResult] = await db
        .select({ maxNum: sql<string>`MAX(${quotes.quoteNumber})` })
        .from(quotes)
        .where(sql`${quotes.quoteNumber} LIKE ${qtPrefix + '%'} AND ${quotes.organizationId} = ${organizationId}`);
      let qtNext = 1;
      if (qtResult?.maxNum) {
        const parts = qtResult.maxNum.split("-");
        const lastNum = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastNum)) qtNext = lastNum + 1;
      }
      const quoteNumber = `${qtPrefix}${String(qtNext).padStart(4, "0")}`;

      return await db
        .insert(quotes)
        .values({
          organizationId,
          quoteNumber,
          clientId: validated.data.clientId,
          caseId: validated.data.caseId || undefined,
          createdBy: userId,
          subtotal: subtotal.toFixed(2),
          vatAmount: vatAmount.toFixed(2),
          totalAmount: totalAmount.toFixed(2),
          validUntil: validated.data.validUntil ? new Date(validated.data.validUntil) : undefined,
          notes: validated.data.notes,
        })
        .returning();
    });

    await createAuditLog(
      organizationId,
      userId,
      "create",
      "quote",
      result[0].id,
      { quoteNumber: result[0].quoteNumber, totalAmount }
    );

    revalidatePath("/billing/quotes");
    return { data: result[0] };
  });
}

// Valid quote status transitions
const quoteTransitions: Record<string, string[]> = {
  draft: ["sent"],
  sent: ["accepted", "rejected", "expired"],
  accepted: [],
  rejected: [],
  expired: ["draft"],
};

export async function updateQuoteStatus(id: string, status: "draft" | "sent" | "accepted" | "rejected" | "expired") {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    // Build valid source statuses for the target status
    const validFromStatuses = Object.entries(quoteTransitions)
      .filter(([, targets]) => targets.includes(status))
      .map(([from]) => from);

    if (validFromStatuses.length === 0) {
      return { error: `Cannot transition any quote to '${status}'` };
    }

    // Atomic conditional update with state guard (parameterized, no sql.raw)
    const result = await db
      .update(quotes)
      .set({ status, updatedAt: new Date() })
      .where(sql`${quotes.id} = ${id} AND ${quotes.organizationId} = ${organizationId} AND ${quotes.status} = ANY(${validFromStatuses})`)
      .returning({ id: quotes.id });

    if (result.length === 0) {
      return { error: "Quote not found or invalid status transition" };
    }

    revalidatePath("/billing");
    return { success: true };
  });
}

// --- Receipts ---
export async function createReceipt(data: unknown) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (!["admin", "attorney"].includes(role)) {
      return { error: "Unauthorized" };
    }

    const validated = createReceiptSchema.safeParse(data);
    if (!validated.success) return { error: validated.error.issues[0].message };

    // Retry on unique constraint violation (concurrent number generation race)
    const result = await withUniqueRetry(async () => {
      const rctYear = new Date().getFullYear();
      const rctPrefix = `RCT-${rctYear}-`;
      const [rctResult] = await db
        .select({ maxNum: sql<string>`MAX(${receipts.receiptNumber})` })
        .from(receipts)
        .where(sql`${receipts.receiptNumber} LIKE ${rctPrefix + '%'} AND ${receipts.organizationId} = ${organizationId}`);
      let rctNext = 1;
      if (rctResult?.maxNum) {
        const parts = rctResult.maxNum.split("-");
        const lastNum = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastNum)) rctNext = lastNum + 1;
      }
      const receiptNumber = `${rctPrefix}${String(rctNext).padStart(4, "0")}`;

      return await db
        .insert(receipts)
        .values({
          organizationId,
          receiptNumber,
          paymentId: validated.data.paymentId,
          issuedTo: validated.data.issuedTo,
          amount: String(validated.data.amount),
        })
        .returning();
    });

    revalidatePath("/billing");
    return { data: result[0] };
  });
}

// --- Credit Notes ---
export async function createCreditNote(data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (role !== "admin") {
      return { error: "Unauthorized" };
    }

    const validated = createCreditNoteSchema.safeParse(data);
    if (!validated.success) return { error: validated.error.issues[0].message };

    // Retry on unique constraint violation (concurrent number generation race)
    const result = await withUniqueRetry(async () => {
      const cnYear = new Date().getFullYear();
      const cnPrefix = `CN-${cnYear}-`;
      const [cnResult] = await db
        .select({ maxNum: sql<string>`MAX(${creditNotes.creditNoteNumber})` })
        .from(creditNotes)
        .where(sql`${creditNotes.creditNoteNumber} LIKE ${cnPrefix + '%'} AND ${creditNotes.organizationId} = ${organizationId}`);
      let cnNext = 1;
      if (cnResult?.maxNum) {
        const parts = cnResult.maxNum.split("-");
        const lastNum = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastNum)) cnNext = lastNum + 1;
      }
      const creditNoteNumber = `${cnPrefix}${String(cnNext).padStart(4, "0")}`;

      return await db
        .insert(creditNotes)
        .values({
          organizationId,
          creditNoteNumber,
          invoiceId: validated.data.invoiceId,
          amount: String(validated.data.amount),
          reason: validated.data.reason,
          createdBy: userId,
        })
        .returning();
    });

    revalidatePath("/billing");
    return { data: result[0] };
  });
}
