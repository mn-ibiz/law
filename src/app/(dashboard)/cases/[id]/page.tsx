import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getCaseById, getCaseAssignments, getCaseNotes, getCaseTimeline, getCaseParties } from "@/lib/queries/cases";
import { CaseDetailTabs } from "@/components/cases/case-detail-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { formatEnum } from "@/lib/utils/format-enum";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const caseData = await getCaseById(id);
  return {
    title: caseData ? `${caseData.caseNumber} — ${caseData.title}` : "Case Details",
    description: caseData ? `Details for case ${caseData.caseNumber}` : "Case details",
  };
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  open: "outline",
  in_progress: "default",
  hearing: "default",
  resolved: "secondary",
  closed: "secondary",
  archived: "secondary",
};

const priorityVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  low: "secondary",
  medium: "outline",
  high: "default",
  urgent: "destructive",
};

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminOrAttorney();
  const { id } = await params;
  const caseData = await getCaseById(id);
  if (!caseData) notFound();

  const [assignments, notes, timeline, parties] = await Promise.all([
    getCaseAssignments(id),
    getCaseNotes(id),
    getCaseTimeline(id),
    getCaseParties(id),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{caseData.title}</h1>
            <Badge variant={statusVariant[caseData.status] ?? "secondary"}>
              {formatEnum(caseData.status)}
            </Badge>
            <Badge variant={priorityVariant[caseData.priority] ?? "secondary"}>
              {caseData.priority}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            <span className="font-mono">{caseData.caseNumber}</span>
            {" — "}
            <Link href={`/clients/${caseData.clientId}`} className="text-primary hover:underline">
              {caseData.clientName}
            </Link>
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/cases/${id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>
      <CaseDetailTabs
        caseData={caseData}
        assignments={assignments}
        notes={notes}
        timeline={timeline}
        parties={parties}
      />
    </div>
  );
}
