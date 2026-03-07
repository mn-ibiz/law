import { requireOrg } from "@/lib/auth/get-session";
import { getUsers } from "@/lib/queries/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleBadge, ActiveBadge } from "@/components/shared/status-badges";
import { UserActions } from "@/components/settings/user-actions";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { APP_LOCALE } from "@/lib/constants/locale";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Management",
  description: "Manage user accounts and roles",
};

export default async function UsersPage() {
  const { session, organizationId } = await requireOrg();
  const userList = await getUsers(organizationId);
  const currentUserId = session.user.id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Manage system users, roles, and account status.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>All Users</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Role</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Created</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userList.map((u) => (
                <TableRow key={u.id} className="transition-colors hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {u.name}
                    {u.id === currentUserId && (
                      <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                    )}
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <RoleBadge role={u.role} />
                  </TableCell>
                  <TableCell>
                    <ActiveBadge active={u.isActive} />
                  </TableCell>
                  <TableCell>{new Date(u.createdAt).toLocaleDateString(APP_LOCALE)}</TableCell>
                  <TableCell>
                    <UserActions
                      userId={u.id}
                      currentRole={u.role}
                      isActive={u.isActive}
                      isSelf={u.id === currentUserId}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
