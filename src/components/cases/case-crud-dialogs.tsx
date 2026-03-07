"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, UserPlus, UserMinus } from "lucide-react";
import { addCaseNote, updateCaseNote, deleteCaseNote } from "@/lib/actions/cases";
import { addCaseParty, updateCaseParty, deleteCaseParty } from "@/lib/actions/cases";
import { assignCase, unassignCase } from "@/lib/actions/cases";
import { createTask, updateTask, updateTaskStatus, deleteTask } from "@/lib/actions/calendar";
import { createDeadline, updateDeadline, completeDeadline, deleteDeadline } from "@/lib/actions/calendar";

// ── Note Dialogs ──

interface NoteFormProps {
  caseId: string;
  note?: { id: string; content: string; isPrivate: boolean };
  trigger?: React.ReactNode;
}

export function AddNoteDialog({ caseId, note, trigger }: NoteFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isEdit = !!note;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const content = fd.get("content") as string;
    const isPrivate = fd.get("isPrivate") === "on";

    startTransition(async () => {
      const result = isEdit
        ? await updateCaseNote(note!.id, caseId, { content, isPrivate })
        : await addCaseNote(caseId, { content, isPrivate });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(isEdit ? "Note updated" : "Note added");
        setOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Note
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Note" : "Add Note"}</DialogTitle>
            <DialogDescription>
              {isEdit ? "Update the note content." : "Add a note to this case."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="content">Note</Label>
              <Textarea
                id="content"
                name="content"
                required
                rows={4}
                defaultValue={note?.content ?? ""}
                placeholder="Enter note content..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="isPrivate"
                name="isPrivate"
                defaultChecked={note?.isPrivate ?? false}
              />
              <Label htmlFor="isPrivate">Private note (only visible to you)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEdit ? "Update" : "Add Note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteNoteButton({ noteId, caseId }: { noteId: string; caseId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Note</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this note. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const result = await deleteCaseNote(noteId, caseId);
                if (result?.error) toast.error(result.error);
                else {
                  toast.success("Note deleted");
                  router.refresh();
                }
              });
            }}
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ── Party Dialogs ──

interface PartyFormProps {
  caseId: string;
  party?: { id: string; name: string; role: string; email: string | null; phone: string | null };
  trigger?: React.ReactNode;
}

