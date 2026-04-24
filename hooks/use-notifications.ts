"use client";

import * as React from "react";

export interface NotificationItem {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  reservationId?: string | null;
  listingId?: string | null;
  createdAt: string;
}

const POLL_INTERVAL = 15_000; // 15 seconds

const useNotifications = () => {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);

  const fetchNotifications = React.useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data: NotificationItem[] = await res.json();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch {
      // silently ignore network errors
    }
  }, []);

  const markAllRead = React.useCallback(async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silently ignore
    }
  }, []);

  React.useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  return { notifications, unreadCount, markAllRead };
};

export default useNotifications;
