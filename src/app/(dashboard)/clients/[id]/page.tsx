import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getClientById, getClientContacts } from "@/lib/queries/clients";
import { getClientKycDocuments, getClientRiskAssessment } from "@/lib/queries/kyc";
import { ClientDetailTabs } from "@/components/clients/client-detail-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminOrAttorney();
  const { id } = await params;
  const client = await getClientById(id);
  if (!client) notFound();

  const [contacts, kycDocuments, riskAssessment] = await Promise.all([
    getClientContacts(id),
    getClientKycDocuments(id),
    getClientRiskAssessment(id),
  ]);

  const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
    active: "default",
    inactive: "secondary",
    prospective: "outline",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {client.type === "organization" && client.companyName
                ? client.companyName
                : `${client.firstName} ${client.lastName}`}
            </h1>
            <p className="text-muted-foreground">{client.email}</p>
          </div>
          <Badge variant={statusVariant[client.status] ?? "secondary"}>
            {client.status}
          </Badge>
        </div>
        <Button asChild variant="outline">
          <Link href={`/clients/${id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>
      <ClientDetailTabs
        client={client}
        contacts={contacts}
        kycDocuments={kycDocuments}
        riskAssessment={riskAssessment}
      />
    </div>
  );
}
