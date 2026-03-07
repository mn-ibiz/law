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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Paperclip, X } from "lucide-react";

const NONE_VALUE = "__none__";

interface MessageFormProps {
  users: { id: string; name: string }[];
  cases: { id: string; caseNumber: string; title: string }[];
}

export function MessageForm({ users, cases }: MessageFormProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [attachment, setAttachment] = useState<{ url: string; name: string } | null>(null);

  const form = useForm<SendMessageInput>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      receiverId: "",
      subject: "",
      body: "",
      caseId: undefined,
      attachmentUrl: undefined,
      attachmentName: undefined,
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

      toast.success("Message sent");
      router.push("/messages");
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Recipient *</Label>
              <Select
                value={form.watch("receiverId")}
                onValueChange={(val) => form.setValue("receiverId", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.receiverId && (
                <p className="text-sm text-destructive">{form.formState.errors.receiverId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Link to Case (optional)</Label>
              <Select
                value={form.watch("caseId") || NONE_VALUE}
                onValueChange={(val) =>
                  form.setValue("caseId", val === NONE_VALUE ? undefined : val)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select case" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>None</SelectItem>
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.caseNumber} - {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input id="subject" {...form.register("subject")} placeholder="Message subject" />
            {form.formState.errors.subject && (
              <p className="text-sm text-destructive">{form.formState.errors.subject.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message *</Label>
            <Textarea
              id="body"
              rows={8}
              {...form.register("body")}
              placeholder="Type your message..."
            />
            {form.formState.errors.body && (
              <p className="text-sm text-destructive">{form.formState.errors.body.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Attachment (optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.txt"
                onChange={handleFileUpload}
                disabled={uploading}
                className="flex-1"
              />
              {uploading && <span className="text-xs text-muted-foreground">Uploading...</span>}
            </div>
            {attachment && (
              <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-sm">
                <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="truncate">{attachment.name}</span>
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

          <div className="flex gap-4">
            <Button type="submit" disabled={form.formState.isSubmitting || uploading}>
              {form.formState.isSubmitting ? "Sending..." : "Send Message"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
