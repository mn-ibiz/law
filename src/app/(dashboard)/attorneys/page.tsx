import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getAttorneys } from "@/lib/queries/attorneys";
import { AttorneyDataTable } from "@/components/attorneys/attorney-data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Attorneys",
  description: "Manage attorney profiles and licensing",
};

export default async function AttorneysPage() {
  const session = await requireAdminOrAttorney();
  const { data } = await getAttorneys();
  const isAdmin = session.user?.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attorneys</h1>
          <p className="text-muted-foreground">Manage attorney profiles and qualifications.</p>
        </div>
        {isAdmin && (
          <Button asChild>
            <Link href="/attorneys/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Attorney
            </Link>
          </Button>
        )}
      </div>
      <AttorneyDataTable data={data} />
    </div>
  );
}
