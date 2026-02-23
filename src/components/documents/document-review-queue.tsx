"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Check, X, ExternalLink } from "lucide-react";
import { approveDocument, rejectDocument } from "@/lib/actions/documents";
import { useRouter } from "next/navigation";
import { formatEnum } from "@/lib/utils/format-enum";

interface ReviewDocument {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  category: string;
  description: string | null;
  reviewStatus: string | null;
  createdAt: Date;
  uploaderName: string | null;
}

export function DocumentReviewQueue({ documents }: { documents: ReviewDocument[] }) {
  const router = useRouter();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  async function handleApprove(id: string) {
    setLoading(id);
    await approveDocument(id);
    router.refresh();
    setLoading(null);
  }

  async function handleReject(id: string) {
    setLoading(id);
    await rejectDocument(id, rejectNotes);
    setRejectingId(null);
    setRejectNotes("");
    router.refresh();
    setLoading(null);
  }

  if (documents.length === 0) {
    return (
      <div className="py-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/30" />
        <p className="mt-4 text-lg font-medium">No documents pending review</p>
        <p className="text-sm text-muted-foreground">
          Client uploads will appear here for approval.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <Card key={doc.id}>
          <CardContent className="flex items-start justify-between gap-4 p-4">
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium">{doc.title}</p>
                <p className="text-sm text-muted-foreground">{doc.fileName}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">{formatEnum(doc.category)}</Badge>
                  <span>by {doc.uploaderName ?? "Unknown"}</span>
                  <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                </div>
                {doc.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{doc.description}</p>
                )}

                {rejectingId === doc.id && (
                  <div className="mt-3 space-y-2">
                    <Textarea
                      placeholder="Reason for rejection..."
                      value={rejectNotes}
                      onChange={(e) => setRejectNotes(e.target.value)}
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(doc.id)}
                        disabled={loading === doc.id}
                      >
                        Confirm Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setRejectingId(null); setRejectNotes(""); }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-1 h-3 w-3" /> View
                </Button>
              </a>
              <Button
                size="sm"
                onClick={() => handleApprove(doc.id)}
                disabled={loading === doc.id}
              >
                <Check className="mr-1 h-3 w-3" /> Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setRejectingId(doc.id)}
                disabled={loading === doc.id}
              >
                <X className="mr-1 h-3 w-3" /> Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
