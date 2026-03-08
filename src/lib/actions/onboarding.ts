"use server";

import { db } from "@/lib/db";
import { organizations, plans, subscriptions, organizationMembers } from "@/lib/db/schema/organizations";
import { users } from "@/lib/db/schema/auth";
import { branches } from "@/lib/db/schema/branches";
import { practiceAreas } from "@/lib/db/schema/settings";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { safeAction } from "@/lib/utils/safe-action";
import { rateLimit } from "@/lib/utils/rate-limit";
import { checkSlugAvailability } from "@/lib/utils/slug-validation";
import { sendEmail } from "@/lib/email/send-email";
import { welcomeEmailHtml } from "@/lib/email/templates/welcome";
import { siteConfig } from "@/lib/config/site";
import { inviteEmailHtml } from "@/lib/email/templates/invite";
import { getTenantContext } from "@/lib/auth/get-session";
import { checkPlanLimit } from "@/lib/utils/plan-limits";
import { headers } from "next/headers";
import { z } from "zod";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const DEFAULT_PRACTICE_AREAS = [
  { name: "Civil Litigation", description: "Disputes between individuals or organizations" },
  { name: "Criminal Law", description: "Defense and prosecution of criminal offenses" },
  { name: "Family Law", description: "Divorce, custody, maintenance, and adoption" },
  { name: "Corporate/Commercial", description: "Company formation, mergers, and commercial contracts" },
  { name: "Conveyancing/Property", description: "Land transactions and property transfers" },
  { name: "Employment/Labour", description: "Employment contracts and disputes" },
  { name: "Intellectual Property", description: "Patents, trademarks, and copyrights" },
  { name: "Alternative Dispute Resolution", description: "Mediation, arbitration, and negotiation" },
];

const signupSchema = z.object({
  firmName: z.string().min(2).max(100),
  slug: z.string().min(3).max(50),
  country: z.string().min(2).max(5).default("KE"),
  currency: z.string().min(3).max(3).default("KES"),
  timezone: z.string().min(1).default("Africa/Nairobi"),
  locale: z.string().min(2).default("en-KE"),
  adminName: z.string().min(2).max(100),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8),
  adminPhone: z.string().optional(),
  planSlug: z.string().min(1),
});

export async function signupAction(data: unknown) {
  return safeAction(async () => {
    const validated = signupSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { firmName, slug, country, currency, timezone, locale, adminName, adminEmail, adminPassword, adminPhone, planSlug } = validated.data;

    // Rate limit signup by email and by IP (global — pre-org)
    const rl = await rateLimit(`signup:${adminEmail}`);
    if (!rl.success) {
      return { error: "Too many signup attempts. Please try again later." };
    }
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") ?? "unknown";
    const ipRl = await rateLimit(`signup-ip:${ip}`);
    if (!ipRl.success) {
      return { error: "Too many signup attempts from this location. Please try again later." };
    }

    // Validate slug availability
    const slugCheck = await checkSlugAvailability(slug);
    if (!slugCheck.valid) {
      return { error: slugCheck.error };
    }

    // Get plan
    const [plan] = await db
      .select({ id: plans.id, trialDays: plans.trialDays })
      .from(plans)
      .where(and(eq(plans.slug, planSlug), eq(plans.isActive, true)))
      .limit(1);

    if (!plan) {
      return { error: "Selected plan not found." };
    }

    // Check email not already in use globally
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    // V1 limitation: email checked globally to avoid confusion during signup.
    // The DB schema supports same email in multiple orgs (unique on email+orgId),
    // but multi-org admin support is deferred to a future release.
    if (existingUser) {
      return { error: "An account with this email already exists." };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Calculate trial end
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + plan.trialDays);

    // --- Provision organization ---
    // Step 1: Create organization (slug unique constraint prevents duplicates)
    const [org] = await db
      .insert(organizations)
      .values({
        name: firmName,
        slug: slug.toLowerCase().trim(),
        email: adminEmail,
        country,
        currency,
        timezone,
        locale,
        status: "active",
        planId: plan.id,
        trialEndsAt,
      })
      .returning({ id: organizations.id });

    // Steps 2-6 wrapped in try/catch — on failure, delete org (cascades to dependents)
    try {
      // Step 2: Create default branch
      const [branch] = await db
        .insert(branches)
        .values({
          organizationId: org.id,
          name: "Main Office",
          isMain: true,
        })
        .returning({ id: branches.id });

      // Step 3: Create admin user
      const [adminUser] = await db
        .insert(users)
        .values({
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          phone: adminPhone ?? null,
          role: "admin",
          organizationId: org.id,
          branchId: branch.id,
          isActive: true,
        })
        .returning({ id: users.id });

      // Step 4: Create organization member (owner)
      await db.insert(organizationMembers).values({
        organizationId: org.id,
        userId: adminUser.id,
        role: "owner",
      });

      // Step 5: Create subscription (trialing)
      await db.insert(subscriptions).values({
        organizationId: org.id,
        planId: plan.id,
        status: "trialing",
        trialEnd: trialEndsAt,
      });

      // Step 6: Seed default practice areas
      const paValues = DEFAULT_PRACTICE_AREAS.map((pa) => ({
        organizationId: org.id,
        name: pa.name,
        description: pa.description,
      }));
      await db.insert(practiceAreas).values(paValues);
    } catch (err) {
      // Cleanup: delete org (cascading deletes handle branches, users, members, subscriptions)
      await db.delete(organizations).where(eq(organizations.id, org.id)).catch(() => {});
      console.error("Provisioning failed, cleaned up org:", err);
      return { error: "Failed to set up your firm. Please try again." };
    }

    // Step 7: Send welcome email (non-blocking)
    const baseDomain = new URL(siteConfig.url).hostname;
    const subdomainUrl = `https://${slug}.${baseDomain}`;
    sendEmail({
      to: adminEmail,
      subject: `Welcome to ${siteConfig.name} — ${firmName}`,
      html: welcomeEmailHtml(escapeHtml(firmName), subdomainUrl, escapeHtml(adminName)),
    }).catch((err) => console.error("Failed to send welcome email:", err));

    return {
      success: true,
      organizationId: org.id,
      slug: slug.toLowerCase().trim(),
      message: "Your firm has been set up successfully!",
    };
  });
}