export function AddPartyDialog({ caseId, party, trigger }: PartyFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isEdit = !!party;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") as string,
      role: fd.get("role") as string,
      email: (fd.get("email") as string) || undefined,
      phone: (fd.get("phone") as string) || undefined,
    };

    startTransition(async () => {
      const result = isEdit
        ? await updateCaseParty(party!.id, caseId, payload)
        : await addCaseParty(caseId, payload);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(isEdit ? "Party updated" : "Party added");
        setOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Party
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Party" : "Add Party"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="partyName">Name</Label>
              <Input id="partyName" name="name" required defaultValue={party?.name ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partyRole">Role</Label>
              <Select name="role" defaultValue={party?.role ?? "opposing_party"}>
                <SelectTrigger id="partyRole">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="opposing_party">Opposing Party</SelectItem>
                  <SelectItem value="opposing_counsel">Opposing Counsel</SelectItem>
                  <SelectItem value="witness">Witness</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                  <SelectItem value="judge">Judge</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partyEmail">Email</Label>
                <Input id="partyEmail" name="email" type="email" defaultValue={party?.email ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partyPhone">Phone</Label>
                <Input id="partyPhone" name="phone" defaultValue={party?.phone ?? ""} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEdit ? "Update" : "Add Party"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeletePartyButton({ partyId, caseId }: { partyId: string; caseId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Party</AlertDialogTitle>
          <AlertDialogDescription>
            Remove this party from the case?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const result = await deleteCaseParty(partyId, caseId);
                if (result?.error) toast.error(result.error);
                else {
                  toast.success("Party removed");
                  router.refresh();
                }
              });
            }}
          >
            {isPending ? "Removing..." : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ── Team (Assignment) Dialogs ──

interface UserOption {
  id: string;
  name: string | null;
}

interface AssignMemberDialogProps {
  caseId: string;
  users: UserOption[];
}

export function AssignMemberDialog({ caseId, users }: AssignMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      userId: fd.get("userId") as string,
      role: fd.get("role") as string,
    };

    startTransition(async () => {
      const result = await assignCase(caseId, payload);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Team member assigned");
        setOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <UserPlus className="mr-1.5 h-3.5 w-3.5" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Assign Team Member</DialogTitle>
            <DialogDescription>Add an attorney to this case.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userId">Attorney</Label>
              <Select name="userId" required>
                <SelectTrigger id="userId">
                  <SelectValue placeholder="Select attorney..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name || u.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignRole">Role</Label>
              <Select name="role" defaultValue="assigned">
                <SelectTrigger id="assignRole">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="supervising">Supervising</SelectItem>
                  <SelectItem value="of_counsel">Of Counsel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Assigning..." : "Assign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function UnassignButton({ assignmentId, caseId }: { assignmentId: string; caseId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive">
          <UserMinus className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
          <AlertDialogDescription>
            Unassign this attorney from the case?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const result = await unassignCase(assignmentId, caseId);
                if (result?.error) toast.error(result.error);
                else {
                  toast.success("Member removed");
                  router.refresh();
                }
              });
            }}
          >
            {isPending ? "Removing..." : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ── Task Dialogs ──

interface TaskFormProps {
  caseId: string;
  task?: { id: string; title: string; description: string | null; priority: string; status: string; dueDate: Date | null; assignedToName: string | null };
  users?: UserOption[];
  trigger?: React.ReactNode;
}

export function AddTaskDialog({ caseId, task, users = [], trigger }: TaskFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isEdit = !!task;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    if (isEdit) {
      const payload = {
        title: fd.get("title") as string,
        description: (fd.get("description") as string) || undefined,
        priority: fd.get("priority") as string,
        dueDate: (fd.get("dueDate") as string) || undefined,
        assignedTo: ((fd.get("assignedTo") as string) === "__none__" ? null : (fd.get("assignedTo") as string)) || null,
      };
      startTransition(async () => {
        const result = await updateTask(task!.id, payload);
        if (result?.error) toast.error(result.error);
        else {
          toast.success("Task updated");
          setOpen(false);
          router.refresh();
        }
      });
    } else {
      const payload = {
        title: fd.get("title") as string,
        description: (fd.get("description") as string) || undefined,
        priority: fd.get("priority") as string,
        dueDate: (fd.get("dueDate") as string) || undefined,
        caseId,
        assignedTo: ((fd.get("assignedTo") as string) === "__none__" ? undefined : (fd.get("assignedTo") as string)) || undefined,
      };
      startTransition(async () => {
        const result = await createTask(payload);
        if (result?.error) toast.error(result.error);
        else {
          toast.success("Task created");
          setOpen(false);
          router.refresh();
        }
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Task" : "Add Task"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="taskTitle">Title</Label>
              <Input id="taskTitle" name="title" required defaultValue={task?.title ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taskDesc">Description</Label>
              <Textarea id="taskDesc" name="description" rows={3} defaultValue={task?.description ?? ""} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taskPriority">Priority</Label>
                <Select name="priority" defaultValue={task?.priority ?? "medium"}>
                  <SelectTrigger id="taskPriority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="taskDue">Due Date</Label>
                <Input
                  id="taskDue"
                  name="dueDate"
                  type="date"
                  defaultValue={task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""}
                />
              </div>
            </div>
            {users.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="taskAssign">Assign To</Label>
                <Select name="assignedTo" defaultValue="__none__">
                  <SelectTrigger id="taskAssign">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Unassigned</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name || u.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEdit ? "Update" : "Add Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TaskStatusButton({ taskId, status }: { taskId: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const nextStatus = status === "pending" ? "in_progress" : status === "in_progress" ? "completed" : null;
  if (!nextStatus || status === "completed" || status === "cancelled") return null;

  const label = nextStatus === "in_progress" ? "Start" : "Complete";

  return (
    <Button
      size="sm"
      variant="outline"
      className="h-7 text-xs"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await updateTaskStatus(taskId, nextStatus as "pending" | "in_progress" | "completed" | "cancelled");
          if (result?.error) toast.error(result.error);
          else {
            toast.success(`Task ${label.toLowerCase()}ed`);
            router.refresh();
          }
        });
      }}
    >
      {label}
    </Button>
  );
}

export function DeleteTaskButton({ taskId }: { taskId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Task</AlertDialogTitle>
          <AlertDialogDescription>Permanently delete this task?</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const result = await deleteTask(taskId);
                if (result?.error) toast.error(result.error);
                else {
                  toast.success("Task deleted");
                  router.refresh();
                }
              });
            }}
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ── Deadline Dialogs ──

interface DeadlineFormProps {
  caseId: string;
  deadline?: { id: string; title: string; description: string | null; priority: string; dueDate: Date; isStatutory: boolean; completedAt: Date | null };
  users?: UserOption[];
  trigger?: React.ReactNode;
}

export function AddDeadlineDialog({ caseId, deadline, users = [], trigger }: DeadlineFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isEdit = !!deadline;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    if (isEdit) {
      const payload = {
        title: fd.get("title") as string,
        description: (fd.get("description") as string) || undefined,
        priority: fd.get("priority") as string,
        dueDate: fd.get("dueDate") as string,
        isStatutory: fd.get("isStatutory") === "on",
        assignedTo: ((fd.get("assignedTo") as string) === "__none__" ? null : (fd.get("assignedTo") as string)) || null,
      };
      startTransition(async () => {
        const result = await updateDeadline(deadline!.id, payload);
        if (result?.error) toast.error(result.error);
        else {
          toast.success("Deadline updated");
          setOpen(false);
          router.refresh();
        }
      });
    } else {
      const payload = {
        title: fd.get("title") as string,
        description: (fd.get("description") as string) || undefined,
        priority: fd.get("priority") as string,
        dueDate: fd.get("dueDate") as string,
        isStatutory: fd.get("isStatutory") === "on",
        caseId,
        assignedTo: ((fd.get("assignedTo") as string) === "__none__" ? undefined : (fd.get("assignedTo") as string)) || undefined,
      };
      startTransition(async () => {
        const result = await createDeadline(payload);
        if (result?.error) toast.error(result.error);
        else {
          toast.success("Deadline created");
          setOpen(false);
          router.refresh();
        }
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Deadline
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Deadline" : "Add Deadline"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dlTitle">Title</Label>
              <Input id="dlTitle" name="title" required defaultValue={deadline?.title ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dlDesc">Description</Label>
              <Textarea id="dlDesc" name="description" rows={3} defaultValue={deadline?.description ?? ""} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dlPriority">Priority</Label>
                <Select name="priority" defaultValue={deadline?.priority ?? "medium"}>
                  <SelectTrigger id="dlPriority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dlDue">Due Date</Label>
                <Input
                  id="dlDue"
                  name="dueDate"
                  type="date"
                  required
                  defaultValue={deadline?.dueDate ? new Date(deadline.dueDate).toISOString().split("T")[0] : ""}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="isStatutory"
                name="isStatutory"
                defaultChecked={deadline?.isStatutory ?? false}
              />
              <Label htmlFor="isStatutory">Statutory deadline</Label>
            </div>
            {users.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="dlAssign">Assign To</Label>
                <Select name="assignedTo" defaultValue="__none__">
                  <SelectTrigger id="dlAssign">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Unassigned</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name || u.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEdit ? "Update" : "Add Deadline"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CompleteDeadlineButton({ deadlineId }: { deadlineId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      size="sm"
      variant="outline"
      className="h-7 text-xs"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await completeDeadline(deadlineId);
          if (result?.error) toast.error(result.error);
          else {
            toast.success("Deadline completed");
            router.refresh();
          }
        });
      }}
    >
      Complete
    </Button>
  );
}

export function DeleteDeadlineButton({ deadlineId }: { deadlineId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Deadline</AlertDialogTitle>
          <AlertDialogDescription>Permanently delete this deadline?</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const result = await deleteDeadline(deadlineId);
                if (result?.error) toast.error(result.error);
                else {
                  toast.success("Deadline deleted");
                  router.refresh();
                }
              });
            }}
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
