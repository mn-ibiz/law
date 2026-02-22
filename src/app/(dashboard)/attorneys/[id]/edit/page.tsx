import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/get-session";
import { getAttorneyById } from "@/lib/queries/attorneys";
import { AttorneyForm } from "@/components/forms/attorney-form";

export default async function EditAttorneyPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const attorney = await getAttorneyById(id);
  if (!attorney) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Attorney</h1>
        <p className="text-muted-foreground">Update {attorney.name}&apos;s profile.</p>
      </div>
      <AttorneyForm
        defaultValues={{
          barNumber: attorney.barNumber,
          jurisdiction: attorney.jurisdiction,
          title: attorney.title as "partner" | "senior_associate" | "associate" | "of_counsel" | "paralegal",
          department: attorney.department ?? undefined,
          hourlyRate: attorney.hourlyRate ? Number(attorney.hourlyRate) : undefined,
          dateAdmitted: attorney.dateAdmitted?.toISOString().split("T")[0],
          bio: attorney.bio ?? undefined,
          lskNumber: attorney.lskNumber ?? undefined,
          commissionerForOaths: attorney.commissionerForOaths ?? false,
          notaryPublic: attorney.notaryPublic ?? false,
          seniorCounsel: attorney.seniorCounsel ?? false,
        }}
        attorneyId={id}
      />
    </div>
  );
}
