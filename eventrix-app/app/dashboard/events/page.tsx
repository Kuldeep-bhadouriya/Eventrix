import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Metadata } from "next";

import { authOptions } from "@/lib/auth";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { RegisteredEventsPanel } from "@/components/dashboard/events/RegisteredEventsPanel";

export const metadata: Metadata = {
  title: "My Events",
};

export default async function DashboardEventsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=%2Fdashboard%2Fevents");

  return (
    <div className="space-y-4">
      <DashboardPageHeader
        eyebrow="Events"
        title="My Events"
        description="Track registrations, view event passes, and manage attendance without jumping across multiple pages."
      />

      <RegisteredEventsPanel />
    </div>
  );
}
