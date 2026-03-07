import { requireOrg } from "@/lib/auth/get-session";
import { getUsers } from "@/lib/queries/settings";
import { getCases } from "@/lib/queries/cases";
import { MessageForm } from "@/components/forms/message-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Message",
  description: "Compose a new message",
};

export default async function NewMessagePage() {
  const { organizationId } = await requireOrg();
  const [userList, caseResult] = await Promise.all([
    getUsers(organizationId),
    getCases(organizationId, { limit: 200 }),
  ]);

  const users = userList.map((u) => ({
    id: u.id,
    name: u.name ?? u.email,
  }));

  const cases = caseResult.data.map((c) => ({
    id: c.id,
    caseNumber: c.caseNumber,
    title: c.title,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Compose Message</h1>
        <p className="text-muted-foreground">Send a secure internal message.</p>
      </div>
      <MessageForm users={users} cases={cases} />
    </div>
  );
}
