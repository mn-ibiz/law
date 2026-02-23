import Link from "next/link";
import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getCases } from "@/lib/queries/cases";
import { CaseDataTable } from "@/components/cases/case-data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cases",
  description: "Manage legal cases and matters",
};

export default async function CasesPage() {
  await requireAdminOrAttorney();
  const { data } = await getCases();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cases</h1>
          <p className="text-sm text-muted-foreground">
            Manage legal cases and matters.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/cases/pipeline">Pipeline View</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/cases/new">
              <Plus className="mr-2 h-4 w-4" />
              New Case
            </Link>
          </Button>
        </div>
      </div>
      <CaseDataTable data={data} />
    </div>
  );
}
