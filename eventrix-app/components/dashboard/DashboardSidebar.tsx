"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, CalendarDays, Award, User, Bell, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href?: string;
  icon: React.ReactNode;
  onClick?: () => void;
};

export function DashboardSidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const items: NavItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: "My Events",
      href: "/dashboard/events",
      icon: <CalendarDays className="h-4 w-4" />,
    },
    {
      label: "Certificates",
      href: "/dashboard/certificates",
      icon: <Award className="h-4 w-4" />,
    },
    {
      label: "Profile",
      href: "/dashboard/profile",
      icon: <User className="h-4 w-4" />,
    },
    {
      label: "Notifications",
      href: "/dashboard/notifications",
      icon: <Bell className="h-4 w-4" />,
    },
    {
      label: "Logout",
      icon: <LogOut className="h-4 w-4" />,
      onClick: async () => {
        await signOut({ redirect: false });
        router.push("/");
      },
    },
  ];

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname?.startsWith(href);
  };

  return (
    <nav
      aria-label="Dashboard navigation"
      className={cn(
        "h-full w-full border-r border-gray-200 bg-white/70 backdrop-blur dark:border-gray-800 dark:bg-gray-950/60",
        className,
      )}
    >
      <div className="flex h-full flex-col p-4">
        <div className="mb-4 px-2">
          <Link href="/dashboard" className="text-sm font-semibold">
            Eventrix
          </Link>
        </div>

        <div className="flex flex-1 flex-col gap-1">
          {items.map((item) => {
            const active = isActive(item.href);

            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-900/60 dark:hover:text-gray-100",
                  )}
                >
                  <span className="text-gray-600 dark:text-gray-300">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            }

            return (
              <Button
                key={item.label}
                variant="ghost"
                className={cn(
                  "h-auto justify-start gap-2 rounded-md px-3 py-2 text-sm",
                  "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-900/60 dark:hover:text-gray-100",
                )}
                onClick={() => {
                  item.onClick?.();
                  onNavigate?.();
                }}
              >
                <span className="text-gray-600 dark:text-gray-300">{item.icon}</span>
                <span>{item.label}</span>
              </Button>
            );
          })}
        </div>

        <div className="mt-4 rounded-md border border-gray-200 bg-white/60 p-3 text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-300">
          <div className="font-medium text-gray-900 dark:text-gray-100">Tip</div>
          <div className="mt-1">Use the sidebar to manage your events and profile.</div>
        </div>
      </div>
    </nav>
  );
}
