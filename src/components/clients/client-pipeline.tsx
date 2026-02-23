"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useAction } from "@/hooks/use-action";
import { updateClientPipelineStage } from "@/lib/actions/clients";
import { formatEnum } from "@/lib/utils/format-enum";
import { cn } from "@/lib/utils";
import { Building2, Mail, User } from "lucide-react";

interface PipelineClient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  status: string;
  type: string;
  leadSource: string | null;
  leadScore: number;
  followUpDate: Date | null;
  createdAt: Date;
}

interface StageConfig {
  id: string;
  name: string;
  color: string;
}

const STAGES: StageConfig[] = [
  {
    id: "prospective",
    name: "Prospective",
    color: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  },
  {
    id: "active",
    name: "Active",
    color: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  },
  {
    id: "inactive",
    name: "Inactive",
    color: "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/20",
  },
];

const capsule =
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none whitespace-nowrap";

function LeadSourceBadge({ source }: { source: string | null }) {
  if (!source) return null;
  return (
    <span
      className={cn(
        capsule,
        "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-600/20"
      )}
    >
      {formatEnum(source)}
    </span>
  );
}

function ClientTypeBadge({ type }: { type: string }) {
  return (
    <span
      className={cn(
        capsule,
        type === "organization"
          ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"
          : "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/20"
      )}
    >
      {type === "organization" ? (
        <Building2 className="h-2.5 w-2.5" />
      ) : (
        <User className="h-2.5 w-2.5" />
      )}
      {formatEnum(type)}
    </span>
  );
}

export function ClientPipeline({
  initialData,
}: {
  initialData: Record<string, PipelineClient[]>;
}) {
  const [data, setData] = useState(initialData);
  const [draggingClientId, setDraggingClientId] = useState<string | null>(null);
  const [dropTargetStageId, setDropTargetStageId] = useState<string | null>(
    null
  );

  const { execute, isPending } = useAction(
    async (input: { clientId: string; status: string }) => {
      return updateClientPipelineStage(input.clientId, input.status);
    },
    {
      successMessage: "Client moved successfully",
      errorMessage: "Failed to move client",
    }
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, clientId: string) => {
      e.dataTransfer.setData("text/plain", clientId);
      e.dataTransfer.effectAllowed = "move";
      setDraggingClientId(clientId);
    },
    []
  );

  const handleDragEnd = useCallback(() => {
    setDraggingClientId(null);
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
      const clientId = e.dataTransfer.getData("text/plain");
      if (!clientId) return;

      setDraggingClientId(null);
      setDropTargetStageId(null);

      // Find which stage the client is currently in
      let sourceStageId: string | null = null;
      let movedClient: PipelineClient | null = null;
      for (const [stageId, clients] of Object.entries(data)) {
        const found = clients.find((c) => c.id === clientId);
        if (found) {
          sourceStageId = stageId;
          movedClient = found;
          break;
        }
      }

      if (!sourceStageId || !movedClient || sourceStageId === targetStageId)
        return;

      // Optimistically move the client
      setData((prev) => {
        const next = { ...prev };
        next[sourceStageId] = prev[sourceStageId].filter(
          (c) => c.id !== clientId
        );
        next[targetStageId] = [
          { ...movedClient!, status: targetStageId },
          ...prev[targetStageId],
        ];
        return next;
      });

      execute({ clientId, status: targetStageId });
    },
    [data, execute]
  );

  return (
    <div
      className={cn(
        "flex gap-4 overflow-x-auto pb-4",
        isPending && "opacity-80"
      )}
      role="list"
      aria-label="Client pipeline stages"
    >
      {STAGES.map((stage) => {
        const stageClients = data[stage.id] ?? [];
        return (
          <div
            key={stage.id}
            className="min-w-[300px] max-w-[360px] flex-shrink-0 flex-1"
            role="listitem"
            aria-label={`${stage.name} - ${stageClients.length} client(s)`}
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
                  <span className="inline-flex items-center justify-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {stageClients.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[60vh] overflow-y-auto">
                {stageClients.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">
                    {dropTargetStageId === stage.id
                      ? "Drop here"
                      : "No clients"}
                  </p>
                ) : (
                  stageClients.map((client) => (
                    <div
                      key={client.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, client.id)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "rounded-lg border p-3 shadow-sm transition-all cursor-grab active:cursor-grabbing",
                        draggingClientId === client.id
                          ? "opacity-40 scale-95"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <Link
                        href={`/clients/${client.id}`}
                        className="block"
                        onClick={(e) => {
                          if (draggingClientId) e.preventDefault();
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">
                            {client.firstName} {client.lastName}
                          </p>
                          <ClientTypeBadge type={client.type} />
                        </div>
                        {client.companyName && (
                          <p className="mt-0.5 text-xs text-muted-foreground truncate">
                            {client.companyName}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <LeadSourceBadge source={client.leadSource} />
                          {client.leadScore > 0 && (
                            <span className="text-[10px] font-medium text-muted-foreground">
                              Score: {client.leadScore}
                            </span>
                          )}
                        </div>
                      </Link>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
