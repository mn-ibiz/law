import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getInvoices } from "@/lib/queries/billing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatKES } from "@/lib/utils/format";
import { formatEnum } from "@/lib/utils/format-enum";
import { APP_LOCALE } from "@/lib/constants/locale";
import Link from "next/link";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing",
  description: "Invoices, payments, and fee notes",
};

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  sent: "default",
  viewed: "default",
  partially_paid: "outline",
  paid: "secondary",
  overdue: "destructive",
  cancelled: "secondary",
  written_off: "secondary",
};

export default async function BillingPage() {
  await requireAdminOrAttorney();
  const invoiceList = await getInvoices();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground">Invoices, payments, and fee notes.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {invoiceList.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices created.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Case</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoiceList.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>
                      <Link href={`/billing/${inv.id}`} className="font-mono text-primary hover:underline">
                        {inv.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{inv.clientName}</TableCell>
                    <TableCell className="font-mono text-xs">{inv.caseNumber ?? "—"}</TableCell>
                    <TableCell>{formatKES(Number(inv.totalAmount))}</TableCell>
                    <TableCell>{formatKES(Number(inv.paidAmount))}</TableCell>
                    <TableCell>
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString(APP_LOCALE) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[inv.status] ?? "secondary"}>
                        {formatEnum(inv.status)}
                      </Badge>
                    </TableCell>
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
