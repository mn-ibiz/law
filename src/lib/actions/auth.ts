"use server";

import { signIn } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { organizations, organizationMembers } from "@/lib/db/schema/organizations";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validators/auth";
import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/utils/rate-limit";
import { safeAction } from "@/lib/utils/safe-action";
import { sendEmail } from "@/lib/email/send-email";
import { checkPlanLimit } from "@/lib/utils/plan-limits";
import { passwordResetEmailHtml } from "@/lib/email/templates/password-reset";
import { env } from "@/lib/env";
import { extractTenantSlug } from "@/lib/utils/extract-tenant-slug";

export async function loginAction(formData: {
  email: string;
  password: string;
  rememberMe: boolean;
}) {
  return safeAction(async () => {
    const validated = loginSchema.safeParse(formData);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    // Resolve organization from subdomain for scoped login
    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    const slug = extractTenantSlug(host) ?? "";

    // Rate limit login attempts per email, scoped by subdomain
    const rlKey = slug ? `login:${slug}:${validated.data.email}` : `login:${validated.data.email}`;
    const rl = await rateLimit(rlKey);
    if (!rl.success) {
      return { error: "Too many login attempts. Please try again later." };
    }

    // Pre-resolve org ID for post-login scoping
    let loginOrgId: string | null = null;
    if (slug) {
      const [org] = await db
        .select({ id: organizations.id })
        .from(organizations)
        .where(eq(organizations.slug, slug))
        .limit(1);
      loginOrgId = org?.id ?? null;
    }

    try {
      await signIn("credentials", {
        email: validated.data.email,
        password: validated.data.password,
        organizationSlug: slug || undefined,
        redirect: false,
      });

      // Determine redirect based on user role (scoped by org to avoid cross-tenant mismatch)
      const userQuery = loginOrgId
        ? db.select({ id: users.id, role: users.role }).from(users)
            .where(sql`${users.email} = ${validated.data.email} AND ${users.organizationId} = ${loginOrgId} AND ${users.deletedAt} IS NULL`)
            .limit(1)
        : db.select({ id: users.id, role: users.role }).from(users)
            .where(sql`${users.email} = ${validated.data.email} AND ${users.deletedAt} IS NULL`)
            .limit(1);
      const [user] = await userQuery;

      const redirectTo = user?.role === "client" ? "/portal" : "/dashboard";
      return { success: true, redirectTo };
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case "CredentialsSignin":
            return { error: "Invalid email or password" };
          default:
            return { error: "An error occurred during sign in" };
        }
      }
      return { error: "Invalid email or password" };
    }
  });
}

export async function registerAction(formData: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}) {
  return safeAction(async () => {
    const validated = registerSchema.safeParse(formData);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    // Rate limit registration attempts per email (global — pre-org)
    const rl = await rateLimit(`register:${validated.data.email}`);
    if (!rl.success) {
      return { error: "Too many attempts. Please try again later." };
    }

    // Resolve organization from subdomain
    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    const slug = extractTenantSlug(host) ?? "";
    if (!slug) {
      return { error: "Unable to determine organization. Please access from your organization's domain." };
    }
    const [org] = await db
      .select({ id: organizations.id, status: organizations.status })
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);
    if (!org) {
      return { error: "Organization not found." };
    }
    if (org.status !== "active") {
      return { error: "This organization is not currently accepting registrations." };
    }

    // Check plan limit for users
    const userLimit = await checkPlanLimit(org.id, "users");
    if (!userLimit.allowed) {
      return { error: userLimit.error };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.data.password, 10);

    // Insert user directly — catch unique violation to handle race condition
    let newUserId: string;
    try {
      const [newUser] = await db.insert(users).values({
        name: validated.data.name,
        email: validated.data.email,
        password: hashedPassword,
        phone: validated.data.phone || null,
        organizationId: org.id,
        role: "client",
        isActive: false,
      }).returning({ id: users.id });
      newUserId = newUser.id;
    } catch (err: unknown) {
      // Postgres unique violation error code
      if (err && typeof err === "object" && "code" in err && err.code === "23505") {
        return { error: "Registration could not be completed. Please try again or use a different email." };
      }
      throw err;
    }

    // Add to organization members
    await db
      .insert(organizationMembers)
      .values({ organizationId: org.id, userId: newUserId, role: "member" })
      .onConflictDoNothing();

    return {
      success: true,
      message: "Registration successful. Your account is pending admin approval.",
    };
  });
}

