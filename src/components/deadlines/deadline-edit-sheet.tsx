"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "@/hooks/use-action";
import { updateDeadline } from "@/lib/actions/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface DeadlineData {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  dueDate: Date;
  isStatutory: boolean;
}

interface DeadlineEditSheetProps {
  deadline: DeadlineData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeadlineEditSheet({
  deadline,
  open,
  onOpenChange,
}: DeadlineEditSheetProps) {
  const router = useRouter();
  const [title, setTitle] = useState(deadline.title);
  const [description, setDescription] = useState(deadline.description ?? "");
  const [priority, setPriority] = useState(deadline.priority);
  const [dueDate, setDueDate] = useState(
    new Date(deadline.dueDate).toISOString().split("T")[0]
  );
  const [isStatutory, setIsStatutory] = useState(deadline.isStatutory);

  const { execute, isPending } = useAction(
    (data: { id: string; payload: Record<string, unknown> }) =>
      updateDeadline(data.id, data.payload),
    {
      successMessage: "Deadline updated",
      onSuccess: () => {
        onOpenChange(false);
        router.refresh();
      },
    }
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    execute({
      id: deadline.id,
      payload: {
        title,
        description: description || undefined,
        priority,
        dueDate: dueDate || undefined,
        isStatutory,
      },
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Deadline</SheetTitle>
          <SheetDescription>Update the deadline details below.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 px-4">
          <div className="space-y-2">
            <Label htmlFor="edit-deadline-title">Title</Label>
            <Input
              id="edit-deadline-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-deadline-description">Description</Label>
            <Textarea
              id="edit-deadline-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="w-full">
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
            <Label htmlFor="edit-deadline-due-date">Due Date</Label>
            <Input
              id="edit-deadline-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-deadline-statutory"
              checked={isStatutory}
              onCheckedChange={(checked) => setIsStatutory(checked === true)}
            />
            <Label
              htmlFor="edit-deadline-statutory"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              Statutory Deadline
            </Label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
