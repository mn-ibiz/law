import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getInvoices } from "@/lib/queries/billing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceStatusBadge } from "@/components/shared/status-badges";
import { EmptyState } from "@/components/shared/empty-state";
import { InvoiceRowActions } from "@/components/billing/invoice-row-actions";
import { formatKES } from "@/lib/utils/format";
import { APP_LOCALE } from "@/lib/constants/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing",
  description: "Invoices, payments, and fee notes",
};

export default async function BillingPage() {
  const session = await requireAdminOrAttorney();
  const invoiceList = await getInvoices();
  const userRole = session.user.role;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground">Invoices, payments, and fee notes.</p>
        </div>
        <Button size="sm" asChild>
          <Link href="/billing/new">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Invoice
          </Link>
        </Button>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {invoiceList.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No invoices yet"
              description="Create your first invoice to start billing clients."
              actionLabel="New Invoice"
              actionHref="/billing/new"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Invoice #</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Client</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Case</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Paid</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Due Date</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoiceList.map((inv) => (
                  <TableRow key={inv.id} className="transition-colors hover:bg-muted/50">
                    <TableCell>
                      <Link href={`/billing/${inv.id}`} className="font-mono text-primary hover:underline">
                        {inv.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{inv.clientName}</TableCell>
                    <TableCell className="font-mono text-xs">{inv.caseNumber ?? "\u2014"}</TableCell>
                    <TableCell>{formatKES(Number(inv.totalAmount))}</TableCell>
                    <TableCell>{formatKES(Number(inv.paidAmount))}</TableCell>
                    <TableCell>
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString(APP_LOCALE) : "\u2014"}
                    </TableCell>
                    <TableCell>
                      <InvoiceStatusBadge status={inv.status} />
                    </TableCell>
                    <TableCell>
                      <InvoiceRowActions
                        invoiceId={inv.id}
                        status={inv.status}
                        totalAmount={Number(inv.totalAmount)}
                        paidAmount={Number(inv.paidAmount)}
                        userRole={userRole}
                      />
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
