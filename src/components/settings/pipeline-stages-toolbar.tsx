"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PipelineStageDialog } from "@/components/settings/pipeline-stage-dialog";

interface PipelineStagesToolbarProps {
  practiceAreas: { id: string; name: string }[];
}

export function PipelineStagesToolbar({ practiceAreas }: PipelineStagesToolbarProps) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setShowCreate(true)}>
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        New Stage
      </Button>

      <PipelineStageDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        editData={null}
        practiceAreas={practiceAreas}
      />
    </>
  );
}
