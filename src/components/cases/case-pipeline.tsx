"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface PipelineCase {
  id: string;
  caseNumber: string;
  title: string;
  status: string;
  priority: string;
  clientName: string;
}

interface Stage {
  id: string;
  name: string;
  description: string | null;
  order: number;
  color: string | null;
  cases: PipelineCase[];
}

const priorityVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  low: "secondary",
  medium: "outline",
  high: "default",
  urgent: "destructive",
};

export function CasePipeline({ stages }: { stages: Stage[] }) {
  if (stages.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            No pipeline stages configured. Set up stages in Settings to use the pipeline view.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => (
        <div
          key={stage.id}
          className="min-w-[280px] max-w-[320px] flex-shrink-0"
        >
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>{stage.name}</span>
                <Badge variant="secondary">{stage.cases.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[60vh] overflow-y-auto">
              {stage.cases.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No cases
                </p>
              ) : (
                stage.cases.map((c) => (
                  <Link
                    key={c.id}
                    href={`/cases/${c.id}`}
                    className="block rounded-md border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <p className="text-xs font-mono text-muted-foreground">
                      {c.caseNumber}
                    </p>
                    <p className="text-sm font-medium truncate">{c.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {c.clientName}
                      </span>
                      <Badge
                        variant={priorityVariant[c.priority] ?? "secondary"}
                        className="text-xs"
                      >
                        {c.priority}
                      </Badge>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
