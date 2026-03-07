import { db } from "@/lib/db";
import { suppliers, supplierInvoices } from "@/lib/db/schema/suppliers";
import { users } from "@/lib/db/schema/auth";
import { eq, desc } from "drizzle-orm";

export async function getSuppliers() {
  return db
    .select({
      id: suppliers.id,
      name: suppliers.name,
      contactPerson: suppliers.contactPerson,
      email: suppliers.email,
      phone: suppliers.phone,
      category: suppliers.category,
      kraPin: suppliers.kraPin,
      logoUrl: suppliers.logoUrl,
      isActive: suppliers.isActive,
      createdAt: suppliers.createdAt,
    })
    .from(suppliers)
    .orderBy(suppliers.name);
}

export async function getSupplierById(id: string) {
  const result = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getSupplierInvoices(supplierId?: string) {
  const query = db
    .select({
      id: supplierInvoices.id,
      supplierId: supplierInvoices.supplierId,
      supplierName: suppliers.name,
      invoiceNumber: supplierInvoices.invoiceNumber,
      amount: supplierInvoices.amount,
      vatAmount: supplierInvoices.vatAmount,
      totalAmount: supplierInvoices.totalAmount,
      description: supplierInvoices.description,
      invoiceDate: supplierInvoices.invoiceDate,
      dueDate: supplierInvoices.dueDate,
      paidAt: supplierInvoices.paidAt,
      status: supplierInvoices.status,
      fileUrl: supplierInvoices.fileUrl,
      createdByName: users.name,
      createdAt: supplierInvoices.createdAt,
    })
    .from(supplierInvoices)
    .leftJoin(suppliers, eq(supplierInvoices.supplierId, suppliers.id))
    .leftJoin(users, eq(supplierInvoices.createdBy, users.id))
    .orderBy(desc(supplierInvoices.createdAt));

  if (supplierId) {
    return query.where(eq(supplierInvoices.supplierId, supplierId));
  }
  return query;
}
