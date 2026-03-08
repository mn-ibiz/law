import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { CreditCard, ArrowRight, Receipt } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { getOrgConfig } from "@/lib/utils/tenant-config";
import { requireOrg } from "@/lib/auth/get-session";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { Button } from "@/components/ui/button";

interface OverdueInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientPhotoUrl: string | null;
  totalAmount: string;
  paidAmount: string;
  dueDate: Date | null;
}

// Compute "now" outside render to satisfy React purity linting.
const NOW_MS = Date.now();

function getDaysOverdue(dueDate: Date | null): number {
  if (!dueDate) return 0;
  return Math.floor((NOW_MS - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24));
}

function OverdueSeverity({ days }: { days: number }) {
  if (days > 60) {
    return (
      <Badge variant="secondary" className="bg-rose-500/10 text-rose-700 border-rose-200 text-[10px] font-semibold">
        {days}d overdue
      </Badge>
    );
  }
  if (days > 30) {
    return (
      <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 border-amber-200 text-[10px] font-semibold">
        {days}d overdue
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="bg-orange-500/10 text-orange-700 border-orange-200 text-[10px] font-semibold">
      {days}d overdue
    </Badge>
  );
}

export async function OverdueInvoicesTable({ data }: { data: OverdueInvoice[] }) {
  const { organizationId } = await requireOrg();
  const config = await getOrgConfig(organizationId);
  const totalOverdue = data.reduce(
    (sum, inv) => sum + (Number(inv.totalAmount) - Number(inv.paidAmount)),
    0
  );

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10">
              <Receipt className="h-4.5 w-4.5 text-rose-600" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Overdue Invoices</CardTitle>
              <p className="text-xs text-muted-foreground">
                {data.length > 0
                  ? `${formatCurrency(totalOverdue, config.currency, config.locale)} outstanding`
                  : "Requires follow-up"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="gap-1 text-xs" asChild>
            <Link href="/billing">
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No overdue invoices"
            description="All invoices are on track."
          />
        ) : (
          <div className="space-y-1">
            {data.map((inv) => {
              const balance = Number(inv.totalAmount) - Number(inv.paidAmount);
              const days = getDaysOverdue(inv.dueDate);
              return (
                <div
                  key={inv.id}
                  className="flex items-center justify-between gap-3 rounded-lg p-2.5 text-sm transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/billing/${inv.id}`}
                        className="font-mono text-xs font-semibold text-primary hover:underline"
                      >
                        {inv.invoiceNumber}
                      </Link>
                      <PersonAvatar name={inv.clientName} imageUrl={inv.clientPhotoUrl} size="sm" />
                      <span className="truncate text-xs text-muted-foreground">
                        {inv.clientName}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs font-semibold">{formatCurrency(balance, config.currency, config.locale)}</p>
                  </div>
                  <OverdueSeverity days={days} />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
