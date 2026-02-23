"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationTypeBadge } from "@/components/shared/status-badges";
import { markNotificationsRead } from "@/lib/actions/messaging";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  linkUrl: string | null;
  createdAt: Date;
}

interface NotificationBellProps {
  initialCount: number;
  initialNotifications: NotificationItem[];
}

export function NotificationBell({
  initialCount,
  initialNotifications,
}: NotificationBellProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const count = initialCount;
  const notifications = initialNotifications;

  async function handleMarkAllRead() {
    const unreadIds = notifications
      .filter((n) => !n.isRead)
      .map((n) => n.id);

    if (unreadIds.length === 0) return;

    setIsMarking(true);
    try {
      await markNotificationsRead(unreadIds);
      router.refresh();
    } finally {
      setIsMarking(false);
    }
  }

  async function handleMarkOneRead(notificationId: string) {
    await markNotificationsRead([notificationId]);
    router.refresh();
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9"
          aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ""}`}
        >
          <Bell className="h-4 w-4" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="text-sm font-semibold">Notifications</h4>
          {count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs"
              disabled={isMarking}
              onClick={handleMarkAllRead}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="divide-y">
              {notifications.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  className={`flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50 cursor-pointer ${
                    !n.isRead ? "bg-primary/[0.03]" : ""
                  }`}
                  onClick={() => {
                    if (!n.isRead) handleMarkOneRead(n.id);
                    if (n.linkUrl) {
                      setOpen(false);
                      router.push(n.linkUrl);
                    }
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <NotificationTypeBadge type={n.type} />
                      {!n.isRead && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className={`text-sm truncate ${!n.isRead ? "font-medium" : ""}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(n.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-xs"
            asChild
            onClick={() => setOpen(false)}
          >
            <Link href="/notifications">
              <ExternalLink className="h-3 w-3 mr-1.5" />
              View all notifications
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
