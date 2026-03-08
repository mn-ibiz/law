import { requireOrg } from "@/lib/auth/get-session";
import { getQuotes } from "@/lib/queries/billing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuoteStatusBadge } from "@/components/shared/status-badges";
import { EmptyState } from "@/components/shared/empty-state";
import { QuoteRowActions } from "@/components/billing/quote-row-actions";
import { formatCurrency } from "@/lib/utils/format";
import { getOrgConfig } from "@/lib/utils/tenant-config";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quotes",
  description: "Manage client quotes and estimates",
};

export default async function QuotesPage() {
  const { organizationId, session } = await requireOrg();
  const [quoteList, config] = await Promise.all([
    getQuotes(organizationId),
    getOrgConfig(organizationId),
  ]);
  const userRole = session.user.role;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quotes</h1>
          <p className="text-muted-foreground">Manage client quotes and estimates.</p>
        </div>
        <Button size="sm" asChild>
          <Link href="/billing/quotes/new">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Quote
          </Link>
        </Button>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>All Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          {quoteList.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No quotes yet"
              description="Create your first quote to start sending estimates to clients."
              actionLabel="New Quote"
              actionHref="/billing/quotes/new"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Quote #</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Client</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Valid Until</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Created</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quoteList.map((qt) => (
                  <TableRow key={qt.id} className="transition-colors hover:bg-muted/50">
                    <TableCell className="font-mono text-primary">{qt.quoteNumber}</TableCell>
                    <TableCell>{qt.clientName}</TableCell>
                    <TableCell>{formatCurrency(Number(qt.totalAmount), config.currency, config.locale)}</TableCell>
                    <TableCell>
                      <QuoteStatusBadge status={qt.status} />
                    </TableCell>
                    <TableCell>
                      {qt.validUntil ? new Date(qt.validUntil).toLocaleDateString(config.locale) : "\u2014"}
                    </TableCell>
                    <TableCell>
                      {new Date(qt.createdAt).toLocaleDateString(config.locale)}
                    </TableCell>
                    <TableCell>
                      <QuoteRowActions
                        quoteId={qt.id}
                        status={qt.status}
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
