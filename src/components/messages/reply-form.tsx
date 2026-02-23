"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { sendMessageSchema, type SendMessageInput } from "@/lib/validators/messaging";
import { sendMessage } from "@/lib/actions/messaging";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";

interface ReplyFormProps {
  recipientId: string;
  recipientName: string;
  originalSubject: string;
  caseId?: string | null;
}

export function ReplyForm({
  recipientId,
  recipientName,
  originalSubject,
  caseId,
}: ReplyFormProps) {
  const router = useRouter();

  const replySubject = originalSubject?.startsWith("Re: ")
    ? originalSubject
    : `Re: ${originalSubject ?? "(no subject)"}`;

  const form = useForm<SendMessageInput>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      receiverId: recipientId,
      subject: replySubject,
      body: "",
      caseId: caseId ?? undefined,
    },
  });

  async function onSubmit(data: SendMessageInput) {
    try {
      const result = await sendMessage(data);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Reply sent");
      form.reset({ ...form.getValues(), body: "" });
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reply-body" className="text-sm font-medium">
          Reply to {recipientName}
        </Label>
        <Textarea
          id="reply-body"
          rows={4}
          {...form.register("body")}
          placeholder="Type your reply..."
          className="resize-none"
        />
        {form.formState.errors.body && (
          <p className="text-sm text-destructive">
            {form.formState.errors.body.message}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
          <Send className="h-3.5 w-3.5 mr-1.5" />
          {form.formState.isSubmitting ? "Sending..." : "Send Reply"}
        </Button>
        <span className="text-xs text-muted-foreground">
          Subject: {replySubject}
        </span>
      </div>
    </form>
  );
}
