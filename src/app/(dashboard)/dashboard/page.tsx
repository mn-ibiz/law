import type { Metadata } from "next";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/get-session";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { AttorneyDashboard } from "@/components/dashboard/attorney-dashboard";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus, FileText, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of your law firm operations",
};

export default async function DashboardPage() {
  const session = await requireAuth();
  const name = session.user?.name ?? "User";
  const role = session.user?.role as string;
  const userId = session.user?.id as string;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting}, {name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening at your firm today.
          </p>
        </div>
        {role === "admin" && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" asChild>
              <Link href="/clients/new">
                <Users className="h-3.5 w-3.5" />
                New Client
              </Link>
            </Button>
            <Button size="sm" className="gap-1.5" asChild>
              <Link href="/cases/new">
                <Plus className="h-3.5 w-3.5" />
                New Case
              </Link>
            </Button>
          </div>
        )}
      </div>

      {role === "admin" ? (
        <AdminDashboard />
      ) : role === "attorney" ? (
        <AttorneyDashboard userId={userId} />
      ) : (
        <div className="space-y-6">
          <p className="text-muted-foreground">Welcome to the Law Firm Registry.</p>
        </div>
      )}
    </div>
  );
}
