import { requireRole, requireOrg } from "@/lib/auth/get-session";
import { getPortalMessages } from "@/lib/queries/portal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { APP_LOCALE } from "@/lib/constants/locale";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages",
  description: "View messages from your legal team",
};

export default async function PortalMessagesPage() {
  const session = await requireRole("client");
  const { organizationId } = await requireOrg();
  const messageList = await getPortalMessages(organizationId, session.user.id as string);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">
          View messages from your legal team.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
        </CardHeader>
        <CardContent>
          {messageList.length === 0 ? (
            <p className="text-sm text-muted-foreground">No messages yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messageList.map((msg) => (
                  <TableRow key={msg.id}>
                    <TableCell className="font-medium">
                      {msg.subject ?? "(No subject)"}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {msg.body}
                    </TableCell>
                    <TableCell>
                      {new Date(msg.createdAt).toLocaleDateString(APP_LOCALE)}
                    </TableCell>
                    <TableCell>
                      {msg.readAt ? (
                        <Badge variant="secondary">Read</Badge>
                      ) : (
                        <Badge variant="default">New</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
