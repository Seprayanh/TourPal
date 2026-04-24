"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BsBell, BsBellFill } from "react-icons/bs";
import { formatDistanceToNow } from "date-fns";

import { SafeUser } from "@/types";
import useNotifications, { NotificationItem } from "@/hooks/use-notifications";

interface NotificationBellProps {
  currentUser?: SafeUser | null;
}

/** Returns the destination URL and link label for a given notification. */
function getNotificationLink(
  notif: NotificationItem,
  isGuide: boolean
): { href: string; label: string } | null {
  const { type, listingId } = notif;

  if (type === "NEW_BOOKING") {
    return { href: "/guide", label: "查看工单 →" };
  }
  if (type === "TOUR_COMPLETED" && listingId) {
    return { href: `/listings/${listingId}?review=1`, label: "Leave feedback →" };
  }
  if (type === "RESERVATION_ACCEPTED" || type === "TOUR_STARTED" || type === "RESERVATION_CANCELLED") {
    return { href: "/trips", label: "View my trips →" };
  }
  // Fallback by role
  if (isGuide) return { href: "/guide", label: "查看详情 →" };
  return { href: "/trips", label: "View details →" };
}

const NotificationBell: React.FC<NotificationBellProps> = ({ currentUser }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const ref = React.useRef<HTMLDivElement>(null);
  const isGuide = currentUser?.role === "GUIDE";

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!currentUser) return null;

  const handleOpen = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen && unreadCount > 0) {
      markAllRead();
    }
  };

  const displayed = notifications.slice(0, 10);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-full hover:bg-neutral-100 transition"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <BsBellFill size={20} className="text-neutral-700" />
        ) : (
          <BsBell size={20} className="text-neutral-500" />
        )}

        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold px-0.5">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-neutral-200 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100">
            <p className="font-semibold text-sm text-neutral-700">
              {isGuide ? "消息通知" : "Notifications"}
            </p>
          </div>

          {displayed.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-neutral-400">
              {isGuide ? "暂无通知" : "No notifications yet"}
            </div>
          ) : (
            <ul className="max-h-96 overflow-y-auto divide-y divide-neutral-100">
              {displayed.map((notif) => {
                const link = getNotificationLink(notif, isGuide);
                return (
                  <li
                    key={notif.id}
                    className={`px-4 py-3 text-sm ${notif.isRead ? "bg-white" : "bg-rose-50"}`}
                  >
                    <p className="text-neutral-700 leading-snug">{notif.message}</p>
                    <p className="text-neutral-400 text-xs mt-1">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </p>
                    {link && (
                      <a
                        href={link.href}
                        onClick={(e) => {
                          e.preventDefault();
                          setIsOpen(false);
                          router.push(link.href);
                        }}
                        className="text-xs text-rose-500 hover:underline mt-1.5 inline-block font-medium"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
