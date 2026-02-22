import { requireAdmin } from "@/lib/auth/get-session";
import { getBranches } from "@/lib/queries/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
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
          {branchList.length === 0 ? (
            <p className="text-sm text-muted-foreground">No branches configured.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branchList.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {branch.address && <p>{branch.address}</p>}
                        <p className="text-muted-foreground">
                          {[branch.city, branch.county].filter(Boolean).join(", ") || "—"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {branch.phone && <p>{branch.phone}</p>}
                        {branch.email && <p className="text-muted-foreground">{branch.email}</p>}
                        {!branch.phone && !branch.email && "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {branch.isMain ? (
                        <Badge>Head Office</Badge>
                      ) : (
                        <Badge variant="outline">Branch</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={branch.isActive ? "default" : "secondary"}>
                        {branch.isActive ? "Active" : "Inactive"}
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
