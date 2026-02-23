import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getRequisitions } from "@/lib/queries/time-expenses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequisitionStatusBadge } from "@/components/shared/status-badges";
import { EmptyState } from "@/components/shared/empty-state";
import { RequisitionRowActions } from "@/components/requisitions/requisition-row-actions";
import { Button } from "@/components/ui/button";
import { formatKES } from "@/lib/utils/format";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, ClipboardList } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Requisitions",
  description: "Manage expense requisitions and approvals",
};

export default async function RequisitionsPage() {
  const session = await requireAdminOrAttorney();
  const reqs = await getRequisitions();
  const userRole = session.user.role;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Requisitions</h1>
          <p className="text-muted-foreground">Expense requisitions and purchase orders.</p>
        </div>
        <Button size="sm" asChild>
          <Link href="/requisitions/new">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Requisition
          </Link>
        </Button>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>All Requisitions</CardTitle>
        </CardHeader>
        <CardContent>
          {reqs.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No requisitions yet"
              description="Submit your first expense requisition to get started."
              actionLabel="New Requisition"
              actionHref="/requisitions/new"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Number</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Case</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Requested By</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reqs.map((r) => (
                  <TableRow key={r.id} className="transition-colors hover:bg-muted/50">
                    <TableCell className="font-mono">{r.requisitionNumber}</TableCell>
                    <TableCell>{r.description}</TableCell>
                    <TableCell className="font-mono text-xs">{r.caseNumber ?? "\u2014"}</TableCell>
                    <TableCell>{r.requestedByName}</TableCell>
                    <TableCell>{formatKES(Number(r.amount))}</TableCell>
                    <TableCell>
                      <RequisitionStatusBadge status={r.status} />
                    </TableCell>
                    <TableCell>
                      <RequisitionRowActions
                        requisitionId={r.id}
                        status={r.status}
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
