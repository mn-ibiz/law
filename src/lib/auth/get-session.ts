import { auth } from "./auth";
import { redirect } from "next/navigation";
import type { Role } from "./permissions";

export async function getSession() {
  const session = await auth();
  return session;
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(...roles: Role[]) {
  const session = await requireAuth();
  if (!roles.includes(session.user.role as Role)) {
    redirect("/forbidden");
  }
  return session;
}

export async function requireAdmin() {
  return requireRole("admin");
}

export async function requireAdminOrAttorney() {
  return requireRole("admin", "attorney");
}
