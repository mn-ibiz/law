import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getCases } from "@/lib/queries/cases";
import { getClients } from "@/lib/queries/clients";
import { DocumentForm } from "@/components/forms/document-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload Document",
  description: "Create a new document record",
};

export default async function NewDocumentPage() {
  await requireAdminOrAttorney();

  const [casesResult, clientsResult] = await Promise.all([
    getCases({ limit: 200 }),
    getClients({ limit: 200 }),
  ]);

  const cases = casesResult.data.map((c) => ({
    id: c.id,
    caseNumber: c.caseNumber,
    title: c.title,
  }));

  const clients = clientsResult.data.map((c) => ({
    id: c.id,
    name: c.companyName || `${c.firstName} ${c.lastName}`,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload Document</h1>
        <p className="text-muted-foreground">
          Create a new document record for a case or client.
        </p>
      </div>
      <DocumentForm cases={cases} clients={clients} />
    </div>
  );
}
