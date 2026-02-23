"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteMessage } from "@/lib/actions/messaging";
import { useAction } from "@/hooks/use-action";

interface DeleteMessageButtonProps {
  messageId: string;
}

export function DeleteMessageButton({ messageId }: DeleteMessageButtonProps) {
  const router = useRouter();

  const { execute, isPending } = useAction(deleteMessage, {
    successMessage: "Message deleted",
    onSuccess: () => {
      router.refresh();
    },
  });

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 text-muted-foreground hover:text-destructive"
      disabled={isPending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        execute(messageId);
      }}
    >
      <Trash2 className="h-3.5 w-3.5" />
      <span className="sr-only">Delete message</span>
    </Button>
  );
}
