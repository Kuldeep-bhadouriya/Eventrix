"use client";

import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BarChart3,
  Flag,
  Settings,
  LogOut,
} from "lucide-react";

import { SideNavbar, type SideNavbarItem } from "@/components/ui/side-navbar";

export function AdminSidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const items: SideNavbarItem[] = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Events",
      href: "/admin/events",
      icon: <CalendarDays className="h-4 w-4" />,
    },
    {
      label: "Analytics",
      href: "/admin/analytics",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      label: "Reports",
      href: "/admin/reports",
      icon: <Flag className="h-4 w-4" />,
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-4 w-4" />,
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
    if (href === "/admin") return pathname === "/admin" || pathname === "/admin/dashboard";
    return pathname?.startsWith(href);
  };

  return (
    <SideNavbar
      title="Admin"
      className={className}
      onNavigate={onNavigate}
      hintTitle="Admin"
      hintText="Manage users, events, and system settings."
      items={items.map((item) => ({
        ...item,
        active: isActive(item.href),
      }))}
    />
  );
}
