import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { organizations } from "@/lib/db/schema";
import { cookies } from "next/headers";
import { verifyImpersonationCookie } from "@/lib/utils/impersonation";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const { auth, signIn, signOut, handlers } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        organizationSlug: { label: "Organization", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;
        const slug = credentials.organizationSlug as string | undefined;

        // Build the query — if a slug is provided, join with organizations to scope login
        let userQuery;
        if (slug) {
          const [org] = await db
            .select({ id: organizations.id, slug: organizations.slug, status: organizations.status })
            .from(organizations)
            .where(eq(organizations.slug, slug))
            .limit(1);

          if (!org || org.status !== "active") return null;

          userQuery = await db
            .select({
              id: users.id,
              email: users.email,
              name: users.name,
              role: users.role,
              password: users.password,
              avatar: users.avatar,
              isActive: users.isActive,
              failedAttempts: users.failedAttempts,
              lockedUntil: users.lockedUntil,
              organizationId: users.organizationId,
            })
            .from(users)
            .where(sql`${users.email} = ${email} AND ${users.organizationId} = ${org.id} AND ${users.deletedAt} IS NULL`)
            .limit(1);
        } else {
          // Fallback: no slug provided (e.g. super_admin login or single-tenant compat)
          userQuery = await db
            .select({
              id: users.id,
              email: users.email,
              name: users.name,
              role: users.role,
              password: users.password,
              avatar: users.avatar,
              isActive: users.isActive,
              failedAttempts: users.failedAttempts,
              lockedUntil: users.lockedUntil,
              organizationId: users.organizationId,
            })
            .from(users)
            .where(sql`${users.email} = ${email} AND ${users.deletedAt} IS NULL`)
            .limit(1);
        }

        const [user] = userQuery;
        if (!user) return null;
        if (!user.isActive) return null;

        // Check account lockout
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          return null;
        }

        if (!user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          const lockoutSeconds = LOCKOUT_DURATION_MS / 1000;
          await db
            .update(users)
            .set({
              failedAttempts: sql`COALESCE(${users.failedAttempts}, 0) + 1`,
              lockedUntil: sql`CASE WHEN COALESCE(${users.failedAttempts}, 0) + 1 >= ${MAX_FAILED_ATTEMPTS} THEN NOW() + make_interval(secs => ${lockoutSeconds}) ELSE ${users.lockedUntil} END`,
              updatedAt: new Date(),
            })
            .where(eq(users.id, user.id));

          return null;
        }

        // Reset failed attempts on successful login
        if (user.failedAttempts > 0 || user.lockedUntil) {
          await db
            .update(users)
            .set({
              failedAttempts: 0,
              lockedUntil: null,
              updatedAt: new Date(),
            })
            .where(eq(users.id, user.id));
        }

        // Fetch organization slug for the session
        const [org] = await db
          .select({ slug: organizations.slug })
          .from(organizations)
          .where(eq(organizations.id, user.organizationId))
          .limit(1);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.avatar,
          organizationId: user.organizationId,
          organizationSlug: org?.slug ?? "",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours default
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as "super_admin" | "admin" | "attorney" | "client";
        token.email = user.email as string;
        token.name = user.name as string;
        token.image = user.image ?? null;
        token.organizationId = user.organizationId as string;
        token.organizationSlug = user.organizationSlug as string;
        token.lastRefresh = Date.now();
      }

      // Refresh user data every 5 minutes to catch isActive changes
      const REFRESH_INTERVAL = 5 * 60 * 1000;
      if (
        token.id &&
        (!token.lastRefresh ||
          Date.now() - (token.lastRefresh as number) > REFRESH_INTERVAL)
      ) {
        const [freshUser] = await db
          .select({
            id: users.id,
            isActive: users.isActive,
            role: users.role,
            organizationId: users.organizationId,
          })
          .from(users)
          .where(eq(users.id, token.id as string))
          .limit(1);

        if (!freshUser || !freshUser.isActive) {
          token.id = "";
          token.role = "" as "admin" | "attorney" | "client";
          return token;
        }

        // Verify organization is still active (skip for super_admin)
        if (freshUser.role !== "super_admin" && freshUser.organizationId) {
          const [org] = await db
            .select({ status: organizations.status })
            .from(organizations)
            .where(eq(organizations.id, freshUser.organizationId))
            .limit(1);
          if (!org || org.status !== "active") {
            token.id = "";
            token.role = "" as "admin" | "attorney" | "client";
            return token;
          }
        }

        token.role = freshUser.role as "super_admin" | "admin" | "attorney" | "client";
        token.organizationId = freshUser.organizationId;
        token.lastRefresh = Date.now();
      }

      return token;
    },
    async session({ session, token }) {
      if (!token.id) {
        session.user.id = "";
        session.user.role = "" as "admin" | "attorney" | "client";
        return session;
      }
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.image = token.image;
      session.user.organizationId = token.organizationId;
      session.user.organizationSlug = token.organizationSlug;
      session.user.impersonating = null;

      // If super_admin, check for impersonation cookie and overlay org context.
      // IMPORTANT: We do NOT change session.user.role — it stays "super_admin"
      // so that requireSuperAdmin() and middleware /admin checks still work.
      // The `impersonating` field signals to consuming code that the effective
      // role for permissions/UI should be "admin" on the target org.
      if (token.role === "super_admin") {
        try {
          const cookieStore = await cookies();
          const cookie = cookieStore.get("impersonation");
          if (cookie) {
            const imp = verifyImpersonationCookie(cookie.value);
            if (imp && imp.superAdminId === token.id) {
              session.user.organizationId = imp.targetOrgId;
              session.user.organizationSlug = imp.targetOrgSlug;
              session.user.impersonating = {
                superAdminId: imp.superAdminId,
                superAdminName: imp.superAdminName,
                targetOrgName: imp.targetOrgName,
              };
            }
          }
        } catch {
          // Cookie reading may fail in edge runtime — ignore
        }
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // Malformed URL — fall through to default
      }
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
  },
});
