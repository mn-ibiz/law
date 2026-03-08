import { requireRole, requireOrg } from "@/lib/auth/get-session";
import { getPortalDocuments } from "@/lib/queries/portal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatEnum } from "@/lib/utils/format-enum";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { getOrgConfig } from "@/lib/utils/tenant-config";
import { DocumentUploadForm } from "@/components/portal/document-upload-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Documents",
  description: "View and upload documents related to your cases",
};

export default async function PortalDocumentsPage() {
  const session = await requireRole("client");
  const { organizationId } = await requireOrg();
  const [docs, config] = await Promise.all([
    getPortalDocuments(organizationId, session.user.id as string),
    getOrgConfig(organizationId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Documents</h1>
        <p className="text-muted-foreground">View and upload documents related to your cases.</p>
      </div>

      <DocumentUploadForm />

      <Card>
        <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
        <CardContent>
          {docs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents available.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {docs.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{formatEnum(doc.category)}</Badge>
                    </TableCell>
                    <TableCell>{new Date(doc.createdAt).toLocaleDateString(config.locale)}</TableCell>
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
