import { cache } from "react";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema/organizations";
import { firmSettings } from "@/lib/db/schema/settings";
import { eq, and, inArray } from "drizzle-orm";

export interface OrgConfig {
  orgName: string;
  locale: string;
  currency: string;
  timezone: string;
  country: string;
  vatRate: number;
  prefixes: {
    invoice: string;
    quote: string;
    receipt: string;
    creditNote: string;
    requisition: string;
    trustAccount: string;
    case: string;
  };
  emailFrom: string | null;
  smsSenderId: string | null;
  cpdTotalRequired: number;
  cpdLskRequired: number;
}

function safeParseFloat(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function safeParseInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

const CONFIG_KEYS = [
  "vatRate",
  "prefix.invoice",
  "prefix.quote",
  "prefix.receipt",
  "prefix.creditNote",
  "prefix.requisition",
  "prefix.trustAccount",
  "prefix.case",
  "email.from",
  "sms.senderId",
  "cpd.totalRequired",
  "cpd.lskRequired",
];

/**
 * Fetch and cache org configuration for the current request lifecycle.
 * Uses React `cache()` to deduplicate calls within a single render pass.
 */
export const getOrgConfig = cache(async (organizationId: string): Promise<OrgConfig> => {
  const [[org], settings] = await Promise.all([
    db
      .select({
        name: organizations.name,
        locale: organizations.locale,
        currency: organizations.currency,
        timezone: organizations.timezone,
        country: organizations.country,
      })
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1),
    db
      .select({ key: firmSettings.key, value: firmSettings.value })
      .from(firmSettings)
      .where(
        and(
          eq(firmSettings.organizationId, organizationId),
          inArray(firmSettings.key, CONFIG_KEYS)
        )
      ),
  ]);

  const settingsMap: Record<string, string> = {};
  for (const s of settings) {
    if (s.value) settingsMap[s.key] = s.value;
  }

  if (!org) {
    console.warn(`getOrgConfig: organization not found for id=${organizationId}, using defaults`);
  }

  const orgName = org?.name ?? "Law Firm";
  const locale = org?.locale ?? "en-KE";
  const currency = org?.currency ?? "KES";
  const timezone = org?.timezone ?? "Africa/Nairobi";
  const country = org?.country ?? "KE";

  return {
    orgName,
    locale,
    currency,
    timezone,
    country,
    vatRate: safeParseFloat(settingsMap["vatRate"], 16),
    prefixes: {
      invoice: settingsMap["prefix.invoice"] ?? "INV",
      quote: settingsMap["prefix.quote"] ?? "QT",
      receipt: settingsMap["prefix.receipt"] ?? "RCT",
      creditNote: settingsMap["prefix.creditNote"] ?? "CN",
      requisition: settingsMap["prefix.requisition"] ?? "REQ",
      trustAccount: settingsMap["prefix.trustAccount"] ?? "TRUST",
      case: settingsMap["prefix.case"] ?? "CASE",
    },
    emailFrom: settingsMap["email.from"] ?? null,
    smsSenderId: settingsMap["sms.senderId"] ?? null,
    cpdTotalRequired: safeParseInt(settingsMap["cpd.totalRequired"], 5),
    cpdLskRequired: safeParseInt(settingsMap["cpd.lskRequired"], 2),
  };
});

/**
 * Lightweight config object for passing to client components.
 * Contains only what's needed for formatting — no sensitive settings.
 */
export interface ClientOrgConfig {
  organizationId: string;
  locale: string;
  currency: string;
  timezone: string;
  country: string;
}

export function toClientConfig(organizationId: string, config: OrgConfig): ClientOrgConfig {
  return {
    organizationId,
    locale: config.locale,
    currency: config.currency,
    timezone: config.timezone,
    country: config.country,
  };
}
