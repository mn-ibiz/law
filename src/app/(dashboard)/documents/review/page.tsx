import { requireRole } from "@/lib/auth/get-session";
import { getPendingReviewDocuments } from "@/lib/queries/documents";
import { DocumentReviewQueue } from "@/components/documents/document-review-queue";
import { FileCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Document Review",
  description: "Review client-uploaded documents",
};

export default async function DocumentReviewPage() {
  await requireRole("admin", "attorney");
  const documents = await getPendingReviewDocuments();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <FileCheck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Document Review</h1>
          <p className="text-sm text-muted-foreground">
            Review and approve client-uploaded documents.
          </p>
        </div>
      </div>

      <DocumentReviewQueue documents={documents} />
    </div>
  );
}
