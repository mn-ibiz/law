import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getClients } from "@/lib/queries/clients";
import { CaseForm } from "@/components/forms/case-form";

export default async function NewCasePage() {
  await requireAdminOrAttorney();
  const { data: clientList } = await getClients({ limit: 200 });

  const clients = clientList.map((c) => ({
    id: c.id,
    name: c.companyName || `${c.firstName} ${c.lastName}`,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Case</h1>
        <p className="text-muted-foreground">Open a new legal case or matter.</p>
      </div>
      <CaseForm clients={clients} />
    </div>
  );
}
