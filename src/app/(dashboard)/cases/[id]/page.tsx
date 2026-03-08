import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireOrg } from "@/lib/auth/get-session";
import { getCaseById, getCaseAssignments, getCaseNotes, getCaseTimeline, getCaseParties } from "@/lib/queries/cases";
import { getDocuments } from "@/lib/queries/documents";
import { getInvoices } from "@/lib/queries/billing";
import { getTimeEntries, getExpenses } from "@/lib/queries/time-expenses";
import { getDeadlines, getTasks } from "@/lib/queries/calendar";
import { getUsers } from "@/lib/queries/settings";
import { CaseDetailTabs } from "@/components/cases/case-detail-tabs";
import { CaseSummarySidebar } from "@/components/cases/case-summary-sidebar";
import { CaseStatusBadge, PriorityBadge } from "@/components/shared/status-badges";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { StatCard } from "@/components/shared/stat-card";
import { formatCurrency } from "@/lib/utils/format";
import { getOrgConfig } from "@/lib/utils/tenant-config";
import { Clock, Receipt, AlertTriangle, CheckCircle2 } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { organizationId } = await requireOrg();
  const { id } = await params;
  const caseData = await getCaseById(organizationId, id);
  return {
    title: caseData ? `${caseData.caseNumber} — ${caseData.title}` : "Case Details",
    description: caseData ? `Details for case ${caseData.caseNumber}` : "Case details",
  };
}

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { organizationId } = await requireOrg();
  const { id } = await params;
  const caseData = await getCaseById(organizationId, id);
  if (!caseData) notFound();

  const [assignments, notes, timeline, parties, documents, caseInvoices, caseTimeEntries, caseExpenses, caseDeadlines, caseTasks, allUsers, config] = await Promise.all([
    getCaseAssignments(organizationId, id),
    getCaseNotes(organizationId, id),
    getCaseTimeline(organizationId, id),
    getCaseParties(organizationId, id),
    getDocuments(organizationId, { caseId: id }),
    getInvoices(organizationId, { caseId: id }),
    getTimeEntries(organizationId, { caseId: id }),
    getExpenses(organizationId, { caseId: id }),
    getDeadlines(organizationId, { caseId: id }),
    getTasks(organizationId, { caseId: id }),
    getUsers(organizationId),
    getOrgConfig(organizationId),
  ]);

  // Compute financial stats
  const totalHours = caseTimeEntries.reduce((sum, t) => sum + Number(t.hours || 0), 0);
  const totalBilled = caseInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);
  const totalPaid = caseInvoices.reduce((sum, inv) => sum + Number(inv.paidAmount || 0), 0);
  const outstanding = totalBilled - totalPaid;
  const pendingDeadlines = caseDeadlines.filter((d) => !d.completedAt).length;
  const pendingTasks = caseTasks.filter((t) => t.status !== "completed" && t.status !== "cancelled").length;

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        items={[
          { label: "Cases", href: "/cases" },
          { label: `${caseData.caseNumber} - ${caseData.title}` },
        ]}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
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
      </div>

      {/* Financial KPI Strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Hours Tracked"
          value={totalHours.toFixed(1)}
          icon={Clock}
          description={`${caseTimeEntries.filter((t) => t.isBillable).length} billable entries`}
          color="blue"
        />
        <StatCard
          label="Total Billed"
          value={formatCurrency(totalBilled, config.currency, config.locale)}
          icon={Receipt}
          description={`${caseInvoices.length} invoice${caseInvoices.length !== 1 ? "s" : ""}`}
          color="emerald"
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(outstanding, config.currency, config.locale)}
          icon={AlertTriangle}
          description={outstanding > 0 ? "Unpaid balance" : "Fully paid"}
          color={outstanding > 0 ? "amber" : "emerald"}
        />
        <StatCard
          label="Open Items"
          value={pendingDeadlines + pendingTasks}
          icon={CheckCircle2}
          description={`${pendingDeadlines} deadline${pendingDeadlines !== 1 ? "s" : ""}, ${pendingTasks} task${pendingTasks !== 1 ? "s" : ""}`}
          color="purple"
        />
      </div>

      {/* Tabs row spans full width; content + sidebar are aligned below */}
      <CaseDetailTabs
        caseData={caseData}
        assignments={assignments}
        notes={notes}
        timeline={timeline}
        parties={parties}
        documents={documents}
        invoices={caseInvoices}
        timeEntries={caseTimeEntries}
        expenses={caseExpenses}
        deadlines={caseDeadlines}
        tasks={caseTasks}
        users={allUsers.filter((u) => u.role === "admin" || u.role === "attorney").map((u) => ({ id: u.id, name: u.name }))}
        sidebar={
          <CaseSummarySidebar
            caseData={caseData}
            assignments={assignments}
            deadlines={caseDeadlines}
            tasks={caseTasks}
          />
        }
      />
    </div>
  );
}
