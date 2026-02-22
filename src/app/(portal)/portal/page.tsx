import { requireRole } from "@/lib/auth/get-session";

export default async function PortalPage() {
  const session = await requireRole("client");
  const name = session.user?.name ?? "User";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Client Portal</h1>
        <p className="text-muted-foreground">
          Welcome, {name}. View your cases, documents, and invoices.
        </p>
      </div>
      {/* Portal widgets will be added in later epics */}
    </div>
  );
}
