"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { CaseStatusBadge, PriorityBadge } from "@/components/shared/status-badges";
import { useAction } from "@/hooks/use-action";
import { updateCasePipelineStage } from "@/lib/actions/cases";
import { cn } from "@/lib/utils";
import {
  Clock,
  AlertTriangle,
  Search,
  ExternalLink,
  Briefcase,
  User,
  FolderOpen,
  Settings2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

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

const STAGE_COLORS: Record<number, string> = {
  0: "#8b5cf6", // violet
  1: "#3b82f6", // blue
  2: "#10b981", // emerald
  3: "#f59e0b", // amber
  4: "#ef4444", // red
  5: "#ec4899", // pink
  6: "#06b6d4", // cyan
  7: "#84cc16", // lime
};

function getStageColor(index: number, color: string | null): string {
  if (color) return color;
  return STAGE_COLORS[index % Object.keys(STAGE_COLORS).length];
}

function getDaysInStage(stageEnteredAt: Date | null): number | null {
  if (!stageEnteredAt) return null;
  const now = new Date();
  const entered = new Date(stageEnteredAt);
  return Math.floor((now.getTime() - entered.getTime()) / 86400000);
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getInitialsBg(name: string): string {
  const colors = [
    "bg-violet-500",
    "bg-blue-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
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
  const progress = maxDays ? Math.min((days / maxDays) * 100, 100) : null;

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "inline-flex items-center gap-1 text-[11px] font-medium",
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
        {days}d{maxDays ? ` / ${maxDays}d` : ""}
      </span>
      {progress !== null && (
        <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isOverdue
                ? "bg-red-500"
                : isWarning
                  ? "bg-amber-500"
                  : "bg-emerald-500"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

function PipelineCard({
  caseItem,
  maxDays,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  caseItem: PipelineCase;
  maxDays: number | null;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
}) {
  const days = getDaysInStage(caseItem.stageEnteredAt);
  const initials = getInitials(caseItem.clientName);
  const bgColor = getInitialsBg(caseItem.clientName);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "group rounded-xl border bg-card p-3.5 shadow-sm transition-all duration-200 cursor-grab active:cursor-grabbing",
        isDragging
          ? "opacity-40 scale-95 rotate-1"
          : "hover:shadow-md hover:-translate-y-0.5"
      )}
    >
      <Link
        href={`/cases/${caseItem.id}`}
        className="block"
        onClick={(e) => {
          if (isDragging) e.preventDefault();
        }}
      >
        {/* Header: Avatar + Name */}
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
              bgColor
            )}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate leading-tight">
              {caseItem.title}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <User className="h-3 w-3 text-muted-foreground shrink-0" />
              <p className="text-xs text-muted-foreground truncate">
                {caseItem.clientName}
              </p>
            </div>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-colors shrink-0 mt-0.5" />
        </div>

        {/* Case Number */}
        <div className="mt-3 flex items-center gap-1.5">
          <Briefcase className="h-3 w-3 text-muted-foreground" />
          <span className="text-[11px] font-mono text-muted-foreground">
            {caseItem.caseNumber}
          </span>
        </div>

        {/* Badges Row */}
        <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <CaseStatusBadge status={caseItem.status} />
            <PriorityBadge priority={caseItem.priority} />
          </div>
        </div>

        {/* Days in Stage */}
        {days !== null && (
          <div className="mt-2.5 pt-2.5 border-t border-dashed">
            <DaysInStageBadge days={days} maxDays={maxDays} />
          </div>
        )}
      </Link>
    </div>
  );
}

function EmptyDropZone({ isDropTarget }: { isDropTarget: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 px-4 transition-all min-h-[300px]",
        isDropTarget
          ? "border-primary/50 bg-primary/5"
          : "border-muted-foreground/15 bg-muted/30"
      )}
    >
      <FolderOpen
        className={cn(
          "h-8 w-8 mb-2",
          isDropTarget ? "text-primary/50" : "text-muted-foreground/30"
        )}
      />
      <p
        className={cn(
          "text-xs font-medium",
          isDropTarget ? "text-primary/70" : "text-muted-foreground/50"
        )}
      >
        {isDropTarget ? "Drop case here" : "Drop cases here"}
      </p>
    </div>
  );
}

