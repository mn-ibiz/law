import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/get-session";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { AttorneyDashboard } from "@/components/dashboard/attorney-dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of your law firm operations",
};

export default async function DashboardPage() {
  const session = await requireAuth();
  const name = session.user?.name ?? "User";
  const role = session.user?.role as string;
  const userId = session.user?.id as string;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {name}. Here&apos;s an overview of your firm.
        </p>
      </div>
      {role === "admin" ? (
        <AdminDashboard />
      ) : role === "attorney" ? (
        <AttorneyDashboard userId={userId} />
      ) : (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to the Law Firm Registry.</p>
        </div>
      )}
    </div>
  );
}
