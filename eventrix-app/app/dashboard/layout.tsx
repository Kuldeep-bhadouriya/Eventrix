import type { Metadata } from "next";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 lg:block">
          <DashboardSidebar />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <DashboardHeader unreadCount={0} className="pt-16 md:pt-14" />

          {/* Content */}
          <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
