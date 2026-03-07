import Link from "next/link";
import { requireOrg } from "@/lib/auth/get-session";
import { getCasesByPipelineStage } from "@/lib/queries/cases";
import { getPracticeAreas } from "@/lib/queries/settings";
import { CasePipeline } from "@/components/cases/case-pipeline";
import { PipelineToolbar } from "@/components/cases/pipeline-toolbar";
import { Button } from "@/components/ui/button";
import { BarChart3, Kanban, Settings2, TableProperties } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Case Pipeline",
  description: "Visual case pipeline and workflow",
};

export default async function CasePipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ practiceArea?: string }>;
}) {
  const { organizationId } = await requireOrg();
  const { practiceArea } = await searchParams;

  const [stages, allPracticeAreas] = await Promise.all([
    getCasesByPipelineStage(organizationId, practiceArea || null),
    getPracticeAreas(organizationId),
  ]);

  // Only show practice areas that have pipeline stages configured
  const activePracticeAreas = allPracticeAreas.filter((pa) => pa.isActive);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Kanban className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Case Pipeline</h1>
            <p className="text-sm text-muted-foreground">
              Drag and drop cases between stages to update their progress.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/settings/pipeline-stages">
              <Settings2 className="mr-2 h-4 w-4" />
              Manage Stages
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/cases/pipeline/analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/cases">
              <TableProperties className="mr-2 h-4 w-4" />
              Table View
            </Link>
          </Button>
        </div>
      </div>
      <PipelineToolbar practiceAreas={activePracticeAreas} />
      <section aria-label="Case pipeline board" role="region">
        <CasePipeline stages={stages} />
      </section>
    </div>
  );
}
