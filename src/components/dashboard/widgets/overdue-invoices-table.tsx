import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { CreditCard, ArrowRight } from "lucide-react";
import { formatKES } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";

interface OverdueInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  totalAmount: string;
  paidAmount: string;
  dueDate: Date | null;
}

// Compute "now" outside render to satisfy React purity linting.
// In serverless this is effectively per-request; in long-lived servers it updates on redeploy/restart.
const NOW_MS = Date.now();

export function OverdueInvoicesTable({ data }: { data: OverdueInvoice[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Overdue Invoices</CardTitle>
            <CardDescription className="text-xs">Requires follow-up</CardDescription>
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Invoice #
                  </th>
                  <th className="pb-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Client
                  </th>
                  <th className="pb-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Balance
                  </th>
                  <th className="pb-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Overdue
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((inv) => {
                  const balance =
                    Number(inv.totalAmount) - Number(inv.paidAmount);
                  const daysOverdue = inv.dueDate
                    ? Math.floor(
                        (NOW_MS - new Date(inv.dueDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    : 0;
                  return (
                    <tr
                      key={inv.id}
                      className="border-b last:border-0 transition-colors hover:bg-muted/50"
                    >
                      <td className="py-2.5">
                        <Link
                          href={`/billing/${inv.id}`}
                          className="font-mono text-xs font-medium text-primary hover:underline"
                        >
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="py-2.5 text-muted-foreground">
                        {inv.clientName}
                      </td>
                      <td className="py-2.5 font-medium">{formatKES(balance)}</td>
                      <td className="py-2.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/20">
                          {daysOverdue}d overdue
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
