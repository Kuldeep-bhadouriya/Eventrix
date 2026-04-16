import type { Metadata } from "next";

import { requireAuth } from "@/lib/rbac";
import { UserRole } from "@prisma/client";
import { ParticipantsManager } from "@/components/organizer/participants/ParticipantsManager";

export const metadata: Metadata = {
  title: "Event Participants",
  description: "Manage participants for a specific event.",
};

export default async function OrganizerEventParticipantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth(UserRole.ORGANIZER);
  const { id } = await params;

  return <ParticipantsManager eventId={id} />;
}
