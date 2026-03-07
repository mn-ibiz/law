/**
 * Notification queries — re-exported from messaging.ts for convenience.
 * All notification query logic lives in the messaging query module.
 */
import { getNotifications as _getNotifications, getUnreadNotificationCount as _getUnreadNotificationCount } from "./messaging";

export async function getNotifications(organizationId: string, userId: string, unreadOnly?: boolean) {
  return _getNotifications(organizationId, userId, unreadOnly);
}

export async function getUnreadNotificationCount(organizationId: string, userId: string): Promise<number> {
  return _getUnreadNotificationCount(organizationId, userId);
}
