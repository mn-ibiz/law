import { requireAdmin } from "@/lib/auth/get-session";
import { getBranches } from "@/lib/queries/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BranchDataTable } from "@/components/branches/branch-data-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Branches",
  description: "Manage firm branch offices",
};

export default async function BranchesPage() {
  await requireAdmin();
  const branchList = await getBranches();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Branch Management</h1>
        <p className="text-muted-foreground">Manage multi-branch offices and locations.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>All Branches</CardTitle></CardHeader>
        <CardContent>
          <BranchDataTable data={branchList} />
        </CardContent>
      </Card>
    </div>
  );
}
