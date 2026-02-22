import { requireAdmin } from "@/lib/auth/get-session";
import { getSuppliers } from "@/lib/queries/suppliers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suppliers",
  description: "Manage vendors and supplier invoices",
};

export default async function SuppliersPage() {
  await requireAdmin();
  const supplierList = await getSuppliers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">
            Manage vendors and supplier invoices.
          </p>
        </div>
        <Button asChild>
          <Link href="/suppliers/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Suppliers</CardTitle>
        </CardHeader>
        <CardContent>
          {supplierList.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No suppliers registered.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>KRA PIN</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplierList.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Link
                        href={`/suppliers/${s.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {s.name}
                      </Link>
                    </TableCell>
                    <TableCell>{s.contactPerson ?? "—"}</TableCell>
                    <TableCell>{s.email ?? "—"}</TableCell>
                    <TableCell>{s.phone ?? "—"}</TableCell>
                    <TableCell className="capitalize">
                      {s.category ?? "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {s.kraPin ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={s.isActive ? "default" : "secondary"}
                      >
                        {s.isActive ? "Active" : "Inactive"}
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
