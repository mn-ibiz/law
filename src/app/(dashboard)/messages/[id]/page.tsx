import { requireAuth } from "@/lib/auth/get-session";
import { getMessageById, getMessageThread } from "@/lib/queries/messaging";
import { markMessageRead } from "@/lib/actions/messaging";
import { ReplyForm } from "@/components/messages/reply-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, Clock, User, Briefcase, Paperclip } from "lucide-react";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { APP_LOCALE } from "@/lib/constants/locale";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Message Detail",
  description: "View message and conversation thread",
};

export default async function MessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAuth();
  const userId = session.user.id as string;
  const { id } = await params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) notFound();

  const message = await getMessageById(id);
  if (!message) notFound();

  // Only the sender or recipient can view the message
  if (message.senderId !== userId && message.recipientId !== userId) {
    notFound();
  }

  // Mark as read if the current user is the recipient and hasn't read it yet
  if (message.recipientId === userId && message.status !== "read") {
    await markMessageRead(message.id);
  }

  // Get conversation thread between these two users
  const thread = await getMessageThread(message.senderId, message.recipientId);

  // Determine the "other" person for the reply
  const replyToId =
    message.senderId === userId ? message.recipientId : message.senderId;
  const replyToName =
    message.senderId === userId ? message.recipientName : message.senderName;

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        items={[
          { label: "Messages", href: "/messages" },
          { label: message.subject ?? "Message" },
        ]}
      />
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/messages">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Messages
          </Link>
        </Button>
      </div>

      {/* Message Detail */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">
            {message.subject ?? "(no subject)"}
          </CardTitle>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              From: <span className="font-medium text-foreground">{message.senderName}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              To: <span className="font-medium text-foreground">{message.recipientName}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {new Date(message.createdAt).toLocaleString(APP_LOCALE)}
              {" "}
              ({formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })})
            </span>
            {message.caseId && (
              <Link
                href={`/cases/${message.caseId}`}
                className="flex items-center gap-1.5 text-primary hover:underline"
              >
                <Briefcase className="h-3.5 w-3.5" />
                View linked case
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">
            {message.body}
          </div>
          {message.attachmentUrl && (
            <div className="mt-4 pt-4 border-t">
              <a
                href={message.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm text-primary hover:underline"
              >
                <Paperclip className="h-4 w-4" />
                {message.attachmentName || "Attachment"}
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Thread */}
      {thread.length > 1 && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Conversation Thread ({thread.length} messages)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {thread.map((msg, idx) => {
              const isCurrentUser = msg.senderId === userId;
              const isCurrent = msg.id === message.id;

              return (
                <div key={msg.id}>
                  {idx > 0 && <Separator className="mb-4" />}
                  <div
                    className={`rounded-lg p-4 ${
                      isCurrent
                        ? "bg-primary/5 ring-1 ring-primary/20"
                        : isCurrentUser
                        ? "bg-muted/50"
                        : "bg-background"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {isCurrentUser ? "You" : msg.senderName}
                        </span>
                        {msg.status === "read" && !isCurrentUser && (
                          <span className="text-[10px] text-muted-foreground">Read</span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(msg.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    {msg.subject && (
                      <p className="text-xs text-muted-foreground mb-1">
                        {msg.subject}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                    {msg.attachmentUrl && (
                      <a
                        href={msg.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                      >
                        <Paperclip className="h-3 w-3" />
                        {msg.attachmentName || "Attachment"}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Reply Form */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Reply</CardTitle>
        </CardHeader>
        <CardContent>
          <ReplyForm
            recipientId={replyToId}
            recipientName={replyToName}
            originalSubject={message.subject ?? ""}
            caseId={message.caseId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
