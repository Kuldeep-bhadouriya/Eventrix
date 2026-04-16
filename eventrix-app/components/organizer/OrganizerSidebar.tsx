"use client";

import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  Users,
  Award,
  BarChart3,
  User,
  LogOut,
} from "lucide-react";

import { SideNavbar, type SideNavbarItem } from "@/components/ui/side-navbar";

export function OrganizerSidebar({
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
      href: "/organizer/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: "Events",
      href: "/organizer/events",
      icon: <CalendarDays className="h-4 w-4" />,
    },
    {
      label: "Create Event",
      href: "/organizer/events/create",
      icon: <PlusCircle className="h-4 w-4" />,
    },
    {
      label: "Participants",
      href: "/organizer/participants",
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Certificates",
      href: "/organizer/certificates",
      icon: <Award className="h-4 w-4" />,
    },
    {
      label: "Analytics",
      href: "/organizer/analytics",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      label: "Profile",
      href: "/organizer/profile",
      icon: <User className="h-4 w-4" />,
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
    if (href === "/organizer/dashboard") return pathname === "/organizer/dashboard";
    return pathname?.startsWith(href);
  };

  return (
    <SideNavbar
      title="Organizer"
      className={className}
      onNavigate={onNavigate}
      hintTitle="Organizer"
      hintText="Create events, manage participants, and issue certificates."
      items={items.map((item) => ({
        ...item,
        active: isActive(item.href),
      }))}
    />
  );
}
