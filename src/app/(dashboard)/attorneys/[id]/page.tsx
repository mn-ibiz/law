import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireOrg } from "@/lib/auth/get-session";
import { getAttorneyById, getAttorneyIndemnity, getAttorneyLskMemberships } from "@/lib/queries/attorneys";
import { getActiveDisciplinaryProceedings } from "@/lib/queries/disciplinary";
import { AttorneyDetailTabs } from "@/components/attorneys/attorney-detail-tabs";
import { DisciplinaryAlert } from "@/components/attorneys/disciplinary-alert";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatEnum } from "@/lib/utils/format-enum";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { organizationId } = await requireOrg();
  const { id } = await params;
  const attorney = await getAttorneyById(organizationId, id);
  return {
    title: attorney ? attorney.name : "Attorney Details",
    description: attorney ? `Profile for ${attorney.name}` : "Attorney profile details",
  };
}

export default async function AttorneyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { organizationId } = await requireOrg();
  const { id } = await params;
  const attorney = await getAttorneyById(organizationId, id);
  if (!attorney) notFound();

  const [activeDisciplinary, indemnityRecords, lskMembershipRecords] = await Promise.all([
    getActiveDisciplinaryProceedings(organizationId, id),
    getAttorneyIndemnity(organizationId, id),
    getAttorneyLskMemberships(organizationId, id),
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
        <Avatar className="h-20 w-20">
          {attorney.photoUrl && (
            <AvatarImage src={attorney.photoUrl} alt={attorney.name} />
          )}
          <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
            {attorney.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </AvatarFallback>
        </Avatar>
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
