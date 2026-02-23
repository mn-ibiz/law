import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getCases } from "@/lib/queries/cases";
import { getUsers } from "@/lib/queries/settings";
import { TaskForm } from "@/components/forms/task-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Task",
  description: "Create a new task",
};

export default async function NewTaskPage() {
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
        <h1 className="text-2xl font-bold tracking-tight">New Task</h1>
        <p className="text-muted-foreground">Create a new work task.</p>
      </div>
      <TaskForm cases={cases} users={users} />
    </div>
  );
}
