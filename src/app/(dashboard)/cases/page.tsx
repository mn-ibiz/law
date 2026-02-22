import Link from "next/link";
import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getCases } from "@/lib/queries/cases";
import { CaseDataTable } from "@/components/cases/case-data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function CasesPage() {
  await requireAdminOrAttorney();
  const { data } = await getCases();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cases</h1>
          <p className="text-muted-foreground">Manage legal cases and matters.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/cases/pipeline">Pipeline View</Link>
          </Button>
          <Button asChild>
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
