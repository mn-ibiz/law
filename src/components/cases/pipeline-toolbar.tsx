"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
    <div className="overflow-x-auto">
      <div className="flex items-center gap-1 rounded-lg bg-muted p-1 w-fit">
        <Link
          href="/cases/pipeline"
          className={cn(
            "px-3 py-1.5 text-sm rounded-md transition-colors whitespace-nowrap",
            !activePa
              ? "bg-background text-foreground shadow-sm font-medium"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          All Cases
        </Link>
        {practiceAreas.map((pa) => (
          <Link
            key={pa.id}
            href={`/cases/pipeline?practiceArea=${pa.id}`}
            className={cn(
              "px-3 py-1.5 text-sm rounded-md transition-colors whitespace-nowrap",
              activePa === pa.id
                ? "bg-background text-foreground shadow-sm font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {pa.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
