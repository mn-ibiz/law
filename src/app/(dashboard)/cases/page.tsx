import Link from "next/link";
import { requireOrg } from "@/lib/auth/get-session";
import { getCases, getCaseStats } from "@/lib/queries/cases";
import { CaseDataTable } from "@/components/cases/case-data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Briefcase, Scale, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cases",
  description: "Manage legal cases and matters",
};

export default async function CasesPage() {
  const { organizationId } = await requireOrg();
  const [{ data }, stats] = await Promise.all([getCases(organizationId), getCaseStats(organizationId)]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cases</h1>
            <p className="text-sm text-muted-foreground">
              Manage legal cases and matters.
            </p>
          </div>
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Cases</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Open / Active</p>
              <p className="text-2xl font-bold">{stats.open}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">High Priority</p>
              <p className="text-2xl font-bold">{stats.highPriority}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Closed This Month</p>
              <p className="text-2xl font-bold">{stats.closedThisMonth}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <CaseDataTable data={data} />
    </div>
  );
}
