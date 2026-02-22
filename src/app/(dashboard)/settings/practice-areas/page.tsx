import { requireAdmin } from "@/lib/auth/get-session";
import { getPracticeAreas, getBillingRates } from "@/lib/queries/settings";
import { formatKES } from "@/lib/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Practice Areas",
  description: "Manage practice areas and billing rates",
};

export default async function PracticeAreasPage() {
  await requireAdmin();
  const [areas, rates] = await Promise.all([
    getPracticeAreas(),
    getBillingRates(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Practice Areas & Billing Rates</h1>
        <p className="text-muted-foreground">Configure practice areas and hourly billing rates.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Practice Areas</CardTitle></CardHeader>
          <CardContent>
            {areas.length === 0 ? (
              <p className="text-sm text-muted-foreground">No practice areas configured.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {areas.map((area) => (
                    <TableRow key={area.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{area.name}</p>
                          {area.description && (
                            <p className="text-xs text-muted-foreground">{area.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={area.isActive ? "default" : "secondary"}>
                          {area.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Billing Rates</CardTitle></CardHeader>
          <CardContent>
            {rates.length === 0 ? (
              <p className="text-sm text-muted-foreground">No billing rates configured.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Rate/Hour</TableHead>
                    <TableHead>Default</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rates.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{rate.name}</p>
                          {rate.description && (
                            <p className="text-xs text-muted-foreground">{rate.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatKES(Number(rate.ratePerHour))}
                      </TableCell>
                      <TableCell>
                        {rate.isDefault && <Badge>Default</Badge>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
