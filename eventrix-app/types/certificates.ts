export type CertificateListItem = {
  id: string;
  certificateId: string;
  event: {
    id: string;
    title: string;
    category: string | null;
  };
  issuedAt: string; // ISO
  previewUrl: string | null;
};

export type CertificateDetails = CertificateListItem & {
  downloadUrl: string | null;
};
