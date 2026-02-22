import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getCaseloadReport, getBillingReport, getProductivityReport, getClientReport } from "@/lib/queries/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatKES } from "@/lib/utils/format";
import { formatEnum } from "@/lib/utils/format-enum";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports",
  description: "Financial and operational reports",
};

export default async function ReportsPage() {
  await requireAdminOrAttorney();
  const [caseload, billing, productivity, clientReport] = await Promise.all([
    getCaseloadReport(),
    getBillingReport(),
    getProductivityReport(),
    getClientReport(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground">Firm-wide performance metrics and reports.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Caseload by Status</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {caseload.map((row) => (
                  <TableRow key={row.status}>
                    <TableCell className="capitalize">{formatEnum(row.status)}</TableCell>
                    <TableCell className="text-right font-medium">{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Billing Summary</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billing.map((row) => (
                  <TableRow key={row.status}>
                    <TableCell className="capitalize">{formatEnum(row.status)}</TableCell>
                    <TableCell className="text-right">{row.count}</TableCell>
                    <TableCell className="text-right">{formatKES(Number(row.totalAmount ?? 0))}</TableCell>
                    <TableCell className="text-right">{formatKES(Number(row.paidAmount ?? 0))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Productivity (Monthly)</CardTitle></CardHeader>
          <CardContent>
            {productivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No time entries recorded.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Total Hours</TableHead>
                    <TableHead className="text-right">Billable Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productivity.map((row) => (
                    <TableRow key={row.month}>
                      <TableCell>{row.month}</TableCell>
                      <TableCell className="text-right">{Number(row.totalHours ?? 0).toFixed(1)}</TableCell>
                      <TableCell className="text-right">{Number(row.billableHours ?? 0).toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Client Distribution</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientReport.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="capitalize">{row.status}</TableCell>
                    <TableCell className="capitalize">{row.type}</TableCell>
                    <TableCell className="text-right font-medium">{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
