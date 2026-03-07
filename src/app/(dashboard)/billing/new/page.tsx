import { requireOrg } from "@/lib/auth/get-session";
import { getCases } from "@/lib/queries/cases";
import { getClients } from "@/lib/queries/clients";
import { InvoiceForm } from "@/components/forms/invoice-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Invoice",
  description: "Create a new invoice",
};

export default async function NewInvoicePage() {
  const { organizationId } = await requireOrg();
  const [caseResult, clientResult] = await Promise.all([
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Invoice</h1>
        <p className="text-muted-foreground">Create a new invoice for a client.</p>
      </div>
      <InvoiceForm cases={cases} clients={clients} />
    </div>
  );
}
