import type { Metadata } from "next";
import Link from "next/link";
import { requireOrg } from "@/lib/auth/get-session";
import { getAttorneys } from "@/lib/queries/attorneys";
import { AttorneyDataTable } from "@/components/attorneys/attorney-data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Scale, Users, BadgeCheck, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Attorneys",
  description: "Manage attorney profiles and licensing",
};

export default async function AttorneysPage() {
  const { organizationId, session } = await requireOrg();
  const { data } = await getAttorneys(organizationId, { limit: 500 });
  const isAdmin = session.user?.role === "admin";

  const activeCount = data.filter((a) => a.isActive).length;
  const partnerCount = data.filter((a) => a.title === "partner").length;
  const avgRate =
    data.filter((a) => a.hourlyRate).length > 0
      ? Math.round(
          data
            .filter((a) => a.hourlyRate)
            .reduce((sum, a) => sum + Number(a.hourlyRate), 0) /
            data.filter((a) => a.hourlyRate).length
        )
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Scale className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Attorneys</h1>
            <p className="text-sm text-muted-foreground">
              Manage attorney profiles and qualifications.
            </p>
          </div>
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Attorneys</p>
              <p className="text-2xl font-bold">{data.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">{activeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Partners</p>
              <p className="text-2xl font-bold">{partnerCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Rate</p>
              <p className="text-2xl font-bold">
                {avgRate > 0 ? `Ksh ${avgRate.toLocaleString()}` : "\u2014"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <AttorneyDataTable data={data} />
    </div>
  );
}
