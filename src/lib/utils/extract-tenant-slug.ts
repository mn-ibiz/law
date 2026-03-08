/**
 * Extracts the organization slug from a subdomain.
 * e.g., "acme.lawfirmregistry.co.ke" -> "acme"
 * Returns null for bare domain, localhost, or non-tenant subdomains (www, app).
 */
export function extractTenantSlug(host: string): string | null {
  // Strip port for local dev
  const hostname = host.split(":")[0];

  // Skip for localhost / IP addresses in development
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.")) {
    return null;
  }

  // Production: expect <slug>.lawfirmregistry.co.ke or <slug>.<custom-domain>
  const parts = hostname.split(".");

  // If we have at least 3 parts for co.ke TLD (slug.lawfirmregistry.co.ke = 4 parts)
  // or 3 parts for .com TLD (slug.lawfirmregistry.com = 3 parts)
  if (parts.length >= 3) {
    const subdomain = parts[0];
    // Ignore www and app subdomains
    if (subdomain === "www" || subdomain === "app") return null;
    return subdomain;
  }

  return null;
}
