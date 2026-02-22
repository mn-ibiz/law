import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/intake", "/forbidden", "/intake/success"];
const publicPrefixes = ["/api/auth"];
const adminOnlyPaths = ["/settings"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

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

  // Admin-only route protection
  if (adminOnlyPaths.some((path) => pathname.startsWith(path)) && role !== "admin") {
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
      pathname.startsWith("/conflicts") || pathname.startsWith("/courts")) {
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
