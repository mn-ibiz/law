"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { useAction } from "@/hooks/use-action";
import { deletePracticeArea, togglePracticeAreaActive } from "@/lib/actions/settings";
import { PracticeAreaDialog } from "@/components/settings/practice-area-dialog";
import { ToggleLeft, ToggleRight } from "lucide-react";
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

interface PracticeAreaActionsProps {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export function PracticeAreaActions({ id, name, description, isActive }: PracticeAreaActionsProps) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const { execute: executeToggle, isPending: isToggling } = useAction(togglePracticeAreaActive, {
    successMessage: isActive ? "Practice area deactivated" : "Practice area activated",
    onSuccess: () => router.refresh(),
  });

  const { execute: executeDelete, isPending: isDeleting } = useAction(deletePracticeArea, {
    successMessage: "Practice area deleted",
    onSuccess: () => {
      setShowDelete(false);
      router.refresh();
    },
  });

  return (
    <>
      <RowActionsMenu
        actions={[
          {
            label: isActive ? "Deactivate" : "Activate",
            icon: isActive ? ToggleLeft : ToggleRight,
            onClick: () => executeToggle(id),
            disabled: isToggling,
          },
        ]}
        onEdit={() => setShowEdit(true)}
        onDelete={() => setShowDelete(true)}
      />

      <PracticeAreaDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        editData={{ id, name, description }}
      />

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this practice area. This action cannot be undone.
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
