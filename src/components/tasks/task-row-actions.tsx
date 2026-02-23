"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "@/hooks/use-action";
import { updateTaskStatus, deleteTask } from "@/lib/actions/calendar";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { StatusUpdateDropdown } from "@/components/shared/status-update-dropdown";
import { TaskEditSheet } from "@/components/tasks/task-edit-sheet";
import { Spinner } from "@/components/ui/spinner";
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

interface TaskData {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  dueDate: Date | null;
  status: string;
}

const TASK_STATUS_OPTIONS = [
  { value: "pending" },
  { value: "in_progress" },
  { value: "completed" },
  { value: "cancelled" },
];

export function TaskRowActions({ task }: { task: TaskData }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { execute: execStatusChange, isPending: statusPending } = useAction(
    (input: { id: string; status: string }) =>
      updateTaskStatus(
        input.id,
        input.status as "pending" | "in_progress" | "completed" | "cancelled"
      ),
    {
      successMessage: "Task status updated",
      onSuccess: () => router.refresh(),
    }
  );

  const { execute: execDelete, isPending: deletePending } = useAction(
    (input: { id: string }) => deleteTask(input.id),
    {
      successMessage: "Task deleted",
      onSuccess: () => {
        setDeleteOpen(false);
        router.refresh();
      },
    }
  );

  return (
    <div className="flex items-center gap-1">
      <StatusUpdateDropdown
        currentStatus={task.status}
        options={TASK_STATUS_OPTIONS}
        onSelect={(status) => execStatusChange({ id: task.id, status })}
        isPending={statusPending}
        label="Change status"
      />

      <RowActionsMenu
        actions={[]}
        onEdit={() => setEditOpen(true)}
        onDelete={() => setDeleteOpen(true)}
      />

      <TaskEditSheet task={task} open={editOpen} onOpenChange={setEditOpen} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{task.title}&rdquo;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => execDelete({ id: task.id })}
              disabled={deletePending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePending ? <Spinner className="h-4 w-4 mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
