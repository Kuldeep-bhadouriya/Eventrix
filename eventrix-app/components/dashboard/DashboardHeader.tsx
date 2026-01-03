"use client";

import { MobileMenu } from "@/components/dashboard/MobileMenu";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { UserMenu } from "@/components/dashboard/UserMenu";
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function DashboardHeader({
  className,
  unreadCount = 0,
}: {
  className?: string;
  unreadCount?: number;
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
          <UserMenu
            name={isLoading ? "Loading..." : (user?.name ?? null)}
            email={user?.email ?? null}
            imageUrl={user?.image ?? null}
          />
        </div>
      </div>
    </header>
  );
}
