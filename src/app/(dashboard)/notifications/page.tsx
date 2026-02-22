import { requireAuth } from "@/lib/auth/get-session";
import { getNotifications } from "@/lib/queries/messaging";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { APP_LOCALE } from "@/lib/constants/locale";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications",
  description: "View system notifications and alerts",
};

const typeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  info: "outline",
  warning: "default",
  deadline: "destructive",
  assignment: "default",
  billing: "outline",
  system: "secondary",
};

export default async function NotificationsPage() {
  const session = await requireAuth();
  const notificationList = await getNotifications(session.user.id as string);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">Your alerts and updates.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            All Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notificationList.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notifications.</p>
          ) : (
            <div className="space-y-3">
              {notificationList.map((n) => (
                <div
                  key={n.id}
                  className={`rounded-md border p-4 ${!n.isRead ? "bg-muted/50" : ""}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={typeVariant[n.type] ?? "secondary"} className="capitalize">
                        {n.type}
                      </Badge>
                      <span className="font-medium text-sm">{n.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString(APP_LOCALE)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
