import type { Metadata } from "next";
import Link from "next/link";
import { requireOrg } from "@/lib/auth/get-session";
import { getClients } from "@/lib/queries/clients";
import { ClientDataTable } from "@/components/clients/client-data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Kanban, Plus, Users, UserCheck, ShieldAlert, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Clients",
  description: "Manage client records and KYC compliance",
};

export default async function ClientsPage() {
  const { organizationId } = await requireOrg();
  const { data } = await getClients(organizationId, { limit: 500 });

  const activeCount = data.filter((c) => c.status === "active").length;
  const pepCount = data.filter((c) => c.isPep).length;
  const orgCount = data.filter((c) => c.type === "organization").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
            <p className="text-sm text-muted-foreground">
              Manage client records and KYC compliance.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/clients/pipeline">
              <Kanban className="mr-2 h-4 w-4" />
              Pipeline View
            </Link>
          </Button>
          <Button asChild>
            <Link href="/clients/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Clients</p>
              <p className="text-2xl font-bold">{data.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">{activeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Organizations</p>
              <p className="text-2xl font-bold">{orgCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">PEP Flagged</p>
              <p className="text-2xl font-bold">{pepCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ClientDataTable data={data} />
    </div>
  );
}
