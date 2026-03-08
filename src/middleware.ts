import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";
import { extractTenantSlug } from "@/lib/utils/extract-tenant-slug";
import crypto from "crypto";

const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/intake", "/forbidden", "/suspended", "/intake/success", "/signup", "/pricing", "/features"];
const publicPrefixes = ["/api/auth", "/api/calendar/ical", "/api/check-slug", "/api/cron", "/api/webhooks", "/invite"];
const adminOnlyPaths = ["/settings"];
const superAdminPaths = ["/admin"]; // Super admin panel for managing all tenants

function withRequestId(response: NextResponse): NextResponse {
  response.headers.set("X-Request-Id", crypto.randomUUID());
  return response;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const host = req.headers.get("host") ?? "";

  // Extract tenant slug from subdomain
  const tenantSlug = extractTenantSlug(host);

  // Allow public routes
  if (publicRoutes.includes(pathname)) return withRequestId(NextResponse.next());
  if (publicPrefixes.some((prefix) => pathname.startsWith(prefix))) return withRequestId(NextResponse.next());

  // Redirect unauthenticated users to login
  if (!session?.user?.id) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = session.user.role;

  // Super admin panel routes — must be on root domain (no tenant subdomain)
  if (superAdminPaths.some((path) => pathname.startsWith(path))) {
    if (role !== "super_admin") {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }
    if (tenantSlug) {
      // Redirect to root domain /admin (strip subdomain)
      const rootUrl = new URL(req.url);
      rootUrl.hostname = rootUrl.hostname.replace(`${tenantSlug}.`, "");
      return NextResponse.redirect(rootUrl);
    }
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

  return withRequestId(NextResponse.next());
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
