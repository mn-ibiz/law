"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { sendMessageSchema, type SendMessageInput } from "@/lib/validators/messaging";
import { sendMessage } from "@/lib/actions/messaging";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, Paperclip, X } from "lucide-react";

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
  const [uploading, setUploading] = useState(false);
  const [attachment, setAttachment] = useState<{ url: string; name: string } | null>(null);

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

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Upload failed");
        return;
      }
      setAttachment({ url: json.fileUrl, name: file.name });
      form.setValue("attachmentUrl", json.fileUrl);
      form.setValue("attachmentName", file.name);
      toast.success("File attached");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeAttachment() {
    setAttachment(null);
    form.setValue("attachmentUrl", undefined);
    form.setValue("attachmentName", undefined);
  }

  async function onSubmit(data: SendMessageInput) {
    try {
      const result = await sendMessage(data);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Reply sent");
      setAttachment(null);
      form.reset({ ...form.getValues(), body: "", attachmentUrl: undefined, attachmentName: undefined });
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
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="reply-attachment" className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Paperclip className="h-3.5 w-3.5" />
            Attach file
          </Label>
          <Input
            id="reply-attachment"
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.txt"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
          {uploading && <span className="text-xs text-muted-foreground">Uploading...</span>}
        </div>
        {attachment && (
          <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-sm">
            <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="truncate text-xs">{attachment.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-5 w-5 ml-auto"
              onClick={removeAttachment}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={form.formState.isSubmitting || uploading}>
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
