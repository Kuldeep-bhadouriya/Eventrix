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
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(100,116,139,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.08)_1px,transparent_1px)] bg-[size:36px_36px] opacity-40 dark:opacity-20"
      />

      <div className="relative flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden w-72 shrink-0 border-r border-slate-200/80 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 lg:block">
          <DashboardSidebar className="sticky top-0 h-screen border-r-0" />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <DashboardHeader unreadCount={unreadCount} className="pt-16 md:pt-14" />

          {/* Content */}
          <main className="min-w-0 flex-1 px-4 py-6 md:px-6 lg:px-10 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
