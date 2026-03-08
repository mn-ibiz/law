import { Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PortalSidebar } from "@/components/layout/portal-sidebar";
import { Header } from "@/components/layout/header";
import { NotificationBellWrapper } from "@/components/notifications/notification-bell-wrapper";
import { TenantConfigProvider } from "@/components/providers/tenant-config-provider";
import { requireRole, requireOrg } from "@/lib/auth/get-session";
import { getPermissionsForRole } from "@/lib/queries/permissions";
import { getOrgConfig, toClientConfig } from "@/lib/utils/tenant-config";
import { defaultPermissions } from "@/lib/auth/permissions";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("client");
  const { organizationId } = await requireOrg();

  const [dbPerms, orgConfig] = await Promise.all([
    getPermissionsForRole(organizationId, "client"),
    getOrgConfig(organizationId),
  ]);
  const clientConfig = toClientConfig(organizationId, orgConfig);
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
    <TenantConfigProvider config={clientConfig}>
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
    </TenantConfigProvider>
  );
}
