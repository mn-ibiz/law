import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const { auth, signIn, signOut, handlers } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const [user] = await db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
            password: users.password,
            isActive: users.isActive,
            failedAttempts: users.failedAttempts,
            lockedUntil: users.lockedUntil,
          })
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user) return null;
        if (!user.isActive) return null;

        // Check account lockout
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          return null;
        }

        if (!user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          // Increment failed attempts atomically using SQL expression
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

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
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
        token.role = user.role as "admin" | "attorney" | "client";
        token.email = user.email as string;
        token.name = user.name as string;
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
          .select({ id: users.id, isActive: users.isActive, role: users.role })
          .from(users)
          .where(eq(users.id, token.id as string))
          .limit(1);

        if (!freshUser || !freshUser.isActive) {
          // Force session invalidation by clearing token
          token.id = "";
          token.role = "" as "admin" | "attorney" | "client";
          return token;
        }

        token.role = freshUser.role as "admin" | "attorney" | "client";
        token.lastRefresh = Date.now();
      }

      return token;
    },
    async session({ session, token }) {
      if (!token.id) {
        // Token was invalidated
        session.user.id = "";
        session.user.role = "" as "admin" | "attorney" | "client";
        return session;
      }
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.email = token.email;
      session.user.name = token.name;
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
