"use server";

import { signIn } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { loginSchema, registerSchema, forgotPasswordSchema } from "@/lib/validators/auth";
import { AuthError } from "next-auth";

export async function loginAction(formData: {
  email: string;
  password: string;
  rememberMe?: boolean;
}) {
  const validated = loginSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  try {
    const result = await signIn("credentials", {
      email: validated.data.email,
      password: validated.data.password,
      redirect: false,
    });

    // Determine redirect based on user role
    const [user] = await db
      .select({ role: users.role })
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
}

export async function registerAction(formData: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}) {
  const validated = registerSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  // Check if user already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, validated.data.email))
    .limit(1);

  if (existingUser.length > 0) {
    return { error: "An account with this email already exists" };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(validated.data.password, 10);

  // Create user with isActive=false (pending admin approval)
  await db.insert(users).values({
    name: validated.data.name,
    email: validated.data.email,
    password: hashedPassword,
    phone: validated.data.phone || null,
    role: "client",
    isActive: false,
  });

  return {
    success: true,
    message: "Registration successful. Your account is pending admin approval.",
  };
}

export async function forgotPasswordAction(formData: { email: string }) {
  const validated = forgotPasswordSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  // Check if user exists (don't reveal if email exists or not for security)
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, validated.data.email))
    .limit(1);

  if (user) {
    // Placeholder: In production, send actual email with reset link
    console.log(`[PLACEHOLDER] Password reset email would be sent to: ${validated.data.email}`);
  }

  // Always return success to prevent email enumeration
  return {
    success: true,
    message: "If an account exists with this email, you will receive a password reset link.",
  };
}
