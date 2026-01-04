import type { Metadata } from "next";

import { requireAuth } from "@/lib/rbac";
import { UserRole } from "@prisma/client";
import { EventsManager } from "@/components/organizer/events/EventsManager";

export const metadata: Metadata = {
  title: "Manage Events",
  description: "View, filter, and manage your events.",
};

export default async function OrganizerEventsPage() {
  await requireAuth(UserRole.ORGANIZER);
  return <EventsManager />;
}