// --- Invite System ---

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "attorney", "client"]),
  name: z.string().min(2).max(100).optional(),
});

export async function sendInvite(data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId, role: senderRole } = await getTenantContext();
    if (senderRole !== "admin") {
      return { error: "Only admins can send invitations." };
    }

    const validated = inviteSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { email, role: invitedRole, name } = validated.data;

    // Check plan limit for users
    const userLimit = await checkPlanLimit(organizationId, "users");
    if (!userLimit.allowed) {
      return { error: userLimit.error };
    }

    // Check if user already exists in this org
    const [existing] = await db
      .select({ id: users.id, isActive: users.isActive, inviteToken: users.inviteToken })
      .from(users)
      .where(and(eq(users.email, email), eq(users.organizationId, organizationId)))
      .limit(1);

    if (existing?.isActive) {
      return { error: "A user with this email already exists in your organization." };
    }

    // Generate invite token
    const inviteToken = crypto.randomBytes(32).toString("hex");
    const inviteExpiresAt = new Date();
    inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 7); // 7 day expiry

    if (existing) {
      // Re-send invite for existing inactive user
      await db
        .update(users)
        .set({
          inviteToken,
          inviteExpiresAt,
          invitedBy: userId,
          role: invitedRole,
          name: name ?? "Invited User",
          updatedAt: new Date(),
        })
        .where(eq(users.id, existing.id));
    } else {
      // Create pending user
      await db.insert(users).values({
        name: name ?? "Invited User",
        email,
        role: invitedRole,
        organizationId,
        isActive: false,
        inviteToken,
        inviteExpiresAt,
        invitedBy: userId,
      });
    }

    // Get org and sender details for email
    const [org] = await db
      .select({ name: organizations.name, slug: organizations.slug })
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    const [sender] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const inviteBaseDomain = new URL(siteConfig.url).hostname;
    const acceptUrl = `https://${org?.slug}.${inviteBaseDomain}/invite/${inviteToken}`;

    sendEmail({
      to: email,
      subject: `You've been invited to join ${org?.name} on ${siteConfig.name}`,
      html: inviteEmailHtml(
        escapeHtml(org?.name ?? "a law firm"),
        escapeHtml(sender?.name ?? "An administrator"),
        invitedRole,
        acceptUrl
      ),
    }).catch((err) => console.error("Failed to send invite email:", err));

    return { success: true, message: `Invitation sent to ${email}.` };
  });
}

const acceptInviteSchema = z.object({
  token: z.string().min(1),
  name: z.string().min(2).max(100),
  password: z.string().min(8),
});

export async function acceptInvite(data: unknown) {
  return safeAction(async () => {
    const validated = acceptInviteSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { token, name, password } = validated.data;

    // Find user with this invite token
    const [user] = await db
      .select({
        id: users.id,
        organizationId: users.organizationId,
        inviteExpiresAt: users.inviteExpiresAt,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.inviteToken, token))
      .limit(1);

    if (!user) {
      return { error: "Invalid or expired invitation link." };
    }

    if (user.isActive) {
      return { error: "This invitation has already been accepted." };
    }

    if (user.inviteExpiresAt && new Date(user.inviteExpiresAt) < new Date()) {
      return { error: "This invitation has expired. Please ask your admin to send a new one." };
    }

    // Verify organization is still active
    const [org] = await db
      .select({ status: organizations.status })
      .from(organizations)
      .where(eq(organizations.id, user.organizationId))
      .limit(1);

    if (!org || org.status !== "active") {
      return { error: "This organization is no longer active." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Activate user
    await db
      .update(users)
      .set({
        name,
        password: hashedPassword,
        isActive: true,
        inviteToken: null,
        inviteExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Add to organization members
    await db
      .insert(organizationMembers)
      .values({
        organizationId: user.organizationId,
        userId: user.id,
        role: "member",
      })
      .onConflictDoNothing();

    return { success: true, message: "Your account has been activated. You can now log in." };
  });
}
