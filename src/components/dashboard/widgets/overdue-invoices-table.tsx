import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { CreditCard } from "lucide-react";
import { formatKES } from "@/lib/utils/format";

interface OverdueInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  totalAmount: string;
  paidAmount: string;
  dueDate: Date | null;
}

export function OverdueInvoicesTable({ data }: { data: OverdueInvoice[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Overdue Invoices</CardTitle>
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
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Invoice #</th>
                  <th className="pb-2 font-medium">Client</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Days Overdue</th>
                </tr>
              </thead>
              <tbody>
                {data.map((inv) => {
                  const balance =
                    Number(inv.totalAmount) - Number(inv.paidAmount);
                  const daysOverdue = inv.dueDate
                    ? Math.floor(
                        (Date.now() - new Date(inv.dueDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    : 0;
                  return (
                    <tr key={inv.id} className="border-b last:border-0">
                      <td className="py-2">
                        <Link
                          href={`/billing/${inv.id}`}
                          className="text-primary hover:underline"
                        >
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="py-2">{inv.clientName}</td>
                      <td className="py-2">{formatKES(balance)}</td>
                      <td className="py-2 text-destructive font-medium">
                        {daysOverdue} days
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
