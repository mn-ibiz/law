import { requireOrg } from "@/lib/auth/get-session";
import { getInvoices } from "@/lib/queries/billing";
import { Card, CardContent } from "@/components/ui/card";
import { InvoiceDataTable } from "@/components/billing/invoice-data-table";
import { formatCurrency } from "@/lib/utils/format";
import { getOrgConfig } from "@/lib/utils/tenant-config";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, FileText, DollarSign, Clock, AlertTriangle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing",
  description: "Invoices, payments, and fee notes",
};

export default async function BillingPage() {
  const { organizationId, session } = await requireOrg();
  const [invoiceList, config] = await Promise.all([
    getInvoices(organizationId),
    getOrgConfig(organizationId),
  ]);
  const userRole = session.user.role;

  const totalOutstanding = invoiceList
    .filter((i) => !["paid", "cancelled", "written_off"].includes(i.status))
    .reduce((sum, i) => sum + Number(i.totalAmount) - Number(i.paidAmount), 0);

  const totalPaid = invoiceList
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + Number(i.totalAmount), 0);

  const overdueCount = invoiceList.filter((i) => i.status === "overdue").length;
  const draftCount = invoiceList.filter((i) => i.status === "draft").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
            <p className="text-sm text-muted-foreground">
              Invoices, payments, and fee notes.
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/billing/new">
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Invoices</p>
              <p className="text-2xl font-bold">{invoiceList.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Outstanding</p>
              <p className="text-2xl font-bold">{formatCurrency(totalOutstanding, config.currency, config.locale)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-2xl font-bold">{formatCurrency(totalPaid, config.currency, config.locale)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold">{overdueCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <InvoiceDataTable data={invoiceList} userRole={userRole} />
    </div>
  );
}
