import type { Metadata } from "next";

import { requireAuth } from "@/lib/rbac";
import { UserRole } from "@prisma/client";
import { EventAnalyticsDashboard } from "@/components/organizer/analytics/EventAnalyticsDashboard";

export const metadata: Metadata = {
  title: "Event Analytics",
  description: "Detailed analytics for an organizer event.",
};

export default async function OrganizerEventAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth(UserRole.ORGANIZER);
  const { id } = await params;

  return <EventAnalyticsDashboard eventId={id} />;
}
