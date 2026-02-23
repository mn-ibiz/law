"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PracticeAreaDialog } from "@/components/settings/practice-area-dialog";

export function PracticeAreasToolbar() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setShowCreate(true)}>
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        New Practice Area
      </Button>

      <PracticeAreaDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        editData={null}
      />
    </>
  );
}
