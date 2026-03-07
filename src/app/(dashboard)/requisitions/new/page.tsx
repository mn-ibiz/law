import { requireOrg } from "@/lib/auth/get-session";
import { getCases } from "@/lib/queries/cases";
import { RequisitionForm } from "@/components/forms/requisition-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Requisition",
  description: "Submit a new expense requisition",
};

export default async function NewRequisitionPage() {
  const { organizationId } = await requireOrg();
  const { data: caseList } = await getCases(organizationId, {});

  const cases = caseList.map((c) => ({
    id: c.id,
    caseNumber: c.caseNumber,
    title: c.title,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Requisition</h1>
        <p className="text-muted-foreground">
          Submit a new expense requisition for approval.
        </p>
      </div>

      <RequisitionForm cases={cases} />
    </div>
  );
}
