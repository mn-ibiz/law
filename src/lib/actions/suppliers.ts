"use server";

import { db } from "@/lib/db";
import { suppliers, supplierInvoices } from "@/lib/db/schema/suppliers";
import { auth } from "@/lib/auth/auth";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createSupplierSchema, createSupplierInvoiceSchema } from "@/lib/validators/supplier";
import { safeAction } from "@/lib/utils/safe-action";
import { validateId } from "@/lib/utils/validate-id";

export async function createSupplier(data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return { error: "Unauthorized" };
    }

    const validated = createSupplierSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const result = await db
      .insert(suppliers)
      .values({
        ...validated.data,
        email: validated.data.email || null,
      })
      .returning();

    revalidatePath("/suppliers");
    return { data: result[0] };
  });
}

export async function updateSupplier(id: string, data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return { error: "Unauthorized" };
    }

    if (!validateId(id)) return { error: "Invalid ID" };

    const validated = createSupplierSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    await db
      .update(suppliers)
      .set({ ...validated.data, email: validated.data.email || null, updatedAt: new Date() })
      .where(eq(suppliers.id, id));

    revalidatePath("/suppliers");
    return { success: true };
  });
}

export async function toggleSupplierActive(id: string) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return { error: "Unauthorized" };
    }

    if (!validateId(id)) return { error: "Invalid ID" };

    await db
      .update(suppliers)
      .set({ isActive: sql`NOT ${suppliers.isActive}`, updatedAt: new Date() })
      .where(eq(suppliers.id, id));

    revalidatePath("/suppliers");
    return { success: true };
  });
}

export async function createSupplierInvoice(data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
      return { error: "Unauthorized" };
    }

    const validated = createSupplierInvoiceSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { invoiceDate, dueDate, amount, vatAmount, ...rest } = validated.data;
    // Compute totalAmount server-side to prevent billing fraud
    const computedVat = vatAmount ?? 0;
    const computedTotal = amount + computedVat;

    const result = await db
      .insert(supplierInvoices)
      .values({
        ...rest,
        amount: String(amount),
        vatAmount: String(computedVat),
        totalAmount: String(computedTotal),
        invoiceDate: new Date(invoiceDate),
        dueDate: dueDate ? new Date(dueDate) : null,
        createdBy: session.user.id,
      })
      .returning();

    revalidatePath("/suppliers");
    return { data: result[0] };
  });
}

export async function paySupplierInvoice(id: string) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return { error: "Unauthorized" };
    }

    if (!validateId(id)) return { error: "Invalid ID" };

    // Atomic conditional update — prevents TOCTOU race
    const result = await db
      .update(supplierInvoices)
      .set({ status: "paid", paidAt: new Date(), updatedAt: new Date() })
      .where(sql`${supplierInvoices.id} = ${id} AND ${supplierInvoices.status} != 'paid'`)
      .returning({ id: supplierInvoices.id });

    if (result.length === 0) {
      return { error: "Invoice not found or already paid" };
    }

    revalidatePath("/suppliers");
    return { success: true };
  });
}