export async function forgotPasswordAction(formData: { email: string }) {
  return safeAction(async () => {
    const validated = forgotPasswordSchema.safeParse(formData);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    // Scope password reset to organization from subdomain
    const headersList2 = await headers();
    const host2 = headersList2.get("host") ?? "";
    const resetSlug = extractTenantSlug(host2) ?? "";

    // Rate limit password reset requests, scoped by subdomain
    const resetRlKey = resetSlug ? `reset:${resetSlug}:${validated.data.email}` : `reset:${validated.data.email}`;
    const rl = await rateLimit(resetRlKey);
    if (!rl.success) {
      return {
        success: true,
        message: "If an account exists with this email, you will receive a password reset link.",
      };
    }

    let resetOrg: { id: string } | undefined;
    if (resetSlug) {
      const [org] = await db
        .select({ id: organizations.id })
        .from(organizations)
        .where(eq(organizations.slug, resetSlug))
        .limit(1);
      resetOrg = org;
    }

    // In multi-tenant mode, require subdomain scoping to prevent cross-tenant enumeration
    // Without a slug, only super_admin can reset (handled by no-org fallback that checks role)
    if (!resetOrg && resetSlug) {
      // Slug was provided but org doesn't exist — return generic to prevent enumeration
      return {
        success: true,
        message: "If an account exists with this email, you will receive a password reset link.",
      };
    }

    const userResults = resetOrg
      ? await db
          .select({ id: users.id, name: users.name, role: users.role })
          .from(users)
          .where(sql`${users.email} = ${validated.data.email} AND ${users.organizationId} = ${resetOrg.id} AND ${users.deletedAt} IS NULL`)
          .limit(1)
      : await db
          .select({ id: users.id, name: users.name, role: users.role })
          .from(users)
          .where(sql`${users.email} = ${validated.data.email} AND ${users.role} = 'super_admin' AND ${users.deletedAt} IS NULL`)
          .limit(1);

    const [user] = userResults;

    if (user) {
      // Generate a cryptographically strong reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Hash the token before storing (treat like a password)
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      await db
        .update(users)
        .set({
          resetToken: hashedToken,
          resetTokenExpiry,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      // Build the reset link using org subdomain when available
      const defaultBaseUrl = env.AUTH_URL ?? "http://localhost:3000";
      const baseUrl = resetSlug
        ? (() => {
            try {
              const parsed = new URL(defaultBaseUrl);
              // Strip any existing subdomain (www, app) to get the root domain
              const hostParts = parsed.hostname.split(".");
              // For co.ke TLD: root is last 3 parts; for .com: last 2 parts
              const rootDomain = hostParts.length > 3
                ? hostParts.slice(-3).join(".")  // e.g., lawfirmregistry.co.ke
                : hostParts.length > 2
                  ? hostParts.slice(-2).join(".")  // e.g., lawfirmregistry.com
                  : parsed.hostname;              // e.g., localhost
              const port = parsed.port ? `:${parsed.port}` : "";
              return `${parsed.protocol}//${resetSlug}.${rootDomain}${port}`;
            } catch { return defaultBaseUrl; }
          })()
        : defaultBaseUrl;
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(validated.data.email)}`;
      sendEmail({
        to: validated.data.email,
        subject: "Password Reset Request",
        html: passwordResetEmailHtml(resetUrl, user.name ?? undefined),
      }).catch((err) => console.error("Password reset email failed:", err));
    }

    // Always return success to prevent email enumeration
    return {
      success: true,
      message: "If an account exists with this email, you will receive a password reset link.",
    };
  });
}

export async function resetPasswordAction(formData: {
  token: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  return safeAction(async () => {
    const validated = resetPasswordSchema.safeParse(formData);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { token, email, password } = validated.data;

    // Hash the provided token to compare against stored hash
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Look up user by email + hashed token
    const [user] = await db
      .select({ id: users.id, resetTokenExpiry: users.resetTokenExpiry })
      .from(users)
      .where(
        sql`${users.email} = ${email} AND ${users.resetToken} = ${hashedToken} AND ${users.deletedAt} IS NULL`
      )
      .limit(1);

    if (!user) {
      return { error: "Invalid or expired reset link. Please request a new one." };
    }

    // Check expiry
    if (!user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
      // Clear expired token
      await db
        .update(users)
        .set({ resetToken: null, resetTokenExpiry: null, updatedAt: new Date() })
        .where(eq(users.id, user.id));
      return { error: "Reset link has expired. Please request a new one." };
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(password, 10);

    await db
      .update(users)
      .set({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        failedAttempts: 0,
        lockedUntil: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return {
      success: true,
      message: "Password reset successfully. You can now sign in with your new password.",
    };
  });
}
