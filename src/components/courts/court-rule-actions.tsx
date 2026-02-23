"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { useAction } from "@/hooks/use-action";
import { deleteCourtRule, toggleCourtRuleActive } from "@/lib/actions/courts";
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

interface CourtRuleActionsProps {
  id: string;
  name: string;
  isActive: boolean;
}

export function CourtRuleActions({ id, name, isActive }: CourtRuleActionsProps) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);

  const { execute: executeToggle, isPending: isToggling } = useAction(toggleCourtRuleActive, {
    successMessage: isActive ? "Court rule deactivated" : "Court rule activated",
    onSuccess: () => router.refresh(),
  });

  const { execute: executeDelete, isPending: isDeleting } = useAction(deleteCourtRule, {
    successMessage: "Court rule deleted",
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
        onDelete={() => setShowDelete(true)}
      />

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this court rule. Existing deadlines generated
              by this rule will not be affected. This action cannot be undone.
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
