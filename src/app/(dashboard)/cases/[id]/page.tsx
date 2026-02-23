import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getCaseById, getCaseAssignments, getCaseNotes, getCaseTimeline, getCaseParties } from "@/lib/queries/cases";
import { getDocuments } from "@/lib/queries/documents";
import { CaseDetailTabs } from "@/components/cases/case-detail-tabs";
import { CaseSummarySidebar } from "@/components/cases/case-summary-sidebar";
import { CaseStatusBadge, PriorityBadge } from "@/components/shared/status-badges";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const caseData = await getCaseById(id);
  return {
    title: caseData ? `${caseData.caseNumber} — ${caseData.title}` : "Case Details",
    description: caseData ? `Details for case ${caseData.caseNumber}` : "Case details",
  };
}

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminOrAttorney();
  const { id } = await params;
  const caseData = await getCaseById(id);
  if (!caseData) notFound();

  const [assignments, notes, timeline, parties, documents] = await Promise.all([
    getCaseAssignments(id),
    getCaseNotes(id),
    getCaseTimeline(id),
    getCaseParties(id),
    getDocuments({ caseId: id }),
  ]);

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        items={[
          { label: "Cases", href: "/cases" },
          { label: `${caseData.caseNumber} - ${caseData.title}` },
        ]}
      />

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{caseData.title}</h1>
          <CaseStatusBadge status={caseData.status} />
          <PriorityBadge priority={caseData.priority} />
        </div>
        <p className="mt-1 text-muted-foreground">
          <span className="font-mono text-xs">{caseData.caseNumber}</span>
          {" — "}
          <Link href={`/clients/${caseData.clientId}`} className="text-primary hover:underline">
            {caseData.clientName}
          </Link>
        </p>
      </div>

      {/* Tabs row spans full width; content + sidebar are aligned below */}
      <CaseDetailTabs
        caseData={caseData}
        assignments={assignments}
        notes={notes}
        timeline={timeline}
        parties={parties}
        documents={documents}
        sidebar={<CaseSummarySidebar caseData={caseData} assignments={assignments} />}
      />
    </div>
  );
}
