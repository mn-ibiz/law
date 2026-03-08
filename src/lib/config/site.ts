/**
 * Platform-level site configuration for marketing pages and fallback values.
 * Centralizes all hardcoded "Law Firm Registry" strings.
 */
export const siteConfig = {
  name: "Law Firm Registry",
  tagline: "Legal Practice Management Platform",
  description:
    "Cloud-based practice management for modern law firms. Case tracking, billing, compliance, document management, and more.",
  supportEmail: "support@lawfirmregistry.co.ke",
  supportPhone: "+254 700 000 000",
  address: "Nairobi, Kenya",
  url: "https://lawfirmregistry.co.ke",
  social: {
    twitter: "https://twitter.com/lawfirmregistry",
    linkedin: "https://linkedin.com/company/lawfirmregistry",
  },
} as const;

/**
 * Derive a short abbreviation from an organization name (max 3 chars).
 * "Kamau & Associates" → "K&A", "Smith Legal" → "SL"
 */
export function getOrgAbbreviation(orgName: string): string {
  return orgName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);
}
