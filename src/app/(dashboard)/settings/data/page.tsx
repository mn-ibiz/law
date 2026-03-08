import { requireRole, getTenantContext } from "@/lib/auth/get-session";
import { getRecentDataOperations } from "@/lib/queries/settings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Upload, Download, Database } from "lucide-react";
import { formatEnum } from "@/lib/utils/format-enum";
import { getOrgConfig } from "@/lib/utils/tenant-config";
import { DataExportButton } from "@/components/settings/data-export-button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Management",
  description: "Import, export, and manage system data",
};

export default async function DataManagementPage() {
  await requireRole("admin");
  const { organizationId } = await getTenantContext();

  const [recentDataOps, config] = await Promise.all([
    getRecentDataOperations(organizationId),
    getOrgConfig(organizationId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Management</h1>
        <p className="text-muted-foreground">Import, export, and backup your firm data.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Upload className="h-5 w-5" />
              Import Data
            </CardTitle>
            <CardDescription>Import clients, cases, and contacts from CSV files.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Supported formats: CSV. Upload files with column headers matching system fields.
              Templates available for clients, attorneys, and cases.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Download className="h-5 w-5" />
              Export Data
            </CardTitle>
            <CardDescription>Export your firm data for reporting or migration.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Export all organization data as JSON. Compliant with Kenya Data Protection Act requirements.
              Rate limited to 1 export per hour.
            </p>
            <DataExportButton />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5" />
              Backup
            </CardTitle>
            <CardDescription>Database backup and restoration tools.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Automated daily backups are managed by Neon. Manual snapshots can be
              triggered from the Neon dashboard for point-in-time recovery.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Data Operations</CardTitle></CardHeader>
        <CardContent>
          {recentDataOps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent data operations.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentDataOps.map((op) => (
                  <TableRow key={op.id}>
                    <TableCell className="text-xs">
                      {new Date(op.createdAt).toLocaleString(config.locale)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{op.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{op.action}</Badge>
                    </TableCell>
                    <TableCell className="capitalize">{formatEnum(op.entityType)}</TableCell>
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
