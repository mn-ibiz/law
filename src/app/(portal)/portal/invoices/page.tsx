import { requireRole } from "@/lib/auth/get-session";
import { getPortalInvoices } from "@/lib/queries/portal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatKES } from "@/lib/utils/format";
import { formatEnum } from "@/lib/utils/format-enum";
import { APP_LOCALE } from "@/lib/constants/locale";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Invoices",
  description: "View and track your invoices",
};

export default async function PortalInvoicesPage() {
  const session = await requireRole("client");
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
                    <TableCell><Badge variant="outline">{formatEnum(inv.status)}</Badge></TableCell>
                    <TableCell>{formatKES(Number(inv.totalAmount))}</TableCell>
                    <TableCell>{formatKES(Number(inv.paidAmount))}</TableCell>
                    <TableCell>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString(APP_LOCALE) : "—"}</TableCell>
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
