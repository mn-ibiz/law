import type { Metadata } from "next";
import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { ClientForm } from "@/components/forms/client-form";

export const metadata: Metadata = {
  title: "Add Client",
  description: "Register a new client",
};

export default async function NewClientPage() {
  await requireAdminOrAttorney();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add Client</h1>
        <p className="text-muted-foreground">Register a new client in the system.</p>
      </div>
      <ClientForm />
    </div>
  );
}
