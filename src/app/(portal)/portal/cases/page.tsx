import { requireAuth } from "@/lib/auth/get-session";
import { getPortalCases } from "@/lib/queries/portal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default async function PortalCasesPage() {
  const session = await requireAuth();
  const cases = await getPortalCases(session.user.id as string);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Cases</h1>
        <p className="text-muted-foreground">View your active cases and matters.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Cases</CardTitle></CardHeader>
        <CardContent>
          {cases.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active cases.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case #</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono">{c.caseNumber}</TableCell>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell className="capitalize">{c.caseType.replace("_", " ")}</TableCell>
                    <TableCell><Badge variant="outline">{c.status.replace("_", " ")}</Badge></TableCell>
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
