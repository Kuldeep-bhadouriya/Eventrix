import type { Metadata } from "next";

import { requireAuth } from "@/lib/rbac";
import { UserRole } from "@prisma/client";
import { CreateEventForm } from "@/components/organizer/events/CreateEventForm";

export const metadata: Metadata = {
  title: "Create Event",
  description: "Create a new event with a multi-step wizard.",
};

export default async function OrganizerCreateEventPage() {
  await requireAuth(UserRole.ORGANIZER);
  return <CreateEventForm mode="create" />;
}
