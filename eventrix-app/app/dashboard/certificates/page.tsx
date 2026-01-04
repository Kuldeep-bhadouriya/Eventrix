import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Metadata } from "next";

import { authOptions } from "@/lib/auth";
import { getUserCertificates } from "@/lib/dashboard/certificates-queries";
import { CertificateGrid } from "@/components/dashboard/certificates/CertificateGrid";

export const metadata: Metadata = {
  title: "Certificates",
};

export default async function CertificatesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=%2Fdashboard%2Fcertificates");

  const certificates = await getUserCertificates(session.user.id);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Certificates</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          View, download, share, and verify certificates you’ve earned.
        </p>
      </div>

      <CertificateGrid certificates={certificates} />
    </div>
  );
}
