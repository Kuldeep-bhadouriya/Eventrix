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
        "sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <MobileMenu />
          <Breadcrumbs className="min-w-0" />
        </div>

        <div className="flex items-center gap-1">
          <NotificationBell unreadCount={unreadCount} />
          <UserMenu
            email={isLoading ? "Loading..." : (user?.email ?? null)}
          />
        </div>
      </div>
    </header>
  );
}
