"use client";

import { Breadcrumbs } from "@/components/organizer/Breadcrumbs";
import { MobileMenu } from "@/components/organizer/MobileMenu";
import { NotificationBell } from "@/components/organizer/NotificationBell";
import { OrganizerMenu } from "@/components/organizer/OrganizerMenu";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function OrganizerHeader({
  className,
  unreadCount = 0,
  roleLabel = "Organizer",
}: {
  className?: string;
  unreadCount?: number;
  roleLabel?: string;
}) {
  const { user, isLoading } = useAuth();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-gray-200 bg-white/70 backdrop-blur dark:border-gray-800 dark:bg-gray-950/60",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <MobileMenu />
          <Breadcrumbs className="min-w-0" />
        </div>

        <div className="flex items-center gap-1">
          <NotificationBell unreadCount={unreadCount} />
          <OrganizerMenu
            email={isLoading ? "Loading..." : (user?.email ?? null)}
            roleLabel={roleLabel}
            showStudentSwitch={Boolean(user)}
          />
        </div>
      </div>
    </header>
  );
}
