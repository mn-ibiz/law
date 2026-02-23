"use client";

import { useRouter } from "next/navigation";
import { FileUploadDropzone } from "@/components/documents/file-upload-dropzone";
import { FileTypeIcon } from "@/components/documents/file-type-icon";
import { formatFileSize } from "@/lib/utils/format-file-size";
import { formatEnum } from "@/lib/utils/format-enum";
import { APP_LOCALE } from "@/lib/constants/locale";
import { FileText } from "lucide-react";

interface Doc {
  id: string;
  title: string;
  category: string;
  status: string;
  fileName: string;
  fileSize: number | null;
  fileUrl: string;
  mimeType: string | null;
  createdAt: Date;
  uploadedByName: string | null;
}

interface CaseDocumentsTabProps {
  caseId: string;
  documents: Doc[];
}

export function CaseDocumentsTab({ caseId, documents }: CaseDocumentsTabProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <FileUploadDropzone
        caseId={caseId}
        onUploadComplete={() => router.refresh()}
      />

      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold">No documents yet</h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Upload files using the dropzone above to attach documents to this case.
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          {documents.map((doc) => (
            <a
              key={doc.id}
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <FileTypeIcon mimeType={doc.mimeType} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatEnum(doc.category)} · {formatEnum(doc.status)} · {formatFileSize(doc.fileSize)}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground">
                  {new Date(doc.createdAt).toLocaleDateString(APP_LOCALE)}
                </p>
                {doc.uploadedByName && (
                  <p className="text-xs text-muted-foreground">{doc.uploadedByName}</p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
