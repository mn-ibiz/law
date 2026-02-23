"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PracticeArea {
  id: string;
  name: string;
}

export function PipelineToolbar({
  practiceAreas,
}: {
  practiceAreas: PracticeArea[];
}) {
  const searchParams = useSearchParams();
  const activePa = searchParams.get("practiceArea");

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
        <Link
          href="/cases/pipeline"
          className={cn(
            "px-3 py-1.5 text-sm rounded-md transition-colors",
            !activePa
              ? "bg-background text-foreground shadow-sm font-medium"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Default
        </Link>
        {practiceAreas.map((pa) => (
          <Link
            key={pa.id}
            href={`/cases/pipeline?practiceArea=${pa.id}`}
            className={cn(
              "px-3 py-1.5 text-sm rounded-md transition-colors",
              activePa === pa.id
                ? "bg-background text-foreground shadow-sm font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {pa.name}
          </Link>
        ))}
      </div>
      <Button variant="outline" size="sm" asChild>
        <Link href="/cases/pipeline/analytics">
          <BarChart3 className="mr-2 h-4 w-4" />
          Analytics
        </Link>
      </Button>
    </div>
  );
}
