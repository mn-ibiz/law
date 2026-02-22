import { requireAuth } from "@/lib/auth/get-session";
import { getMessages, getSentMessages } from "@/lib/queries/messaging";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default async function MessagesPage() {
  const session = await requireAuth();
  const userId = session.user.id as string;
  const [inbox, sent] = await Promise.all([
    getMessages(userId),
    getSentMessages(userId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">Internal secure messaging.</p>
      </div>
      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox">Inbox ({inbox.length})</TabsTrigger>
          <TabsTrigger value="sent">Sent ({sent.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="inbox">
          <Card>
            <CardContent className="pt-6">
              {inbox.length === 0 ? (
                <p className="text-sm text-muted-foreground">No messages.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>From</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inbox.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{m.senderName}</TableCell>
                        <TableCell>{m.subject ?? "(no subject)"}</TableCell>
                        <TableCell><Badge variant="outline">{m.status}</Badge></TableCell>
                        <TableCell>{new Date(m.createdAt).toLocaleString("en-KE")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sent">
          <Card>
            <CardContent className="pt-6">
              {sent.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sent messages.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>To</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sent.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{m.receiverName}</TableCell>
                        <TableCell>{m.subject ?? "(no subject)"}</TableCell>
                        <TableCell>{new Date(m.createdAt).toLocaleString("en-KE")}</TableCell>
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
