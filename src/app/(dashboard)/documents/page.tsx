import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getDocuments } from "@/lib/queries/documents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { DocumentRowActions } from "@/components/documents/document-row-actions";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { formatEnum } from "@/lib/utils/format-enum";
import { APP_LOCALE } from "@/lib/constants/locale";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documents",
  description: "Manage legal documents and files",
};

const capsule =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-none whitespace-nowrap";

const docStatusStyles: Record<string, string> = {
  draft: "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/20",
  final: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  signed: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  archived: "bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-500/20",
};

export default async function DocumentsPage() {
  await requireAdminOrAttorney();
  const docs = await getDocuments();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">Manage case and client documents.</p>
        </div>
        <Button size="sm" asChild>
          <Link href="/documents/new">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Upload Document
          </Link>
        </Button>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {docs.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No documents yet"
              description="Upload your first document to get started."
              actionLabel="Upload Document"
              actionHref="/documents/new"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Title</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Category</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Case</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Uploaded By</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {docs.map((doc) => (
                  <TableRow key={doc.id} className="transition-colors hover:bg-muted/50">
                    <TableCell className="font-medium">{doc.title}</TableCell>
                    <TableCell className="capitalize">{formatEnum(doc.category)}</TableCell>
                    <TableCell className="font-mono text-xs">{doc.caseNumber ?? "\u2014"}</TableCell>
                    <TableCell>
                      <span className={cn(capsule, docStatusStyles[doc.status] ?? docStatusStyles.draft)}>
                        {formatEnum(doc.status)}
                      </span>
                    </TableCell>
                    <TableCell>{doc.uploadedByName}</TableCell>
                    <TableCell>{new Date(doc.createdAt).toLocaleDateString(APP_LOCALE)}</TableCell>
                    <TableCell>
                      <DocumentRowActions
                        documentId={doc.id}
                        status={doc.status}
                      />
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
