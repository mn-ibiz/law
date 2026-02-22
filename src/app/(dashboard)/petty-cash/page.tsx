import { requireAdmin } from "@/lib/auth/get-session";
import { getPettyCashTransactions } from "@/lib/queries/trust";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatKES } from "@/lib/utils/format";
import { APP_LOCALE } from "@/lib/constants/locale";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
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
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No petty cash transactions.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>By</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{new Date(t.transactionDate).toLocaleDateString(APP_LOCALE)}</TableCell>
                    <TableCell>
                      <Badge variant={t.type === "deposit" ? "default" : "outline"}>
                        {t.type}
                      </Badge>
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
