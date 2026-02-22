import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getRequisitions } from "@/lib/queries/time-expenses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatKES } from "@/lib/utils/format";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  pending_approval: "outline",
  approved: "default",
  rejected: "destructive",
  completed: "secondary",
};

export default async function RequisitionsPage() {
  await requireAdminOrAttorney();
  const reqs = await getRequisitions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Requisitions</h1>
        <p className="text-muted-foreground">Expense requisitions and purchase orders.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Requisitions</CardTitle>
        </CardHeader>
        <CardContent>
          {reqs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No requisitions submitted.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Case</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reqs.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono">{r.requisitionNumber}</TableCell>
                    <TableCell>{r.description}</TableCell>
                    <TableCell className="font-mono text-xs">{r.caseNumber ?? "—"}</TableCell>
                    <TableCell>{r.requestedByName}</TableCell>
                    <TableCell>{formatKES(Number(r.amount))}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[r.status] ?? "secondary"}>
                        {r.status.replace("_", " ")}
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
