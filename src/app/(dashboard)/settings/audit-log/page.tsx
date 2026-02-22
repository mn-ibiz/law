import { requireAdmin } from "@/lib/auth/get-session";
import { db } from "@/lib/db";
import { auditLog } from "@/lib/db/schema/settings";
import { users } from "@/lib/db/schema/auth";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default async function AuditLogPage() {
  await requireAdmin();

  const logs = await db
    .select({
      id: auditLog.id,
      action: auditLog.action,
      entityType: auditLog.entityType,
      entityId: auditLog.entityId,
      createdAt: auditLog.createdAt,
      userName: users.name,
    })
    .from(auditLog)
    .leftJoin(users, eq(auditLog.userId, users.id))
    .orderBy(desc(auditLog.createdAt))
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-muted-foreground">System activity and audit trail.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No audit entries.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Entity ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs">{new Date(log.createdAt).toLocaleString("en-KE")}</TableCell>
                    <TableCell>{log.userName ?? "System"}</TableCell>
                    <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                    <TableCell className="capitalize">{log.entityType.replace("_", " ")}</TableCell>
                    <TableCell className="font-mono text-xs">{log.entityId?.slice(0, 8)}...</TableCell>
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
