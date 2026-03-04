import { requireAuth } from "@/lib/auth/get-session";
import { getUserById } from "@/lib/queries/settings";
import { notFound } from "next/navigation";
import { ProfileForm } from "@/components/profile/profile-form";
import { User } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile",
  description: "View and update your profile information",
};

export default async function ProfilePage() {
  const session = await requireAuth();
  const user = await getUserById(session.user.id);
  if (!user) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
          <p className="text-sm text-muted-foreground">
            View and update your profile information.
          </p>
        </div>
      </div>

      <ProfileForm user={user} />
    </div>
  );
}
