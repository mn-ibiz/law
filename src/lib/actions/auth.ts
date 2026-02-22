"use server";

import { signIn } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { loginSchema, registerSchema, forgotPasswordSchema } from "@/lib/validators/auth";
import { AuthError } from "next-auth";
import { rateLimit } from "@/lib/utils/rate-limit";
import { safeAction } from "@/lib/utils/safe-action";

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

    // Rate limit login attempts per email
    const rl = rateLimit(`login:${validated.data.email}`);
    if (!rl.success) {
      return { error: "Too many login attempts. Please try again later." };
    }

    try {
      await signIn("credentials", {
        email: validated.data.email,
        password: validated.data.password,
        redirect: false,
      });

      // Determine redirect based on user role
      const [user] = await db
        .select({ id: users.id, role: users.role })
        .from(users)
        .where(eq(users.email, validated.data.email))
        .limit(1);

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

    // Rate limit registration attempts per email
    const rl = rateLimit(`register:${validated.data.email}`);
    if (!rl.success) {
      return { error: "Too many attempts. Please try again later." };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.data.password, 10);

    // Insert user directly — catch unique violation to handle race condition
    try {
      await db.insert(users).values({
        name: validated.data.name,
        email: validated.data.email,
        password: hashedPassword,
        phone: validated.data.phone || null,
        role: "client",
        isActive: false,
      });
    } catch (err: unknown) {
      // Postgres unique violation error code
      if (err && typeof err === "object" && "code" in err && err.code === "23505") {
        return { error: "An account with this email already exists" };
      }
      throw err;
    }

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

    // Rate limit password reset requests
    const rl = rateLimit(`reset:${validated.data.email}`);
    if (!rl.success) {
      return {
        success: true,
        message: "If an account exists with this email, you will receive a password reset link.",
      };
    }

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, validated.data.email))
      .limit(1);

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

      // TODO: Send actual email with reset link containing the plaintext token
      // The link should be: /reset-password?token=${resetToken}&email=${validated.data.email}
      // When verifying, hash the submitted token and compare against the stored hash
    }

    // Always return success to prevent email enumeration
    return {
      success: true,
      message: "If an account exists with this email, you will receive a password reset link.",
    };
  });
}
