import type { Metadata } from "next";

import { requireAuth } from "@/lib/rbac";
import { UserRole } from "@prisma/client";
import { OrganizerProfileForm } from "@/components/organizer/profile/OrganizerProfileForm";

export const metadata: Metadata = {
  title: "Organizer Profile",
  description: "Manage organization profile and verification.",
};

export default async function OrganizerProfilePage() {
  await requireAuth(UserRole.ORGANIZER);
  return <OrganizerProfileForm />;
}
