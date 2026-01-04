import type { Metadata } from "next";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/rbac";
import { UserRole } from "@prisma/client";
import { MetricsCard } from "@/components/organizer/MetricsCard";
import { QuickActionsPanel } from "@/components/organizer/QuickActionsPanel";
import { WelcomeBanner } from "@/components/organizer/dashboard/WelcomeBanner";
import {
  getOrganizerDashboardCharts,
  getOrganizerDashboardStats,
  getOrganizerRecentEvents,
  getOrganizerRecentRegistrations,
} from "@/lib/organizer/dashboard-queries";
import { RegistrationsChart } from "@/components/organizer/dashboard/RegistrationsChart";
import { EventsChart } from "@/components/organizer/dashboard/EventsChart";
import { RegistrationStatusChart } from "@/components/organizer/dashboard/RegistrationStatusChart";
import { RecentEventsTable } from "@/components/organizer/dashboard/RecentEventsTable";
import { RecentRegistrationsTable } from "@/components/organizer/dashboard/RecentRegistrationsTable";

export const metadata: Metadata = {
  title: "Organizer Dashboard",
  description: "Organizer overview with metrics, charts, and recent activity.",
};

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

export default async function OrganizerDashboardPage() {
  const session = await requireAuth(UserRole.ORGANIZER);
  const userId = session.user.id;

  let organizationName = "Your Organization";
  let logoUrl: string | null = null;

  if (isDatabaseAvailable()) {
    const organizer = await prisma.organizer.findUnique({
      where: { userId },
      select: { organizationName: true, logo: true },
    });
    if (organizer?.organizationName) organizationName = organizer.organizationName;
    logoUrl = organizer?.logo ?? null;
  }

  const [stats, charts, recentEvents, recentRegistrations] = await Promise.all([
    getOrganizerDashboardStats(userId),
    getOrganizerDashboardCharts(userId),
    getOrganizerRecentEvents(userId, 5),
    getOrganizerRecentRegistrations(userId, 8),
  ]);

  return (
    <div className="space-y-6">
      <WelcomeBanner organizationName={organizationName} logoUrl={logoUrl} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricsCard label="Total events created" value={stats.totalEventsCreated} />
        <MetricsCard label="Total registrations" value={stats.totalRegistrations} />
        <MetricsCard label="Active events" value={stats.activeEvents} />
        <MetricsCard label="Certificates issued" value={stats.certificatesIssued} />
        <MetricsCard label="Revenue" value={stats.revenue ?? "—"} hint={stats.revenue == null ? "Not enabled" : undefined} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RegistrationsChart data={charts.registrationsOverTime} />
            <EventsChart data={charts.eventsByCategory} />
          </div>
          <RegistrationStatusChart data={charts.registrationStatus} />
        </div>
        <div className="space-y-6">
          <QuickActionsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentEventsTable events={recentEvents} />
        <RecentRegistrationsTable registrations={recentRegistrations} />
      </div>
    </div>
  );
}
