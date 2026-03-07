import { db } from "@/lib/db";
import { suppliers, supplierInvoices } from "@/lib/db/schema/suppliers";
import { users } from "@/lib/db/schema/auth";
import { eq, desc, and } from "drizzle-orm";

export async function getSuppliers(organizationId: string) {
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
    .where(eq(suppliers.organizationId, organizationId))
    .orderBy(suppliers.name);
}

export async function getSupplierById(organizationId: string, id: string) {
  const result = await db.select().from(suppliers).where(and(eq(suppliers.organizationId, organizationId), eq(suppliers.id, id))).limit(1);
  return result[0] ?? null;
}

export async function getSupplierInvoices(organizationId: string, supplierId?: string) {
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
    return query.where(and(eq(supplierInvoices.organizationId, organizationId), eq(supplierInvoices.supplierId, supplierId)));
  }
  return query.where(eq(supplierInvoices.organizationId, organizationId));
}
