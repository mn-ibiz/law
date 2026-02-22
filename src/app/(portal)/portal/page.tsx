import { requireRole } from "@/lib/auth/get-session";
import { ClientDashboard } from "@/components/dashboard/client-dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Portal",
  description: "Access your cases, documents, and invoices",
};

export default async function PortalPage() {
  const session = await requireRole("client");
  const name = session.user?.name ?? "User";
  const userId = session.user?.id as string;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Client Portal</h1>
        <p className="text-muted-foreground">
          Welcome, {name}. View your cases, documents, and invoices.
        </p>
      </div>
      <ClientDashboard userId={userId} />
    </div>
  );
}
