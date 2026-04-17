import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Metadata } from "next";

import { authOptions } from "@/lib/auth";
import { getUserNotifications } from "@/lib/dashboard/notifications-queries";
import { NotificationList } from "@/components/dashboard/notifications/NotificationList";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";

export const metadata: Metadata = {
  title: "Notifications",
};

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=%2Fdashboard%2Fnotifications");

  const initial = await getUserNotifications(session.user.id);

  return (
    <div className="space-y-4">
      <DashboardPageHeader
        eyebrow="Updates"
        title="Notifications"
        description="Review platform updates and control read status with cleaner filtering and actions."
      />

      <NotificationList initial={initial} />
    </div>
  );
}
