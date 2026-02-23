import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getCases } from "@/lib/queries/cases";
import { getUsers } from "@/lib/queries/settings";
import { BringUpForm } from "@/components/forms/bring-up-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Bring-Up",
  description: "Schedule a new file bring-up",
};

export default async function NewBringUpPage() {
  await requireAdminOrAttorney();

  const [{ data: caseList }, userList] = await Promise.all([
    getCases({ limit: 200 }),
    getUsers(),
  ]);

  const cases = caseList.map((c) => ({
    id: c.id,
    caseNumber: c.caseNumber,
    title: c.title,
  }));

  const users = userList.map((u) => ({
    id: u.id,
    name: u.name ?? u.email,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Bring-Up</h1>
        <p className="text-muted-foreground">Schedule a new file bring-up reminder.</p>
      </div>
      <BringUpForm cases={cases} users={users} />
    </div>
  );
}
