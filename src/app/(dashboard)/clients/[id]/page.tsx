import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireOrg } from "@/lib/auth/get-session";
import { getClientById, getClientContacts } from "@/lib/queries/clients";
import { getClientKycDocuments, getClientRiskAssessment } from "@/lib/queries/kyc";
import { ClientDetailTabs } from "@/components/clients/client-detail-tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { organizationId } = await requireOrg();
  const { id } = await params;
  const client = await getClientById(organizationId, id);
  const name = client ? `${client.firstName} ${client.lastName}` : "Client Details";
  return { title: name, description: client ? `Client profile for ${name}` : "Client details" };
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { organizationId } = await requireOrg();
  const { id } = await params;
  const client = await getClientById(organizationId, id);
  if (!client) notFound();

  const [contacts, kycDocuments, riskAssessment] = await Promise.all([
    getClientContacts(organizationId, id),
    getClientKycDocuments(organizationId, id),
    getClientRiskAssessment(organizationId, id),
  ]);

  const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
    active: "default",
    inactive: "secondary",
    prospective: "outline",
  };

  const clientName = client.type === "organization" && client.companyName
    ? client.companyName
    : `${client.firstName} ${client.lastName}`;

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        items={[
          { label: "Clients", href: "/clients" },
          { label: clientName },
        ]}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            {client.photoUrl && (
              <AvatarImage src={client.photoUrl} alt={clientName} />
            )}
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
              {clientName
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {clientName}
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
