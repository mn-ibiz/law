import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/get-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Attorney Performance",
  description: "View attorney performance metrics",
};

export default async function AttorneyPerformancePage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Attorney Performance</h1>
        <p className="text-muted-foreground">
          Firm-wide attorney performance comparison and benchmarking.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Firm-wide performance comparison table will be populated as cases, time entries, and billing data accumulate.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
