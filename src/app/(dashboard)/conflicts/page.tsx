import type { Metadata } from "next";
import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { ConflictCheckPage } from "@/components/clients/conflict-check-page";

export const metadata: Metadata = {
  title: "Conflict Checks",
  description: "Run and review conflict of interest checks",
};

export default async function ConflictsPage() {
  await requireAdminOrAttorney();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Conflict Check</h1>
        <p className="text-muted-foreground">
          Search for potential conflicts of interest before taking on new clients or cases.
        </p>
      </div>
      <ConflictCheckPage />
    </div>
  );
}
