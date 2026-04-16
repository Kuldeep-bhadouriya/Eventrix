"use client";

import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, CalendarDays, Award, User, Bell, LogOut } from "lucide-react";

import { SideNavbar, type SideNavbarItem } from "@/components/ui/side-navbar";

export function DashboardSidebar({
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
    <SideNavbar
      title="Dashboard"
      className={className}
      onNavigate={onNavigate}
      hintTitle="Tip"
      hintText="Use the sidebar to manage your events and profile."
      items={items.map((item) => ({
        ...item,
        active: isActive(item.href),
      }))}
    />
  );
}
