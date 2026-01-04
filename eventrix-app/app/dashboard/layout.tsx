import type { Metadata } from "next";
import { getServerSession } from "next-auth";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Dashboard",
};

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let unreadCount = 0;

  if (isDatabaseAvailable()) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (userId) {
      unreadCount = await prisma.notification.count({ where: { userId, read: false } });
    }
  }

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 lg:block">
          <DashboardSidebar />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <DashboardHeader unreadCount={unreadCount} className="pt-16 md:pt-14" />

          {/* Content */}
          <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
