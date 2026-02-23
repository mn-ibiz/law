"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationTypeBadge } from "@/components/shared/status-badges";
import { EmptyState } from "@/components/shared/empty-state";
import { markNotificationsRead } from "@/lib/actions/messaging";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt: Date | null;
  linkUrl: string | null;
  createdAt: Date;
}

interface NotificationListProps {
  notifications: NotificationItem[];
}

export function NotificationList({ notifications }: NotificationListProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isMarking, setIsMarking] = useState(false);

  const filtered =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((n) => n.id)));
    }
  }

  async function handleMarkSelectedRead() {
    const ids = Array.from(selected).filter((id) => {
      const n = notifications.find((notif) => notif.id === id);
      return n && !n.isRead;
    });

    if (ids.length === 0) return;

    setIsMarking(true);
    try {
      await markNotificationsRead(ids);
      setSelected(new Set());
      router.refresh();
    } finally {
      setIsMarking(false);
    }
  }

  async function handleClickNotification(n: NotificationItem) {
    if (!n.isRead) {
      await markNotificationsRead([n.id]);
      router.refresh();
    }
    if (n.linkUrl) {
      router.push(n.linkUrl);
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            All Notifications
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-bold text-destructive-foreground">
                {unreadCount}
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Filter toggle */}
            <div className="flex items-center rounded-md border">
              <Button
                variant={filter === "all" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 rounded-r-none text-xs"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "unread" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 rounded-l-none text-xs"
                onClick={() => setFilter("unread")}
              >
                <Filter className="h-3 w-3 mr-1" />
                Unread ({unreadCount})
              </Button>
            </div>

            {/* Bulk actions */}
            {selected.size > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={isMarking}
                onClick={handleMarkSelectedRead}
              >
                <Check className="h-3 w-3 mr-1" />
                Mark {selected.size} as read
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={filter === "unread" ? "No unread notifications" : "No notifications"}
            description={
              filter === "unread"
                ? "You're all caught up! No unread notifications."
                : "You don't have any notifications yet."
            }
          />
        ) : (
          <div className="space-y-1">
            {/* Select all */}
            <div className="flex items-center gap-3 px-4 py-2 border-b">
              <Checkbox
                checked={selected.size === filtered.length && filtered.length > 0}
                onCheckedChange={toggleSelectAll}
                aria-label="Select all notifications"
              />
              <span className="text-xs text-muted-foreground">
                {selected.size > 0
                  ? `${selected.size} selected`
                  : `${filtered.length} notification${filtered.length !== 1 ? "s" : ""}`}
              </span>
            </div>

            {filtered.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 rounded-md border p-4 transition-colors hover:bg-muted/50 ${
                  !n.isRead ? "bg-primary/[0.03] border-primary/10" : ""
                }`}
              >
                <Checkbox
                  checked={selected.has(n.id)}
                  onCheckedChange={() => toggleSelect(n.id)}
                  aria-label={`Select notification: ${n.title}`}
                  className="mt-0.5"
                />
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => handleClickNotification(n)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <NotificationTypeBadge type={n.type} />
                      <span className={`text-sm ${!n.isRead ? "font-semibold" : "font-medium"}`}>
                        {n.title}
                      </span>
                      {!n.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {formatDistanceToNow(new Date(n.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  {n.linkUrl && (
                    <Link
                      href={n.linkUrl}
                      className="text-xs text-primary hover:underline mt-1 inline-block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View details
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
