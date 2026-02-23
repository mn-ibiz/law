import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getCaseById } from "@/lib/queries/cases";
import { getClients } from "@/lib/queries/clients";
import { CaseForm } from "@/components/forms/case-form";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const caseData = await getCaseById(id);
  return {
    title: caseData ? `Edit ${caseData.caseNumber}` : "Edit Case",
    description: "Update case details",
  };
}

export default async function EditCasePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminOrAttorney();
  const { id } = await params;
  const caseData = await getCaseById(id);
  if (!caseData) notFound();

  const { data: clientList } = await getClients({ limit: 200 });
  const clients = clientList.map((c) => ({
    id: c.id,
    name: c.companyName || `${c.firstName} ${c.lastName}`,
  }));

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        items={[
          { label: "Cases", href: "/cases" },
          { label: caseData.caseNumber, href: `/cases/${id}` },
          { label: "Edit" },
        ]}
      />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Case</h1>
        <p className="text-muted-foreground">
          Update case {caseData.caseNumber}.
        </p>
      </div>
      <CaseForm
        clients={clients}
        caseId={id}
        defaultValues={{
          title: caseData.title,
          fileNumber: caseData.fileNumber ?? undefined,
          clientId: caseData.clientId,
          caseType: caseData.caseType,
          practiceArea: caseData.practiceArea ?? undefined,
          priority: caseData.priority as "low" | "medium" | "high" | "urgent",
          billingType: caseData.billingType as "hourly" | "flat_fee" | "contingency" | "retainer" | "pro_bono",
          hourlyRate: caseData.hourlyRate ? Number(caseData.hourlyRate) : undefined,
          flatFeeAmount: caseData.flatFeeAmount ? Number(caseData.flatFeeAmount) : undefined,
          contingencyPercentage: caseData.contingencyPercentage ? Number(caseData.contingencyPercentage) : undefined,
          courtName: caseData.courtName ?? undefined,
          courtCaseNumber: caseData.courtCaseNumber ?? undefined,
          judge: caseData.judge ?? undefined,
          opposingCounsel: caseData.opposingCounsel ?? undefined,
          opposingParty: caseData.opposingParty ?? undefined,
          statuteOfLimitations: caseData.statuteOfLimitations?.toISOString().split("T")[0],
          dateFiled: caseData.dateFiled?.toISOString().split("T")[0],
          estimatedValue: caseData.estimatedValue ? Number(caseData.estimatedValue) : undefined,
          description: caseData.description ?? undefined,
          notes: caseData.notes ?? undefined,
        }}
      />
    </div>
  );
}
