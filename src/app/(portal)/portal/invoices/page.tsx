import { requireAuth } from "@/lib/auth/get-session";
import { getPortalInvoices } from "@/lib/queries/portal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatKES } from "@/lib/utils/format";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default async function PortalInvoicesPage() {
  const session = await requireAuth();
  const invoiceList = await getPortalInvoices(session.user.id as string);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Invoices</h1>
        <p className="text-muted-foreground">View invoices and payment history.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Invoices</CardTitle></CardHeader>
        <CardContent>
          {invoiceList.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoiceList.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono">{inv.invoiceNumber}</TableCell>
                    <TableCell><Badge variant="outline">{inv.status.replace("_", " ")}</Badge></TableCell>
                    <TableCell>{formatKES(Number(inv.totalAmount))}</TableCell>
                    <TableCell>{formatKES(Number(inv.paidAmount))}</TableCell>
                    <TableCell>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-KE") : "—"}</TableCell>
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
