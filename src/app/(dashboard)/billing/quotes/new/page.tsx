import { requireOrg } from "@/lib/auth/get-session";
import { getCases } from "@/lib/queries/cases";
import { getClients } from "@/lib/queries/clients";
import { QuoteForm } from "@/components/billing/quote-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Quote",
  description: "Create a new quote for a client",
};

export default async function NewQuotePage() {
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
        <h1 className="text-2xl font-bold tracking-tight">New Quote</h1>
        <p className="text-muted-foreground">Create a new quote for a client.</p>
      </div>
      <QuoteForm cases={cases} clients={clients} />
    </div>
  );
}
