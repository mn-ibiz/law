import { requireOrg } from "@/lib/auth/get-session";
import { getNotifications } from "@/lib/queries/notifications";
import { NotificationList } from "@/components/notifications/notification-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications",
  description: "View system notifications and alerts",
};

export default async function NotificationsPage() {
  const { session, organizationId } = await requireOrg();
  const notificationList = await getNotifications(organizationId, session.user.id as string);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">Your alerts and updates.</p>
      </div>
      <NotificationList notifications={notificationList} />
    </div>
  );
}
