import Link from "next/link";
import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getCasesByPipelineStage } from "@/lib/queries/cases";
import { getPracticeAreas } from "@/lib/queries/settings";
import { CasePipeline } from "@/components/cases/case-pipeline";
import { PipelineToolbar } from "@/components/cases/pipeline-toolbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
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
  await requireAdminOrAttorney();
  const { practiceArea } = await searchParams;

  const [stages, allPracticeAreas] = await Promise.all([
    getCasesByPipelineStage(practiceArea || null),
    getPracticeAreas(),
  ]);

  // Only show practice areas that have pipeline stages configured
  const activePracticeAreas = allPracticeAreas.filter((pa) => pa.isActive);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Case Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            Visual Kanban board of active cases.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/cases">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Table View
          </Link>
        </Button>
      </div>
      <PipelineToolbar practiceAreas={activePracticeAreas} />
      <section aria-label="Case pipeline board" role="region">
        <CasePipeline stages={stages} />
      </section>
    </div>
  );
}
