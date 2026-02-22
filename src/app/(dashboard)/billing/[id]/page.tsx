import { notFound } from "next/navigation";
import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getInvoiceById, getInvoiceLineItems, getInvoicePayments } from "@/lib/queries/billing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatKES } from "@/lib/utils/format";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminOrAttorney();
  const { id } = await params;
  const invoice = await getInvoiceById(id);
  if (!invoice) notFound();

  const [lineItems, paymentList] = await Promise.all([
    getInvoiceLineItems(id),
    getInvoicePayments(id),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-mono">{invoice.invoiceNumber}</h1>
          <p className="text-muted-foreground">{invoice.clientName} {invoice.caseNumber ? `— ${invoice.caseNumber}` : ""}</p>
        </div>
        <Badge>{invoice.status.replace("_", " ")}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Subtotal</p>
            <p className="text-2xl font-bold">{formatKES(Number(invoice.subtotal))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">VAT ({invoice.vatRate}%)</p>
            <p className="text-2xl font-bold">{formatKES(Number(invoice.vatAmount))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{formatKES(Number(invoice.totalAmount))}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Line Items</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatKES(Number(item.unitPrice))}</TableCell>
                  <TableCell className="text-right">{formatKES(Number(item.amount))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Payments</CardTitle></CardHeader>
        <CardContent>
          {paymentList.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments recorded.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Received By</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentList.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{new Date(p.paymentDate).toLocaleDateString("en-KE")}</TableCell>
                    <TableCell className="capitalize">{p.method.replace("_", " ")}</TableCell>
                    <TableCell>{p.reference ?? p.mpesaTransactionId ?? "—"}</TableCell>
                    <TableCell>{p.receivedByName ?? "—"}</TableCell>
                    <TableCell className="text-right font-medium">{formatKES(Number(p.amount))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <Separator className="my-4" />
          <div className="flex justify-between font-medium">
            <span>Balance Due</span>
            <span>{formatKES(Number(invoice.totalAmount) - Number(invoice.paidAmount))}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
