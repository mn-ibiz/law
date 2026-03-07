import { requireOrg } from "@/lib/auth/get-session";
import { getPipelineStages } from "@/lib/queries/cases";
import { getPracticeAreas } from "@/lib/queries/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PipelineStagesToolbar } from "@/components/settings/pipeline-stages-toolbar";
import { PipelineStageActions } from "@/components/settings/pipeline-stage-actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pipeline Stages",
  description: "Configure pipeline stages for case workflow",
};

export default async function PipelineStagesPage() {
  const { organizationId } = await requireOrg();
  const [stages, practiceAreas] = await Promise.all([
    getPipelineStages(organizationId),
    getPracticeAreas(organizationId),
  ]);

  const activePracticeAreas = practiceAreas
    .filter((pa) => pa.isActive)
    .map((pa) => ({ id: pa.id, name: pa.name }));

  const paMap = new Map(activePracticeAreas.map((pa) => [pa.id, pa.name]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pipeline Stages</h1>
          <p className="text-muted-foreground">
            Configure the stages cases move through in the pipeline board.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/cases/pipeline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Pipeline
            </Link>
          </Button>
          <PipelineStagesToolbar practiceAreas={activePracticeAreas} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Stages</CardTitle>
        </CardHeader>
        <CardContent>
          {stages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                No pipeline stages configured yet. Click &quot;New Stage&quot; to create one.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Order</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Practice Area</TableHead>
                  <TableHead>Max Days</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stages.map((stage) => (
                  <TableRow key={stage.id}>
                    <TableCell className="font-mono text-muted-foreground">
                      {stage.order}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{stage.name}</p>
                        {stage.description && (
                          <p className="text-xs text-muted-foreground">{stage.description}</p>
                        )}
                        {stage.isDefault && (
                          <Badge variant="secondary" className="mt-1 text-[10px]">Default</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {stage.practiceAreaId ? (
                        <span className="text-sm">{paMap.get(stage.practiceAreaId) ?? "Unknown"}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">All (Default)</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {stage.maxDurationDays ? (
                        <span className="text-sm">{stage.maxDurationDays} days</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {stage.color ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded-full border"
                            style={{ backgroundColor: stage.color }}
                          />
                          <span className="text-xs font-mono text-muted-foreground">{stage.color}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Auto</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <PipelineStageActions
                        id={stage.id}
                        name={stage.name}
                        description={stage.description}
                        order={stage.order}
                        color={stage.color}
                        isDefault={stage.isDefault}
                        practiceAreaId={stage.practiceAreaId}
                        maxDurationDays={stage.maxDurationDays}
                        practiceAreas={activePracticeAreas}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
