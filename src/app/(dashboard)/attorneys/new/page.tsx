import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/get-session";
import { AttorneyForm } from "@/components/forms/attorney-form";
import { getUsers } from "@/lib/queries/settings";

export const metadata: Metadata = {
  title: "Add Attorney",
  description: "Register a new attorney profile",
};

export default async function NewAttorneyPage() {
  await requireAdmin();
  const allUsers = await getUsers();
  // Only show active users that can be linked to an attorney profile
  const availableUsers = allUsers
    .filter((u) => u.isActive)
    .map((u) => ({ id: u.id, name: u.name, email: u.email }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add Attorney</h1>
        <p className="text-muted-foreground">Create a new attorney profile.</p>
      </div>
      <AttorneyForm users={availableUsers} />
    </div>
  );
}
