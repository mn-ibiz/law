import Link from "next/link";
import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import {
  getAverageStageDuration,
  getPipelineThroughput,
  getConversionRate,
  getBottleneckCases,
} from "@/lib/queries/pipeline-analytics";
import { StageDurationChart } from "@/components/cases/pipeline-analytics/stage-duration-chart";
import { ConversionFunnel } from "@/components/cases/pipeline-analytics/conversion-funnel";
import { ThroughputChart } from "@/components/cases/pipeline-analytics/throughput-chart";
import { BottleneckTable } from "@/components/cases/pipeline-analytics/bottleneck-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pipeline Analytics",
  description: "Case pipeline performance analytics",
};

export default async function PipelineAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ practiceArea?: string }>;
}) {
  await requireAdminOrAttorney();
  const { practiceArea } = await searchParams;
  const paId = practiceArea || null;

  const [avgDuration, throughput, conversion, bottlenecks] = await Promise.all([
    getAverageStageDuration(paId),
    getPipelineThroughput(paId),
    getConversionRate(paId),
    getBottleneckCases(paId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pipeline Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Performance metrics for the case pipeline.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={practiceArea ? `/cases/pipeline?practiceArea=${practiceArea}` : "/cases/pipeline"}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pipeline
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <StageDurationChart data={avgDuration} />
        <ConversionFunnel data={conversion} />
        <ThroughputChart data={throughput} />
        <BottleneckTable data={bottlenecks} />
      </div>
    </div>
  );
}
