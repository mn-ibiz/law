import { requireRole } from "@/lib/auth/get-session";
import { getUserById } from "@/lib/queries/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_LOCALE } from "@/lib/constants/locale";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Your account information",
};

export default async function PortalProfilePage() {
  const session = await requireRole("client");
  const user = await getUserById(session.user.id as string);

  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          Your account information.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Name</dt>
              <dd className="text-sm mt-1">{user.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Email</dt>
              <dd className="text-sm mt-1">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
              <dd className="text-sm mt-1">{user.phone ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Role</dt>
              <dd className="text-sm mt-1">
                <Badge variant="outline" className="capitalize">{user.role}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Status</dt>
              <dd className="text-sm mt-1">
                <Badge variant={user.isActive ? "default" : "secondary"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Member Since</dt>
              <dd className="text-sm mt-1">
                {new Date(user.createdAt).toLocaleDateString(APP_LOCALE)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
