import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getAttorneyById, getAttorneyIndemnity, getAttorneyLskMemberships } from "@/lib/queries/attorneys";
import { getActiveDisciplinaryProceedings } from "@/lib/queries/disciplinary";
import { AttorneyDetailTabs } from "@/components/attorneys/attorney-detail-tabs";
import { DisciplinaryAlert } from "@/components/attorneys/disciplinary-alert";
import { Badge } from "@/components/ui/badge";
import { formatEnum } from "@/lib/utils/format-enum";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const attorney = await getAttorneyById(id);
  return {
    title: attorney ? attorney.name : "Attorney Details",
    description: attorney ? `Profile for ${attorney.name}` : "Attorney profile details",
  };
}

export default async function AttorneyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminOrAttorney();
  const { id } = await params;
  const attorney = await getAttorneyById(id);
  if (!attorney) notFound();

  const [activeDisciplinary, indemnityRecords, lskMembershipRecords] = await Promise.all([
    getActiveDisciplinaryProceedings(id),
    getAttorneyIndemnity(id),
    getAttorneyLskMemberships(id),
  ]);

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        items={[
          { label: "Attorneys", href: "/attorneys" },
          { label: attorney.name },
        ]}
      />
      {activeDisciplinary > 0 && <DisciplinaryAlert count={activeDisciplinary} />}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{attorney.name}</h1>
          <p className="text-muted-foreground capitalize">
            {formatEnum(attorney.title)} {attorney.department ? `— ${attorney.department}` : ""}
          </p>
        </div>
        <Badge variant={attorney.isActive ? "default" : "secondary"}>
          {attorney.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>
      <AttorneyDetailTabs
        attorney={attorney}
        indemnityRecords={indemnityRecords}
        lskMembershipRecords={lskMembershipRecords}
      />
    </div>
  );
}
