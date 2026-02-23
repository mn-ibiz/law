import { auth } from "@/lib/auth/auth";
import { getNotifications, getUnreadNotificationCount } from "@/lib/queries/notifications";
import { NotificationBell } from "./notification-bell";

export async function NotificationBellWrapper() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [count, notifications] = await Promise.all([
    getUnreadNotificationCount(session.user.id),
    getNotifications(session.user.id),
  ]);

  // Serialize dates for client component
  const serialized = notifications.slice(0, 5).map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    isRead: n.isRead,
    linkUrl: n.linkUrl,
    createdAt: n.createdAt,
  }));

  return <NotificationBell initialCount={count} initialNotifications={serialized} />;
}
