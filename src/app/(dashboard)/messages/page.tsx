import { requireOrg } from "@/lib/auth/get-session";
import { getMessages, getSentMessages } from "@/lib/queries/messaging";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Mail } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { APP_LOCALE } from "@/lib/constants/locale";
import { EmptyState } from "@/components/shared/empty-state";
import { DeleteMessageButton } from "@/components/messages/delete-message-button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages",
  description: "Internal messaging and communication",
};

const capsule =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-none whitespace-nowrap";

const messageStatusStyles: Record<string, string> = {
  sent: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  delivered: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20",
  read: "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/20",
};

export default async function MessagesPage() {
  const { session, organizationId } = await requireOrg();
  const userId = session.user.id as string;
  const [inbox, sent] = await Promise.all([
    getMessages(organizationId, userId),
    getSentMessages(organizationId, userId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">Internal secure messaging.</p>
        </div>
        <Button size="sm" asChild>
          <Link href="/messages/new">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Compose
          </Link>
        </Button>
      </div>
      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox">Inbox ({inbox.length})</TabsTrigger>
          <TabsTrigger value="sent">Sent ({sent.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="inbox">
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              {inbox.length === 0 ? (
                <EmptyState
                  icon={Mail}
                  title="No messages"
                  description="Your inbox is empty. Compose a new message to get started."
                  actionLabel="Compose"
                  actionHref="/messages/new"
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">From</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Subject</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inbox.map((m) => {
                      const isUnread = m.status !== "read";
                      return (
                        <TableRow
                          key={m.id}
                          className={`transition-colors hover:bg-muted/50 ${isUnread ? "bg-primary/[0.03]" : ""}`}
                        >
                          <TableCell className={isUnread ? "font-semibold" : "font-medium"}>
                            <Link href={`/messages/${m.id}`} className="hover:underline">
                              {m.senderName}
                            </Link>
                          </TableCell>
                          <TableCell className={isUnread ? "font-semibold" : ""}>
                            <Link href={`/messages/${m.id}`} className="hover:underline">
                              {m.subject ?? "(no subject)"}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <span className={`${capsule} ${messageStatusStyles[m.status] ?? messageStatusStyles.sent}`}>
                              {m.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(m.createdAt).toLocaleString(APP_LOCALE)}
                          </TableCell>
                          <TableCell>
                            <DeleteMessageButton messageId={m.id} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sent">
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              {sent.length === 0 ? (
                <EmptyState
                  icon={Mail}
                  title="No sent messages"
                  description="You haven't sent any messages yet."
                  actionLabel="Compose"
                  actionHref="/messages/new"
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">To</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Subject</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sent.map((m) => (
                      <TableRow key={m.id} className="transition-colors hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <Link href={`/messages/${m.id}`} className="hover:underline">
                            {m.receiverName}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link href={`/messages/${m.id}`} className="hover:underline">
                            {m.subject ?? "(no subject)"}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(m.createdAt).toLocaleString(APP_LOCALE)}
                        </TableCell>
                        <TableCell>
                          <DeleteMessageButton messageId={m.id} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
