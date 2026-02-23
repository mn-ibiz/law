import Link from "next/link";
import { requireAdmin } from "@/lib/auth/get-session";
import { getTrustAccounts, getClientsForSelect, getCasesForSelect } from "@/lib/queries/trust";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatKES } from "@/lib/utils/format";
import { formatEnum } from "@/lib/utils/format-enum";
import { cn } from "@/lib/utils";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { CreateTrustAccountDialog } from "@/components/trust/create-trust-account-dialog";
import { TrustTransactionDialog } from "@/components/trust/trust-transaction-dialog";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, ArrowUpFromLine, Landmark } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trust Accounts",
  description: "Manage client trust accounts",
};

const accountTypeStyles: Record<string, string> = {
  client: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  general: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20",
  office: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20",
  escrow: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
};

const capsule =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-none whitespace-nowrap";

export default async function TrustAccountsPage() {
  await requireAdmin();
  const [accounts, clients, cases] = await Promise.all([
    getTrustAccounts(),
    getClientsForSelect(),
    getCasesForSelect(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trust Accounts</h1>
          <p className="text-muted-foreground">Client trust and escrow account management.</p>
        </div>
        <CreateTrustAccountDialog clients={clients} cases={cases} />
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Trust Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <EmptyState
              icon={Landmark}
              title="No trust accounts"
              description="Create your first trust account to manage client funds securely."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Account Name</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Account Number</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Type</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Client</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bank</TableHead>
                    <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Balance</TableHead>
                    <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((a) => {
                    const balance = Number(a.balance);
                    return (
                      <TableRow key={a.id} className="transition-colors hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <Link
                            href={`/trust-accounts/${a.id}`}
                            className="hover:underline"
                          >
                            {a.accountName}
                          </Link>
                        </TableCell>
                        <TableCell className="font-mono">
                          <Link
                            href={`/trust-accounts/${a.id}`}
                            className="hover:underline"
                          >
                            {a.accountNumber}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <span className={cn(capsule, accountTypeStyles[a.type] ?? accountTypeStyles.client)}>
                            {formatEnum(a.type)}
                          </span>
                        </TableCell>
                        <TableCell>{a.clientName}</TableCell>
                        <TableCell>{a.bankName ?? "\u2014"}</TableCell>
                        <TableCell className="text-right font-medium">{formatKES(balance)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <TrustTransactionDialog
                              accountId={a.id}
                              type="deposit"
                              currentBalance={balance}
                              trigger={
                                <Button variant="ghost" size="icon-xs" title="Deposit">
                                  <ArrowDownToLine className="size-3.5 text-emerald-600" />
                                </Button>
                              }
                            />
                            <TrustTransactionDialog
                              accountId={a.id}
                              type="withdrawal"
                              currentBalance={balance}
                              trigger={
                                <Button variant="ghost" size="icon-xs" title="Withdraw">
                                  <ArrowUpFromLine className="size-3.5 text-amber-600" />
                                </Button>
                              }
                            />
                            <Button variant="ghost" size="icon-xs" asChild title="View details">
                              <Link href={`/trust-accounts/${a.id}`}>
                                <Landmark className="size-3.5" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
