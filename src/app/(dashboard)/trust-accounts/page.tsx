import { requireAdmin } from "@/lib/auth/get-session";
import { getTrustAccounts } from "@/lib/queries/trust";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatKES } from "@/lib/utils/format";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default async function TrustAccountsPage() {
  await requireAdmin();
  const accounts = await getTrustAccounts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Trust Accounts</h1>
        <p className="text-muted-foreground">Client trust and escrow account management.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Trust Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No trust accounts configured.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Account Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.accountName}</TableCell>
                    <TableCell className="font-mono">{a.accountNumber}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{a.type}</Badge>
                    </TableCell>
                    <TableCell>{a.clientName}</TableCell>
                    <TableCell>{a.bankName ?? "—"}</TableCell>
                    <TableCell className="text-right font-medium">{formatKES(Number(a.balance))}</TableCell>
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
