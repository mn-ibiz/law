import Link from "next/link";
import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getCasesByPipelineStage } from "@/lib/queries/cases";
import { CasePipeline } from "@/components/cases/case-pipeline";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function CasePipelinePage() {
  await requireAdminOrAttorney();
  const stages = await getCasesByPipelineStage();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Case Pipeline</h1>
          <p className="text-muted-foreground">Visual Kanban board of active cases.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/cases">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Table View
          </Link>
        </Button>
      </div>
      <CasePipeline stages={stages} />
    </div>
  );
}
