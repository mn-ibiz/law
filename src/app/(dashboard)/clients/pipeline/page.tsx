import { requireRole } from "@/lib/auth/get-session";
import { getClientsByPipelineStage } from "@/lib/queries/clients";
import { ClientPipeline } from "@/components/clients/client-pipeline";
import { Kanban } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Pipeline",
  description: "Manage client lifecycle stages",
};

export default async function ClientPipelinePage() {
  await requireRole("admin", "attorney");
  const groupedClients = await getClientsByPipelineStage();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Kanban className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Client Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            Drag clients between stages to manage their lifecycle.
          </p>
        </div>
      </div>

      <ClientPipeline initialData={groupedClients} />
    </div>
  );
}
