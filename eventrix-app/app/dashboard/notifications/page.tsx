import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Metadata } from "next";

import { authOptions } from "@/lib/auth";
import { getUserNotifications } from "@/lib/dashboard/notifications-queries";
import { NotificationList } from "@/components/dashboard/notifications/NotificationList";

export const metadata: Metadata = {
  title: "Notifications",
};

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=%2Fdashboard%2Fnotifications");

  const initial = await getUserNotifications(session.user.id);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Notifications</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Manage and keep track of updates.
        </p>
      </div>

      <NotificationList initial={initial} />
    </div>
  );
}
