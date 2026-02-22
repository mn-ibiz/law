import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getClientById } from "@/lib/queries/clients";
import { ClientForm } from "@/components/forms/client-form";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const client = await getClientById(id);
  const name = client ? `${client.firstName} ${client.lastName}` : "Client";
  return { title: `Edit ${name}`, description: "Update client information" };
}

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminOrAttorney();
  const { id } = await params;
  const client = await getClientById(id);
  if (!client) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Client</h1>
        <p className="text-muted-foreground">
          Update {client.firstName} {client.lastName}&apos;s information.
        </p>
      </div>
      <ClientForm
        defaultValues={{
          type: client.type as "individual" | "organization",
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          phone: client.phone,
          companyName: client.companyName ?? undefined,
          industry: client.industry ?? undefined,
          taxId: client.taxId ?? undefined,
          nationalId: client.nationalId ?? undefined,
          passportNumber: client.passportNumber ?? undefined,
          kraPin: client.kraPin ?? undefined,
          county: client.county ?? undefined,
          poBox: client.poBox ?? undefined,
          physicalAddress: client.physicalAddress ?? undefined,
          nextOfKin: client.nextOfKin ?? undefined,
          employer: client.employer ?? undefined,
          dateOfBirth: client.dateOfBirth?.toISOString().split("T")[0],
          referralSource: client.referralSource ?? undefined,
          notes: client.notes ?? undefined,
        }}
        clientId={id}
      />
    </div>
  );
}
