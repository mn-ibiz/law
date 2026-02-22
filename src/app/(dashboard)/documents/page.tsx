import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getDocuments } from "@/lib/queries/documents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { FileText } from "lucide-react";

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  draft: "outline",
  final: "default",
  signed: "default",
  archived: "secondary",
};

export default async function DocumentsPage() {
  await requireAdminOrAttorney();
  const docs = await getDocuments();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">Manage case and client documents.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {docs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents uploaded.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Case</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {docs.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.title}</TableCell>
                    <TableCell className="capitalize">{doc.category.replace("_", " ")}</TableCell>
                    <TableCell className="font-mono text-xs">{doc.caseNumber ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[doc.status] ?? "secondary"}>{doc.status}</Badge>
                    </TableCell>
                    <TableCell>{doc.uploadedByName}</TableCell>
                    <TableCell>{new Date(doc.createdAt).toLocaleDateString("en-KE")}</TableCell>
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
