"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CauseListForm } from "./cause-list-form";

export function CauseListActions() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        New Cause List
      </Button>
      <CauseListForm open={open} onOpenChange={setOpen} />
    </>
  );
}
