import { Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PortalSidebar } from "@/components/layout/portal-sidebar";
import { Header } from "@/components/layout/header";
import { NotificationBellWrapper } from "@/components/notifications/notification-bell-wrapper";
import { requireRole } from "@/lib/auth/get-session";
import { getPermissionsForRole } from "@/lib/queries/permissions";
import { defaultPermissions } from "@/lib/auth/permissions";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("client");

  const dbPerms = await getPermissionsForRole("client");
  const permissions: Record<string, string[]> =
    Object.keys(dbPerms).length > 0
      ? Object.fromEntries(
          Object.entries(dbPerms).map(([k, v]) => [k, v as string[]])
        )
      : Object.fromEntries(
          Object.entries(defaultPermissions.client ?? {}).map(([k, v]) => [
            k,
            v as string[],
          ])
        );

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-muted/30">
        <PortalSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header
            role="client"
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
