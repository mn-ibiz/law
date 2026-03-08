import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/auth";
import { organizations } from "@/lib/db/schema/organizations";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { InviteAcceptForm } from "./invite-accept-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accept Invitation — Law Firm Registry",
};

export default async function InviteAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Find the invited user
  const [invitedUser] = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      inviteExpiresAt: users.inviteExpiresAt,
      organizationId: users.organizationId,
    })
    .from(users)
    .where(eq(users.inviteToken, token))
    .limit(1);

  if (!invitedUser) {
    notFound();
  }

  if (invitedUser.isActive) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
        <h2 className="text-lg font-bold">Already Accepted</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This invitation has already been accepted. You can log in to your account.
        </p>
      </div>
    );
  }

  if (invitedUser.inviteExpiresAt && new Date(invitedUser.inviteExpiresAt) < new Date()) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
        <h2 className="text-lg font-bold">Invitation Expired</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This invitation has expired. Please ask your administrator to send a new one.
        </p>
      </div>
    );
  }

  // Get org name
  const [org] = await db
    .select({ name: organizations.name })
    .from(organizations)
    .where(eq(organizations.id, invitedUser.organizationId))
    .limit(1);

  return (
    <div className="rounded-xl border bg-card p-8 shadow-sm">
      <h2 className="text-lg font-bold">Accept Invitation</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        You&apos;ve been invited to join <strong>{org?.name}</strong> as a{" "}
        <strong>{invitedUser.role}</strong>.
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Set up your account to get started.
      </p>
      <InviteAcceptForm token={token} email={invitedUser.email} />
    </div>
  );
}
