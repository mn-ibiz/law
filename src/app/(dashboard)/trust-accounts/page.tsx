import { requireAdmin } from "@/lib/auth/get-session";
import { getTrustAccounts, getClientsForSelect, getCasesForSelect } from "@/lib/queries/trust";
import { Card, CardContent } from "@/components/ui/card";
import { formatKES } from "@/lib/utils/format";
import { TrustAccountDataTable } from "@/components/trust/trust-account-data-table";
import { CreateTrustAccountDialog } from "@/components/trust/create-trust-account-dialog";
import { Landmark, DollarSign, Wallet } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trust Accounts",
  description: "Manage client trust accounts",
};

export default async function TrustAccountsPage() {
  await requireAdmin();
  const [accounts, clients, cases] = await Promise.all([
    getTrustAccounts(),
    getClientsForSelect(),
    getCasesForSelect(),
  ]);

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);
  const clientAccounts = accounts.filter((a) => a.type === "client").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Landmark className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Trust Accounts</h1>
            <p className="text-sm text-muted-foreground">
              Client trust and escrow account management.
            </p>
          </div>
        </div>
        <CreateTrustAccountDialog clients={clients} cases={cases} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Accounts</p>
              <p className="text-2xl font-bold">{accounts.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Balance</p>
              <p className="text-2xl font-bold">{formatKES(totalBalance)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Client Accounts</p>
              <p className="text-2xl font-bold">{clientAccounts}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <TrustAccountDataTable data={accounts} />
    </div>
  );
}
