import { Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { NotificationBellWrapper } from "@/components/notifications/notification-bell-wrapper";
import { requireOrg } from "@/lib/auth/get-session";
import { getPermissionsForRole } from "@/lib/queries/permissions";
import { defaultPermissions } from "@/lib/auth/permissions";
import type { Role } from "@/lib/auth/permissions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, organizationId } = await requireOrg();

  const role = session.user.role as Role;
  const userName = session.user.name ?? "User";

  // Resolve permissions server-side so sidebar renders correctly on first paint
  const dbPerms = await getPermissionsForRole(organizationId, role);
  const permissions: Record<string, string[]> =
    Object.keys(dbPerms).length > 0
      ? Object.fromEntries(
          Object.entries(dbPerms).map(([k, v]) => [k, v as string[]])
        )
      : Object.fromEntries(
          Object.entries(defaultPermissions[role] ?? {}).map(([k, v]) => [
            k,
            v as string[],
          ])
        );

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-muted/30">
        <Sidebar role={role} userName={userName} permissions={permissions} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header
            role={role}
            permissions={permissions}
            actions={
              <Suspense>
                <NotificationBellWrapper />
              </Suspense>
            }
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
