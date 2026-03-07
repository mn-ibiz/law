import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/intake", "/forbidden", "/intake/success"];
const publicPrefixes = ["/api/auth", "/api/calendar/ical"];
const adminOnlyPaths = ["/settings"];
const superAdminPaths = ["/admin"]; // Super admin panel for managing all tenants

/**
 * Extracts the organization slug from a subdomain.
 * e.g., "acme.lawfirmregistry.co.ke" → "acme"
 * Returns null for bare domain or localhost.
 */
function extractTenantSlug(host: string): string | null {
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

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const host = req.headers.get("host") ?? "";

  // Extract tenant slug from subdomain
  const tenantSlug = extractTenantSlug(host);

  // Allow public routes
  if (publicRoutes.includes(pathname)) return NextResponse.next();
  if (publicPrefixes.some((prefix) => pathname.startsWith(prefix))) return NextResponse.next();

  // Redirect unauthenticated users to login
  if (!session?.user?.id) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = session.user.role;

  // Super admin panel routes
  if (superAdminPaths.some((path) => pathname.startsWith(path)) && role !== "super_admin") {
    return NextResponse.redirect(new URL("/forbidden", req.url));
  }

  // If tenant slug is present in subdomain, verify it matches the user's organization
  if (tenantSlug && session.user.organizationSlug && tenantSlug !== session.user.organizationSlug) {
    // User is trying to access a different organization's subdomain
    return NextResponse.redirect(new URL("/forbidden", req.url));
  }

  // Admin-only route protection
  if (adminOnlyPaths.some((path) => pathname.startsWith(path)) && role !== "admin" && role !== "super_admin") {
    return NextResponse.redirect(new URL("/forbidden", req.url));
  }

  // Route group enforcement
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/attorneys") ||
      pathname.startsWith("/clients") || pathname.startsWith("/cases") ||
      pathname.startsWith("/documents") || pathname.startsWith("/calendar") ||
      pathname.startsWith("/deadlines") || pathname.startsWith("/tasks") ||
      pathname.startsWith("/time-expenses") ||
      pathname.startsWith("/billing") || pathname.startsWith("/messages") ||
      pathname.startsWith("/reports") || pathname.startsWith("/settings") ||
      pathname.startsWith("/bring-ups") || pathname.startsWith("/trust-accounts") ||
      pathname.startsWith("/petty-cash") || pathname.startsWith("/requisitions") ||
      pathname.startsWith("/suppliers") || pathname.startsWith("/notifications") ||
      pathname.startsWith("/conflicts") || pathname.startsWith("/courts") ||
      pathname.startsWith("/cause-lists") || pathname.startsWith("/search")) {
    if (role === "client") {
      return NextResponse.redirect(new URL("/portal", req.url));
    }
  }

  // Portal route enforcement
  if (pathname.startsWith("/portal")) {
    if (role !== "client") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
