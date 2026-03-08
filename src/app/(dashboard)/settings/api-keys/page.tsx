import { requireRole, getTenantContext } from "@/lib/auth/get-session";
import { listApiKeys } from "@/lib/actions/api-keys";
import { checkFeatureAccess } from "@/lib/utils/plan-limits";
import { ApiKeyManager } from "@/components/settings/api-key-manager";
import { Key, Lock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Keys",
  description: "Manage API keys for external integrations",
};

interface ApiKeyRow {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
  status: string;
}

interface ApiKeyResult {
  success?: boolean;
  error?: string;
  keys?: ApiKeyRow[];
}

export default async function ApiKeysPage() {
  await requireRole("admin");
  const { organizationId } = await getTenantContext();

  const access = await checkFeatureAccess(organizationId, "api_access");

  if (!access.allowed) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Key className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
            <p className="text-sm text-muted-foreground">
              Manage API keys for external integrations.
            </p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-8 text-center">
          <Lock className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-semibold">Enterprise Feature</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {access.error ?? "API access requires an Enterprise plan. Upgrade to enable API integrations."}
          </p>
        </div>
      </div>
    );
  }

  const result = (await listApiKeys()) as ApiKeyResult;
  const keys = result?.keys ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Key className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
          <p className="text-sm text-muted-foreground">
            Manage API keys for external integrations.
          </p>
        </div>
      </div>

      <ApiKeyManager initialKeys={keys} />
    </div>
  );
}
