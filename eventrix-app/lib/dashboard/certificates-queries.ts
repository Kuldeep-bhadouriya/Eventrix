import { prisma } from "@/lib/db";
import type { CertificateDetails, CertificateListItem } from "@/types/certificates";

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

export async function getUserCertificates(userId: string): Promise<CertificateListItem[]> {
  if (!isDatabaseAvailable()) return [];

  const items = await prisma.certificate.findMany({
    where: { userId },
    orderBy: { issuedAt: "desc" },
    select: {
      id: true,
      issuedAt: true,
      templateUrl: true,
      downloadUrl: true,
      event: {
        select: {
          id: true,
          title: true,
          category: true,
        },
      },
    },
  });

  return items.map((c) => ({
    id: c.id,
    certificateId: c.id,
    issuedAt: c.issuedAt.toISOString(),
    previewUrl: c.downloadUrl ?? c.templateUrl ?? null,
    event: {
      id: c.event.id,
      title: c.event.title,
      category: c.event.category ? String(c.event.category) : null,
    },
  }));
}

export async function getCertificateDetailsForUser(input: {
  userId: string;
  certificateId: string;
}): Promise<CertificateDetails | null> {
  if (!isDatabaseAvailable()) return null;

  const cert = await prisma.certificate.findFirst({
    where: { id: input.certificateId, userId: input.userId },
    select: {
      id: true,
      issuedAt: true,
      templateUrl: true,
      downloadUrl: true,
      event: {
        select: { id: true, title: true, category: true },
      },
    },
  });

  if (!cert) return null;

  return {
    id: cert.id,
    certificateId: cert.id,
    issuedAt: cert.issuedAt.toISOString(),
    previewUrl: cert.downloadUrl ?? cert.templateUrl ?? null,
    downloadUrl: cert.downloadUrl ?? cert.templateUrl ?? null,
    event: {
      id: cert.event.id,
      title: cert.event.title,
      category: cert.event.category ? String(cert.event.category) : null,
    },
  };
}
