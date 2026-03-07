import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/get-session";
import { getSupplierById, getSupplierInvoices } from "@/lib/queries/suppliers";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatKES } from "@/lib/utils/format";
import { APP_LOCALE } from "@/lib/constants/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil, ExternalLink, Building2 } from "lucide-react";
import { SupplierInvoiceActions } from "@/components/suppliers/supplier-invoice-actions";
import { SupplierInvoiceDialog } from "@/components/suppliers/supplier-invoice-dialog";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supplier = await getSupplierById(id);
  return {
    title: supplier ? supplier.name : "Supplier Details",
    description: supplier ? `Supplier profile for ${supplier.name}` : "Supplier details",
  };
}

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [supplier, invoices] = await Promise.all([
    getSupplierById(id),
    getSupplierInvoices(id),
  ]);

  if (!supplier) notFound();

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        items={[
          { label: "Suppliers", href: "/suppliers" },
          { label: supplier.name },
        ]}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            {supplier.logoUrl && (
              <AvatarImage src={supplier.logoUrl} alt={supplier.name} />
            )}
            <AvatarFallback className="bg-primary/10 text-primary">
              <Building2 className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{supplier.name}</h1>
            <p className="text-muted-foreground">Supplier details and invoices.</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/suppliers/${id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Contact Person</dt>
                <dd className="text-sm">{supplier.contactPerson ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                <dd className="text-sm">{supplier.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                <dd className="text-sm">{supplier.phone ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Address</dt>
                <dd className="text-sm">{supplier.address ?? "—"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Category</dt>
                <dd className="text-sm capitalize">{supplier.category ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">KRA PIN</dt>
                <dd className="text-sm font-mono">{supplier.kraPin ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Bank</dt>
                <dd className="text-sm">{supplier.bankName ?? "—"} {supplier.bankBranch ? `(${supplier.bankBranch})` : ""}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Account Number</dt>
                <dd className="text-sm font-mono">{supplier.bankAccountNumber ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                <dd className="text-sm">
                  <Badge variant={supplier.isActive ? "default" : "secondary"}>
                    {supplier.isActive ? "Active" : "Inactive"}
                  </Badge>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Invoices</CardTitle>
          <SupplierInvoiceDialog supplierId={id} />
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices recorded.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>VAT</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-xs">{inv.invoiceNumber}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{inv.description ?? "—"}</TableCell>
                    <TableCell>{new Date(inv.invoiceDate).toLocaleDateString(APP_LOCALE)}</TableCell>
                    <TableCell>{formatKES(Number(inv.amount))}</TableCell>
                    <TableCell>{formatKES(Number(inv.vatAmount))}</TableCell>
                    <TableCell className="font-medium">{formatKES(Number(inv.totalAmount))}</TableCell>
                    <TableCell>
                      <Badge variant={inv.status === "paid" ? "secondary" : inv.status === "pending" ? "outline" : "default"}>
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {inv.fileUrl ? (
                        <a href={inv.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 text-xs">
                          <ExternalLink className="h-3 w-3" />
                          View
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <SupplierInvoiceActions invoiceId={inv.id} status={inv.status} fileUrl={inv.fileUrl} />
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
