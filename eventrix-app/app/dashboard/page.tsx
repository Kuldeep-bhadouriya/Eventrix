import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { StatCard } from "@/components/dashboard/StatCard";
import { UpcomingEventsWidget } from "@/components/dashboard/UpcomingEventsWidget";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { QuickActions } from "@/components/dashboard/QuickActions";
import {
  getDashboardActivity,
  getDashboardStats,
  getDashboardUpcoming,
} from "@/lib/dashboard/dashboard-queries";

export default async function DashboardHomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=%2Fdashboard");
  }

  const userId = session.user.id;

  const [stats, upcoming, activity] = await Promise.all([
    getDashboardStats(userId),
    getDashboardUpcoming(userId, 5),
    getDashboardActivity(userId, 10),
  ]);

  return (
    <div className="space-y-6">
      <WelcomeBanner name={session.user.name} />

      <DashboardSection title="Overview">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total registered events" value={stats.totalRegisteredEvents} />
          <StatCard label="Upcoming events" value={stats.upcomingEvents} />
          <StatCard label="Completed events" value={stats.completedEvents} />
          <StatCard label="Certificates earned" value={stats.certificatesEarned} />
        </div>
      </DashboardSection>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <UpcomingEventsWidget events={upcoming} />
          <ActivityTimeline items={activity} />
        </div>
        <div className="space-y-6">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
