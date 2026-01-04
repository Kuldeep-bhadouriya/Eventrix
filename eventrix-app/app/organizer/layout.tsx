import type { Metadata } from "next";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/rbac";
import { UserRole } from "@prisma/client";
import { OrganizerHeader } from "@/components/organizer/OrganizerHeader";
import { OrganizerSidebar } from "@/components/organizer/OrganizerSidebar";

export const metadata: Metadata = {
  title: "Organizer",
};

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

export default async function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth(UserRole.ORGANIZER);

  let unreadCount = 0;
  if (isDatabaseAvailable() && session.user?.id) {
    unreadCount = await prisma.notification.count({
      where: { userId: session.user.id, read: false },
    });
  }

  const roleLabel = "Organizer";

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 lg:block">
          <OrganizerSidebar />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <OrganizerHeader unreadCount={unreadCount} roleLabel={roleLabel} className="pt-16 md:pt-14" />
          <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
