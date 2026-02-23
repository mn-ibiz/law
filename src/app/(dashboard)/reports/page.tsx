import { Suspense } from "react";
import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getCaseloadReport, getBillingReport, getProductivityReport, getClientReport } from "@/lib/queries/reports";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatKES } from "@/lib/utils/format";
import { CaseStatusBadge, InvoiceStatusBadge, ActiveBadge } from "@/components/shared/status-badges";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ReportFilters } from "@/components/reports/report-filters";
import { BarChart3, CreditCard, Clock, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports",
  description: "Financial and operational reports",
};

function parseDateParam(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
}

async function ReportContent({ startDate, endDate }: { startDate?: Date; endDate?: Date }) {
  const dateRange = { startDate, endDate };
  const [caseload, billing, productivity, clientReport] = await Promise.all([
    getCaseloadReport(dateRange),
    getBillingReport(dateRange),
    getProductivityReport(dateRange),
    getClientReport(dateRange),
  ]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Caseload by Status</CardTitle>
              <CardDescription className="text-xs">Case distribution{startDate || endDate ? " (filtered)" : ""}</CardDescription>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {caseload.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No cases in this period.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {caseload.map((row) => (
                  <TableRow key={row.status} className="transition-colors hover:bg-muted/50">
                    <TableCell><CaseStatusBadge status={row.status} /></TableCell>
                    <TableCell className="text-right font-semibold">{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Billing Summary</CardTitle>
              <CardDescription className="text-xs">Invoice status breakdown{startDate || endDate ? " (filtered)" : ""}</CardDescription>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <CreditCard className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {billing.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No invoices in this period.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Count</TableHead>
                  <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Total</TableHead>
                  <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billing.map((row) => (
                  <TableRow key={row.status} className="transition-colors hover:bg-muted/50">
                    <TableCell><InvoiceStatusBadge status={row.status} /></TableCell>
                    <TableCell className="text-right">{row.count}</TableCell>
                    <TableCell className="text-right font-medium">{formatKES(Number(row.totalAmount ?? 0))}</TableCell>
                    <TableCell className="text-right font-medium">{formatKES(Number(row.paidAmount ?? 0))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Productivity (Monthly)</CardTitle>
              <CardDescription className="text-xs">Hours logged per month{startDate || endDate ? " (filtered)" : ""}</CardDescription>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {productivity.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No time entries in this period.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Month</TableHead>
                  <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Hours</TableHead>
                  <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Billable</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productivity.map((row) => (
                  <TableRow key={row.month} className="transition-colors hover:bg-muted/50">
                    <TableCell className="font-medium">{row.month}</TableCell>
                    <TableCell className="text-right">{Number(row.totalHours ?? 0).toFixed(1)}</TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        {Number(row.billableHours ?? 0).toFixed(1)}h
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Client Distribution</CardTitle>
              <CardDescription className="text-xs">By status and type{startDate || endDate ? " (filtered)" : ""}</CardDescription>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {clientReport.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No clients in this period.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Type</TableHead>
                  <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientReport.map((row, i) => (
                  <TableRow key={i} className="transition-colors hover:bg-muted/50">
                    <TableCell><ActiveBadge active={row.status === "active"} /></TableCell>
                    <TableCell className="capitalize font-medium">{row.type}</TableCell>
                    <TableCell className="text-right font-semibold">{row.count}</TableCell>
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

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  await requireAdminOrAttorney();
  const params = await searchParams;
  const startDate = parseDateParam(params.start);
  const endDate = parseDateParam(params.end);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Firm-wide performance metrics and reports.
          </p>
        </div>
      </div>

      <Suspense>
        <ReportFilters />
      </Suspense>

      <Suspense fallback={<div className="animate-pulse h-96 bg-muted rounded-lg" />}>
        <ReportContent startDate={startDate} endDate={endDate} />
      </Suspense>
    </div>
  );
}
