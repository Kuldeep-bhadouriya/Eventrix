"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NotificationBell({
  unreadCount = 0,
  href = "/organizer/notifications",
  className,
}: {
  unreadCount?: number;
  href?: string;
  className?: string;
}) {
  const showBadge = unreadCount > 0;

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className={cn("relative", className)}
      aria-label="Notifications"
    >
      <Link href={href}>
        <Bell className="h-5 w-5" />
        {showBadge && (
          <span
            className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-white"
            aria-label={`${unreadCount} unread notifications`}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>
    </Button>
  );
}
