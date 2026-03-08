import { Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { NotificationBellWrapper } from "@/components/notifications/notification-bell-wrapper";
import { ImpersonationBanner } from "@/components/admin/impersonation-banner";
import { TenantConfigProvider } from "@/components/providers/tenant-config-provider";
import { requireOrg } from "@/lib/auth/get-session";
import { getPermissionsForRole } from "@/lib/queries/permissions";
import { getOrgConfig, toClientConfig } from "@/lib/utils/tenant-config";
import { defaultPermissions } from "@/lib/auth/permissions";
import type { Role } from "@/lib/auth/permissions";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { organizationId } = await requireOrg();
    const config = await getOrgConfig(organizationId);
    return {
      title: {
        default: config.orgName,
        template: `%s | ${config.orgName}`,
      },
      description: `${config.orgName} — Legal Practice Management`,
    };
  } catch {
    return {};
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, organizationId } = await requireOrg();

  const userName = session.user.name ?? "User";
  const impersonation = session.user.impersonating ?? null;

  // During impersonation, use "admin" as effective role for permissions/UI,
  // even though the JWT role stays "super_admin" for auth guard purposes.
  const role = (impersonation ? "admin" : session.user.role) as Role;

  // Resolve permissions server-side so sidebar renders correctly on first paint
  const [dbPerms, orgConfig] = await Promise.all([
    getPermissionsForRole(organizationId, role),
    getOrgConfig(organizationId),
  ]);
  const orgName = orgConfig.orgName;
  const clientConfig = toClientConfig(organizationId, orgConfig);
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
    <TenantConfigProvider config={clientConfig}>
      <TooltipProvider>
        {impersonation && (
          <ImpersonationBanner
            orgName={impersonation.targetOrgName}
            superAdminName={impersonation.superAdminName}
          />
        )}

        <div className="flex h-screen overflow-hidden bg-muted/30">
          <Sidebar role={role} userName={userName} permissions={permissions} orgName={orgName} />
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
    </TenantConfigProvider>
  );
}
