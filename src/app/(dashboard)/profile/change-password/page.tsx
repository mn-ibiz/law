import { requireAuth } from "@/lib/auth/get-session";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { KeyRound } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Change Password",
  description: "Update your account password",
};

export default async function ChangePasswordPage() {
  await requireAuth();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <KeyRound className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Change Password</h1>
          <p className="text-sm text-muted-foreground">
            Update your account password.
          </p>
        </div>
      </div>

      <ChangePasswordForm />
    </div>
  );
}
