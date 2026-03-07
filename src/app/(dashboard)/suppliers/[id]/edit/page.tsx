import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireOrg } from "@/lib/auth/get-session";
import { getSupplierById } from "@/lib/queries/suppliers";
import { SupplierForm } from "@/components/suppliers/supplier-form";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { organizationId } = await requireOrg();
  const { id } = await params;
  const supplier = await getSupplierById(organizationId, id);
  return {
    title: supplier ? `Edit ${supplier.name}` : "Edit Supplier",
    description: supplier ? `Edit supplier ${supplier.name}` : "Edit supplier details",
  };
}

export default async function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const { organizationId } = await requireOrg();
  const { id } = await params;
  const supplier = await getSupplierById(organizationId, id);
  if (!supplier) notFound();

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        items={[
          { label: "Suppliers", href: "/suppliers" },
          { label: supplier.name, href: `/suppliers/${id}` },
          { label: "Edit" },
        ]}
      />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Supplier</h1>
        <p className="text-muted-foreground">
          Update {supplier.name}&apos;s information.
        </p>
      </div>
      <SupplierForm
        defaultValues={{
          name: supplier.name,
          contactPerson: supplier.contactPerson ?? "",
          email: supplier.email ?? "",
          phone: supplier.phone ?? "",
          address: supplier.address ?? "",
          kraPin: supplier.kraPin ?? "",
          bankName: supplier.bankName ?? "",
          bankAccountNumber: supplier.bankAccountNumber ?? "",
          bankBranch: supplier.bankBranch ?? "",
          category: supplier.category ?? "",
          logoUrl: supplier.logoUrl ?? "",
        }}
        supplierId={id}
      />
    </div>
  );
}
