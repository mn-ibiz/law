import { requireOrg } from "@/lib/auth/get-session";
import { getCourtHierarchy, getAllCourtFilings, getAllServiceOfDocuments, getCourts } from "@/lib/queries/courts";
import { getCases } from "@/lib/queries/cases";
import { CourtsTabs } from "@/components/courts/courts-tabs";
import { Gavel } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courts",
  description: "Kenya court hierarchy, filings, and service of process",
};

export default async function CourtsPage() {
  const { session, organizationId } = await requireOrg();
  const isAdmin = session.user.role === "admin";
  const [hierarchy, filings, serviceRecords, courtList, caseResult] = await Promise.all([
    getCourtHierarchy(isAdmin),
    getAllCourtFilings(organizationId),
    getAllServiceOfDocuments(organizationId),
    getCourts(),
    getCases(organizationId, { limit: 200 }),
  ]);

  const cases = caseResult.data.map((c) => ({
    id: c.id,
    caseNumber: c.caseNumber,
    title: c.title,
  }));

  const courts = courtList.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Gavel className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Courts & Filings</h1>
          <p className="text-sm text-muted-foreground">
            Court hierarchy, filings, and service of process.
          </p>
        </div>
      </div>

      <CourtsTabs
        hierarchy={hierarchy}
        filings={filings}
        serviceRecords={serviceRecords}
        cases={cases}
        courts={courts}
        userRole={session.user.role}
      />
    </div>
  );
}
