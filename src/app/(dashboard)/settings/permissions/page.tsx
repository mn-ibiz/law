import { requireAdmin } from "@/lib/auth/get-session";
import { getAllRolePermissions } from "@/lib/queries/permissions";
import { PermissionsManager } from "@/components/settings/permissions-manager";
import { Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Role Permissions",
  description: "Manage role-based access control",
};

export default async function PermissionsPage() {
  await requireAdmin();
  const allPermissions = await getAllRolePermissions();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Role Permissions</h1>
          <p className="text-sm text-muted-foreground">
            Control what each role can access. Admin always has full access.
          </p>
        </div>
      </div>

      <PermissionsManager initialPermissions={allPermissions} />
    </div>
  );
}
