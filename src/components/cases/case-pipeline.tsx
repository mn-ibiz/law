"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { CaseStatusBadge, PriorityBadge } from "@/components/shared/status-badges";
import { useAction } from "@/hooks/use-action";
import { updateCasePipelineStage } from "@/lib/actions/cases";
import { cn } from "@/lib/utils";
import { Clock, AlertTriangle } from "lucide-react";

interface PipelineCase {
  id: string;
  caseNumber: string;
  title: string;
  status: string;
  priority: string;
  clientName: string;
  stageEnteredAt: Date | null;
}

interface Stage {
  id: string;
  name: string;
  description: string | null;
  order: number;
  color: string | null;
  maxDurationDays: number | null;
  cases: PipelineCase[];
}

function getDaysInStage(stageEnteredAt: Date | null): number | null {
  if (!stageEnteredAt) return null;
  const now = new Date();
  const entered = new Date(stageEnteredAt);
  return Math.floor((now.getTime() - entered.getTime()) / 86400000);
}

function DaysInStageBadge({
  days,
  maxDays,
}: {
  days: number | null;
  maxDays: number | null;
}) {
  if (days === null) return null;

  const isOverdue = maxDays !== null && days > maxDays;
  const isWarning = maxDays !== null && !isOverdue && days > maxDays * 0.75;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-medium",
        isOverdue
          ? "text-red-600"
          : isWarning
            ? "text-amber-600"
            : "text-muted-foreground"
      )}
    >
      {isOverdue ? (
        <AlertTriangle className="h-3 w-3" />
      ) : (
        <Clock className="h-3 w-3" />
      )}
      {days}d{isOverdue ? " (overdue)" : ""}
    </span>
  );
}

export function CasePipeline({ stages: initialStages }: { stages: Stage[] }) {
  const [stages, setStages] = useState(initialStages);
  const [draggingCaseId, setDraggingCaseId] = useState<string | null>(null);
  const [dropTargetStageId, setDropTargetStageId] = useState<string | null>(null);

  const { execute, isPending } = useAction(
    async (input: { caseId: string; stageId: string }) => {
      return updateCasePipelineStage(input.caseId, input.stageId);
    },
    {
      successMessage: "Case moved successfully",
      errorMessage: "Failed to move case",
    }
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, caseId: string) => {
      e.dataTransfer.setData("text/plain", caseId);
      e.dataTransfer.effectAllowed = "move";
      setDraggingCaseId(caseId);
    },
    []
  );

  const handleDragEnd = useCallback(() => {
    setDraggingCaseId(null);
    setDropTargetStageId(null);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>, stageId: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDropTargetStageId(stageId);
    },
    []
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      const relatedTarget = e.relatedTarget as HTMLElement | null;
      if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
        setDropTargetStageId(null);
      }
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, targetStageId: string) => {
      e.preventDefault();
      const caseId = e.dataTransfer.getData("text/plain");
      if (!caseId) return;

      setDraggingCaseId(null);
      setDropTargetStageId(null);

      const sourceStage = stages.find((s) =>
        s.cases.some((c) => c.id === caseId)
      );
      if (!sourceStage || sourceStage.id === targetStageId) return;

      const movedCase = sourceStage.cases.find((c) => c.id === caseId);
      if (!movedCase) return;

      // Optimistically move the case and reset stageEnteredAt
      const optimisticCase = { ...movedCase, stageEnteredAt: new Date() };
      setStages((prev) =>
        prev.map((stage) => {
          if (stage.id === sourceStage.id) {
            return {
              ...stage,
              cases: stage.cases.filter((c) => c.id !== caseId),
            };
          }
          if (stage.id === targetStageId) {
            return {
              ...stage,
              cases: [...stage.cases, optimisticCase],
            };
          }
          return stage;
        })
      );

      execute({ caseId, stageId: targetStageId });
    },
    [stages, execute]
  );

  if (stages.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            No pipeline stages configured for this view. Set up stages in Settings to use the pipeline view.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className={cn("flex gap-4 overflow-x-auto pb-4", isPending && "opacity-80")}
      role="list"
      aria-label="Pipeline stages"
    >
      {stages.map((stage) => (
        <div
          key={stage.id}
          className="min-w-[280px] max-w-[320px] flex-shrink-0"
          role="listitem"
          aria-label={`${stage.name} - ${stage.cases.length} case(s)`}
          onDragOver={(e) => handleDragOver(e, stage.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, stage.id)}
        >
          <Card
            className={cn(
              "shadow-sm transition-all duration-200",
              dropTargetStageId === stage.id &&
                "ring-2 ring-primary/50 bg-primary/5"
            )}
          >
            <CardHeader className="py-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <span className="font-semibold">{stage.name}</span>
                <div className="flex items-center gap-2">
                  {stage.maxDurationDays && (
                    <span className="text-[10px] text-muted-foreground font-normal">
                      max {stage.maxDurationDays}d
                    </span>
                  )}
                  <span className="inline-flex items-center justify-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {stage.cases.length}
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[60vh] overflow-y-auto">
              {stage.cases.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  {dropTargetStageId === stage.id
                    ? "Drop here"
                    : "No cases"}
                </p>
              ) : (
                stage.cases.map((c) => {
                  const days = getDaysInStage(c.stageEnteredAt);
                  return (
                    <div
                      key={c.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, c.id)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "rounded-lg border p-3 shadow-sm transition-all cursor-grab active:cursor-grabbing",
                        draggingCaseId === c.id
                          ? "opacity-40 scale-95"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <Link
                        href={`/cases/${c.id}`}
                        className="block"
                        onClick={(e) => {
                          if (draggingCaseId) e.preventDefault();
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-mono text-muted-foreground">
                            {c.caseNumber}
                          </p>
                          <CaseStatusBadge status={c.status} />
                        </div>
                        <p className="mt-1 text-sm font-medium truncate">
                          {c.title}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {c.clientName}
                          </span>
                          <PriorityBadge priority={c.priority} />
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <DaysInStageBadge
                            days={days}
                            maxDays={stage.maxDurationDays}
                          />
                        </div>
                      </Link>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
