import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getTimeEntries, getExpenses } from "@/lib/queries/time-expenses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatKES } from "@/lib/utils/format";
import Link from "next/link";

export default async function TimeExpensesPage() {
  await requireAdminOrAttorney();
  const [entries, expenseList] = await Promise.all([
    getTimeEntries(),
    getExpenses(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Time & Expenses</h1>
        <p className="text-muted-foreground">Track billable hours and expenses.</p>
      </div>
      <Tabs defaultValue="time">
        <TabsList>
          <TabsTrigger value="time">Time Entries</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>
        <TabsContent value="time">
          <Card>
            <CardHeader>
              <CardTitle>Time Entries</CardTitle>
            </CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No time entries recorded.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Case</TableHead>
                      <TableHead>Attorney</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Billable</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell>{new Date(e.date).toLocaleDateString("en-KE")}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{e.description}</TableCell>
                        <TableCell>
                          {e.caseNumber ? (
                            <span className="font-mono text-xs">{e.caseNumber}</span>
                          ) : "—"}
                        </TableCell>
                        <TableCell>{e.userName}</TableCell>
                        <TableCell>{e.hours}</TableCell>
                        <TableCell>{e.amount ? formatKES(Number(e.amount)) : "—"}</TableCell>
                        <TableCell>
                          <Badge variant={e.isBillable ? "default" : "secondary"}>
                            {e.isBillable ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              {expenseList.length === 0 ? (
                <p className="text-sm text-muted-foreground">No expenses recorded.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Case</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Billable</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenseList.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell>{new Date(e.date).toLocaleDateString("en-KE")}</TableCell>
                        <TableCell>{e.description}</TableCell>
                        <TableCell className="capitalize">{e.category.replace("_", " ")}</TableCell>
                        <TableCell className="font-mono text-xs">{e.caseNumber ?? "—"}</TableCell>
                        <TableCell>{formatKES(Number(e.amount))}</TableCell>
                        <TableCell>
                          <Badge variant={e.isBillable ? "default" : "secondary"}>
                            {e.isBillable ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