export function CasePipeline({ stages: initialStages }: { stages: Stage[] }) {
  const [stages, setStages] = useState(initialStages);
  const [draggingCaseId, setDraggingCaseId] = useState<string | null>(null);
  const [dropTargetStageId, setDropTargetStageId] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  const { execute, isPending } = useAction(
    async (input: { caseId: string; stageId: string }) => {
      return updateCasePipelineStage(input.caseId, input.stageId);
    },
    {
      successMessage: "Case moved successfully",
      errorMessage: "Failed to move case",
    }
  );

  const filteredStages = useMemo(() => {
    if (!searchQuery.trim()) return stages;
    const q = searchQuery.toLowerCase();
    return stages.map((stage) => ({
      ...stage,
      cases: stage.cases.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.clientName.toLowerCase().includes(q) ||
          c.caseNumber.toLowerCase().includes(q)
      ),
    }));
  }, [stages, searchQuery]);

  const totalCases = useMemo(
    () => stages.reduce((sum, s) => sum + s.cases.length, 0),
    [stages]
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
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 px-4">
        <FolderOpen className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">
          No pipeline stages configured
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1 mb-4">
          Create stages to start using the pipeline board.
        </p>
        <Link
          href="/settings/pipeline-stages"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Settings2 className="h-4 w-4" />
          Configure Stages
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by case, client, or case number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-background rounded-lg"
          />
        </div>
        <Badge variant="secondary" className="text-xs font-medium h-7 px-3">
          {totalCases} case{totalCases !== 1 ? "s" : ""} total
        </Badge>
      </div>

      {/* Kanban Board */}
      <div
        className={cn(
          "flex gap-4 overflow-x-auto pb-4 -mx-1 px-1",
          isPending && "opacity-80 pointer-events-none"
        )}
        role="list"
        aria-label="Pipeline stages"
      >
        {filteredStages.map((stage, index) => {
          const stageColor = getStageColor(index, stage.color);
          const isDropTarget = dropTargetStageId === stage.id;

          return (
            <div
              key={stage.id}
              className="min-w-[300px] max-w-[320px] flex-shrink-0 flex flex-col min-h-[500px]"
              role="listitem"
              aria-label={`${stage.name} - ${stage.cases.length} case(s)`}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Column */}
              <div
                className={cn(
                  "rounded-xl border bg-muted/20 transition-all duration-200 flex flex-col h-full",
                  isDropTarget && "ring-2 ring-primary/40 bg-primary/[0.03]"
                )}
                style={{
                  borderLeftColor: stageColor,
                  borderLeftWidth: "3px",
                }}
              >
                {/* Column Header */}
                <div className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="text-[15px] font-bold"
                        style={{ color: stageColor }}
                      >
                        {stage.name}
                      </span>
                      <span
                        className="inline-flex items-center justify-center rounded-full h-5 min-w-[20px] px-1.5 text-[11px] font-bold text-white"
                        style={{ backgroundColor: stageColor }}
                      >
                        {stage.cases.length}
                      </span>
                    </div>
                    {stage.maxDurationDays && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-[10px] text-muted-foreground font-medium bg-muted rounded-full px-2 py-0.5">
                              max {stage.maxDurationDays}d
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Cases should not stay longer than{" "}
                              {stage.maxDurationDays} days
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  {stage.description && (
                    <p className="text-[11px] text-muted-foreground mt-1 truncate">
                      {stage.description}
                    </p>
                  )}
                </div>

                {/* Cards Container */}
                <ScrollArea className="flex-1 max-h-[calc(100vh-260px)]">
                  <div className="space-y-2.5 px-3 pb-3">
                    {stage.cases.length === 0 ? (
                      <EmptyDropZone isDropTarget={isDropTarget} />
                    ) : (
                      stage.cases.map((c) => (
                        <PipelineCard
                          key={c.id}
                          caseItem={c}
                          maxDays={stage.maxDurationDays}
                          isDragging={draggingCaseId === c.id}
                          onDragStart={(e) => handleDragStart(e, c.id)}
                          onDragEnd={handleDragEnd}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>

                {/* Column Footer */}
                {stage.cases.length > 0 && (
                  <div className="px-4 py-2 border-t text-[11px] text-muted-foreground font-medium">
                    {stage.cases.length} case{stage.cases.length !== 1 ? "s" : ""}
                    {searchQuery && stages[index].cases.length !== stage.cases.length && (
                      <span className="ml-1">
                        (of {stages[index].cases.length})
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
