"use client";

import { createContext, useContext } from "react";
import type { ClientOrgConfig } from "@/lib/utils/tenant-config";

const TenantConfigContext = createContext<ClientOrgConfig>({
  organizationId: "",
  locale: "en-KE",
  currency: "KES",
  timezone: "Africa/Nairobi",
  country: "KE",
});

export function TenantConfigProvider({
  config,
  children,
}: {
  config: ClientOrgConfig;
  children: React.ReactNode;
}) {
  return (
    <TenantConfigContext.Provider value={config}>
      {children}
    </TenantConfigContext.Provider>
  );
}

export function useOrgConfig(): ClientOrgConfig {
  const config = useContext(TenantConfigContext);
  if (process.env.NODE_ENV === "development" && !config.organizationId) {
    console.warn("useOrgConfig() called outside TenantConfigProvider — using fallback defaults");
  }
  return config;
}
