import type { Metadata } from "next";

import { requireAuth } from "@/lib/rbac";
import { UserRole } from "@prisma/client";
import { CertificatesManager } from "@/components/organizer/certificates/CertificatesManager";

export const metadata: Metadata = {
  title: "Organizer Certificates",
  description: "Manage certificate templates and issued certificates.",
};

export default async function OrganizerCertificatesPage() {
  await requireAuth(UserRole.ORGANIZER);
  return <CertificatesManager />;
}
