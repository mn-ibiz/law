import { requireOrg } from "@/lib/auth/get-session";
import { getRequisitions } from "@/lib/queries/time-expenses";
import { getCasesForSelect } from "@/lib/queries/trust";
import { Card, CardContent } from "@/components/ui/card";
import { RequisitionDataTable } from "@/components/requisitions/requisition-data-table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/format";
import { getOrgConfig } from "@/lib/utils/tenant-config";
import { Plus, ClipboardList, CheckCircle2, Clock, DollarSign } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Requisitions",
  description: "Manage expense requisitions and approvals",
};

export default async function RequisitionsPage() {
  const { session, organizationId } = await requireOrg();
  const [reqs, cases, config] = await Promise.all([getRequisitions(organizationId), getCasesForSelect(organizationId), getOrgConfig(organizationId)]);
  const userRole = session.user.role;

  const pendingCount = reqs.filter((r) => r.status === "pending_approval").length;
  const approvedCount = reqs.filter((r) => r.status === "approved").length;
  const totalAmount = reqs.reduce((sum, r) => sum + Number(r.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Requisitions</h1>
            <p className="text-sm text-muted-foreground">
              Expense requisitions and purchase orders.
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/requisitions/new">
            <Plus className="mr-2 h-4 w-4" />
            New Requisition
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{reqs.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold">{approvedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(totalAmount, config.currency, config.locale)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <RequisitionDataTable data={reqs} userRole={userRole} cases={cases} />
    </div>
  );
}
