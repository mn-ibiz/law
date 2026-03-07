"use server";

import { db } from "@/lib/db";
import { suppliers, supplierInvoices } from "@/lib/db/schema/suppliers";
import { getTenantContext } from "@/lib/auth/get-session";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createSupplierSchema, createSupplierInvoiceSchema } from "@/lib/validators/supplier";
import { safeAction } from "@/lib/utils/safe-action";
import { validateId } from "@/lib/utils/validate-id";
import { createAuditLog } from "@/lib/utils/audit";

export async function createSupplier(data: unknown) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized" };

    const validated = createSupplierSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const result = await db
      .insert(suppliers)
      .values({
        ...validated.data,
        organizationId,
        email: validated.data.email || null,
      })
      .returning();

    revalidatePath("/suppliers");
    return { data: result[0] };
  });
}

export async function updateSupplier(id: string, data: unknown) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized" };

    if (!validateId(id)) return { error: "Invalid ID" };

    const validated = createSupplierSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    await db
      .update(suppliers)
      .set({ ...validated.data, email: validated.data.email || null, updatedAt: new Date() })
      .where(and(eq(suppliers.id, id), eq(suppliers.organizationId, organizationId)));

    revalidatePath("/suppliers");
    return { success: true };
  });
}

export async function toggleSupplierActive(id: string) {
  return safeAction(async () => {
    const { organizationId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized" };

    if (!validateId(id)) return { error: "Invalid ID" };

    await db
      .update(suppliers)
      .set({ isActive: sql`NOT ${suppliers.isActive}`, updatedAt: new Date() })
      .where(and(eq(suppliers.id, id), eq(suppliers.organizationId, organizationId)));

    revalidatePath("/suppliers");
    return { success: true };
  });
}

export async function createSupplierInvoice(data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId } = await getTenantContext();

    const validated = createSupplierInvoiceSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { invoiceDate, dueDate, amount, vatAmount, fileUrl, ...rest } = validated.data;
    // Compute totalAmount server-side to prevent billing fraud
    const computedVat = vatAmount ?? 0;
    const computedTotal = amount + computedVat;

    const result = await db
      .insert(supplierInvoices)
      .values({
        ...rest,
        organizationId,
        amount: String(amount),
        vatAmount: String(computedVat),
        totalAmount: String(computedTotal),
        invoiceDate: new Date(invoiceDate),
        dueDate: dueDate ? new Date(dueDate) : null,
        fileUrl: fileUrl || null,
        createdBy: userId,
      })
      .returning();

    revalidatePath("/suppliers");
    return { data: result[0] };
  });
}

export async function deleteSupplierInvoice(id: string) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized" };

    if (!validateId(id)) return { error: "Invalid ID" };

    // Only allow deleting unpaid/pending invoices — atomic conditional delete
    const result = await db
      .delete(supplierInvoices)
      .where(sql`${supplierInvoices.id} = ${id} AND ${supplierInvoices.organizationId} = ${organizationId} AND ${supplierInvoices.status} != 'paid'`)
      .returning({ id: supplierInvoices.id });

    if (result.length === 0) {
      return { error: "Invoice not found or already paid (cannot delete)" };
    }

    await createAuditLog(organizationId, userId, "delete", "supplier_invoice", id, { action: "delete" });

    revalidatePath("/suppliers");
    return { success: true };
  });
}

export async function paySupplierInvoice(id: string) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized" };

    if (!validateId(id)) return { error: "Invalid ID" };

    // Atomic conditional update — prevents TOCTOU race
    const result = await db
      .update(supplierInvoices)
      .set({ status: "paid", paidAt: new Date(), updatedAt: new Date() })
      .where(sql`${supplierInvoices.id} = ${id} AND ${supplierInvoices.organizationId} = ${organizationId} AND ${supplierInvoices.status} != 'paid'`)
      .returning({ id: supplierInvoices.id });

    if (result.length === 0) {
      return { error: "Invoice not found or already paid" };
    }

    await createAuditLog(organizationId, userId, "update", "supplier_invoice", id, { action: "pay" });

    revalidatePath("/suppliers");
    return { success: true };
  });
}
