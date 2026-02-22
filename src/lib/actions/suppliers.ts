"use server";

import { db } from "@/lib/db";
import { suppliers, supplierInvoices } from "@/lib/db/schema/suppliers";
import { auth } from "@/lib/auth/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createSupplierSchema, createSupplierInvoiceSchema } from "@/lib/validators/supplier";

export async function createSupplier(data: unknown) {
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
}

export async function updateSupplier(id: string, data: unknown) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

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
}

export async function toggleSupplierActive(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const existing = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1);
  if (!existing[0]) return { error: "Not found" };

  await db
    .update(suppliers)
    .set({ isActive: !existing[0].isActive, updatedAt: new Date() })
    .where(eq(suppliers.id, id));

  revalidatePath("/suppliers");
  return { success: true };
}

export async function createSupplierInvoice(data: unknown) {
  const session = await auth();
  if (!session?.user || !["admin", "attorney"].includes(session.user.role as string)) {
    return { error: "Unauthorized" };
  }

  const validated = createSupplierInvoiceSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { invoiceDate, dueDate, amount, vatAmount, totalAmount, ...rest } = validated.data;

  const result = await db
    .insert(supplierInvoices)
    .values({
      ...rest,
      amount: String(amount),
      vatAmount: vatAmount ? String(vatAmount) : "0",
      totalAmount: String(totalAmount),
      invoiceDate: new Date(invoiceDate),
      dueDate: dueDate ? new Date(dueDate) : null,
      createdBy: session.user.id as string,
    })
    .returning();

  revalidatePath("/suppliers");
  return { data: result[0] };
}

export async function paySupplierInvoice(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  await db
    .update(supplierInvoices)
    .set({ status: "paid", paidAt: new Date(), updatedAt: new Date() })
    .where(eq(supplierInvoices.id, id));

  revalidatePath("/suppliers");
  return { success: true };
}
