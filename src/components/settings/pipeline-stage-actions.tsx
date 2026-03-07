"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { useAction } from "@/hooks/use-action";
import { deletePipelineStage } from "@/lib/actions/cases";
import { PipelineStageDialog } from "@/components/settings/pipeline-stage-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";

interface PipelineStageActionsProps {
  id: string;
  name: string;
  description: string | null;
  order: number;
  color: string | null;
  isDefault: boolean;
  practiceAreaId: string | null;
  maxDurationDays: number | null;
  practiceAreas: { id: string; name: string }[];
}

export function PipelineStageActions({
  id,
  name,
  description,
  order,
  color,
  isDefault,
  practiceAreaId,
  maxDurationDays,
  practiceAreas,
}: PipelineStageActionsProps) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const { execute: executeDelete, isPending: isDeleting } = useAction(deletePipelineStage, {
    successMessage: "Pipeline stage deleted",
    onSuccess: () => {
      setShowDelete(false);
      router.refresh();
    },
  });

  return (
    <>
      <RowActionsMenu
        actions={[]}
        onEdit={() => setShowEdit(true)}
        onDelete={() => setShowDelete(true)}
      />

      <PipelineStageDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        editData={{ id, name, description, order, color, isDefault, practiceAreaId, maxDurationDays }}
        practiceAreas={practiceAreas}
      />

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this pipeline stage. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => executeDelete(id)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Spinner className="h-4 w-4 mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
