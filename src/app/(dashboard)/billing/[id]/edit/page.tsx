import { notFound, redirect } from "next/navigation";
import { requireOrg } from "@/lib/auth/get-session";
import { getInvoiceById, getInvoiceLineItems } from "@/lib/queries/billing";
import { getCases } from "@/lib/queries/cases";
import { getClients } from "@/lib/queries/clients";
import { InvoiceForm } from "@/components/forms/invoice-form";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Invoice",
  description: "Edit a draft invoice",
};

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { organizationId } = await requireOrg();
  const { id } = await params;
  const invoice = await getInvoiceById(organizationId, id);

  if (!invoice) notFound();
  if (invoice.status !== "draft") redirect(`/billing/${id}`);

  const [lineItems, caseResult, clientResult] = await Promise.all([
    getInvoiceLineItems(organizationId, id),
    getCases(organizationId, { limit: 200 }),
    getClients(organizationId, { limit: 200 }),
  ]);

  const cases = caseResult.data.map((c) => ({
    id: c.id,
    caseNumber: c.caseNumber,
    title: c.title,
  }));

  const clients = clientResult.data.map((c) => ({
    id: c.id,
    name: c.companyName || `${c.firstName} ${c.lastName}`,
  }));

  const dueDate = invoice.dueDate
    ? new Date(invoice.dueDate).toISOString().split("T")[0]
    : "";

  const defaultValues = {
    caseId: invoice.caseId ?? "",
    clientId: invoice.clientId,
    dueDate,
    notes: invoice.notes ?? "",
    lineItems: lineItems.map((item) => ({
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      amount: Number(item.amount),
    })),
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        items={[
          { label: "Billing", href: "/billing" },
          { label: invoice.invoiceNumber, href: `/billing/${id}` },
          { label: "Edit" },
        ]}
      />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Invoice {invoice.invoiceNumber}</h1>
        <p className="text-muted-foreground">Edit this draft invoice.</p>
      </div>
      <InvoiceForm
        cases={cases}
        clients={clients}
        invoiceId={id}
        defaultValues={defaultValues}
      />
    </div>
  );
}
