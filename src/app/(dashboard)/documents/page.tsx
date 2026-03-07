import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getDocuments } from "@/lib/queries/documents";
import { getCases } from "@/lib/queries/cases";
import { getClients } from "@/lib/queries/clients";
import { Card, CardContent } from "@/components/ui/card";
import { DocumentDataTable } from "@/components/documents/document-data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Plus, FolderOpen, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documents",
  description: "Manage legal documents and files",
};

export default async function DocumentsPage() {
  await requireAdminOrAttorney();
  const [docs, casesResult, clientsResult] = await Promise.all([
    getDocuments({ limit: 500 }),
    getCases({ limit: 200 }),
    getClients({ limit: 200 }),
  ]);

  const cases = casesResult.data.map((c) => ({
    id: c.id,
    caseNumber: c.caseNumber,
    title: c.title,
  }));

  const clients = clientsResult.data.map((c) => ({
    id: c.id,
    name: c.companyName || `${c.firstName} ${c.lastName}`,
  }));

  const draftCount = docs.filter((d) => d.status === "draft").length;
  const finalCount = docs.filter((d) => d.status === "final" || d.status === "signed").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
            <p className="text-sm text-muted-foreground">
              Manage case and client documents.
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/documents/new">
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Documents</p>
              <p className="text-2xl font-bold">{docs.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Drafts</p>
              <p className="text-2xl font-bold">{draftCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Final / Signed</p>
              <p className="text-2xl font-bold">{finalCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <DocumentDataTable data={docs} cases={cases} clients={clients} />
    </div>
  );
}
