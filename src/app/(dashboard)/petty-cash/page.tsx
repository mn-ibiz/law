import { requireAdmin } from "@/lib/auth/get-session";
import { getPettyCashTransactions } from "@/lib/queries/trust";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionTypeBadge } from "@/components/shared/status-badges";
import { formatKES } from "@/lib/utils/format";
import { APP_LOCALE } from "@/lib/constants/locale";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { Wallet } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Petty Cash",
  description: "Track petty cash transactions",
};

export default async function PettyCashPage() {
  await requireAdmin();
  const transactions = await getPettyCashTransactions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Petty Cash</h1>
        <p className="text-muted-foreground">Track petty cash deposits and withdrawals.</p>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="No petty cash transactions"
              description="Record deposits and withdrawals to track petty cash activity."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Type</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Category</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">By</TableHead>
                  <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t.id} className="transition-colors hover:bg-muted/50">
                    <TableCell>{new Date(t.transactionDate).toLocaleDateString(APP_LOCALE)}</TableCell>
                    <TableCell>
                      <TransactionTypeBadge type={t.type} />
                    </TableCell>
                    <TableCell>{t.description}</TableCell>
                    <TableCell>{t.category ?? "—"}</TableCell>
                    <TableCell>{t.performedByName}</TableCell>
                    <TableCell className="text-right font-medium">{formatKES(Number(t.amount))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
