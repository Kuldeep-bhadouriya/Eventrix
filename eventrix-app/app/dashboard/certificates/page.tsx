import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Metadata } from "next";

import { authOptions } from "@/lib/auth";
import { getUserCertificates } from "@/lib/dashboard/certificates-queries";
import { CertificateGrid } from "@/components/dashboard/certificates/CertificateGrid";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";

export const metadata: Metadata = {
  title: "Certificates",
};

export default async function CertificatesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=%2Fdashboard%2Fcertificates");

  const certificates = await getUserCertificates(session.user.id);

  return (
    <div className="space-y-4">
      <DashboardPageHeader
        eyebrow="Achievements"
        title="Certificates"
        description="View, download, and share your earned certificates in one organized place."
      />

      <CertificateGrid certificates={certificates} />
    </div>
  );
}
