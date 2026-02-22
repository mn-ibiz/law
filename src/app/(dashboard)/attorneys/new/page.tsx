import { requireAdmin } from "@/lib/auth/get-session";
import { AttorneyForm } from "@/components/forms/attorney-form";

export default async function NewAttorneyPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add Attorney</h1>
        <p className="text-muted-foreground">Create a new attorney profile.</p>
      </div>
      <AttorneyForm />
    </div>
  );
}
