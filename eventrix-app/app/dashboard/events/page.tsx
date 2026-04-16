import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Metadata } from "next";

import { authOptions } from "@/lib/auth";
import { RegisteredEventsPanel } from "@/components/dashboard/events/RegisteredEventsPanel";

export const metadata: Metadata = {
  title: "My Events",
};

export default async function DashboardEventsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=%2Fdashboard%2Fevents");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">My Events</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Track your registrations, view passes, and manage attendance.
        </p>
      </div>

      <RegisteredEventsPanel />
    </div>
  );
}
