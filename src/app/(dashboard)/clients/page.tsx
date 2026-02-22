import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getClients } from "@/lib/queries/clients";
import { ClientDataTable } from "@/components/clients/client-data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Clients",
  description: "Manage client records and KYC compliance",
};

export default async function ClientsPage() {
  await requireAdminOrAttorney();
  const { data } = await getClients();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage client records and KYC compliance.</p>
        </div>
        <Button asChild>
          <Link href="/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Link>
        </Button>
      </div>
      <ClientDataTable data={data} />
    </div>
  );
}
