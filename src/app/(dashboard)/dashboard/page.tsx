import { requireAuth } from "@/lib/auth/get-session";

export default async function DashboardPage() {
  const session = await requireAuth();
  const name = session.user?.name ?? "User";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {name}. Here&apos;s an overview of your firm.
        </p>
      </div>
      {/* Dashboard widgets will be added in Epic 3 */}
    </div>
  );
}
