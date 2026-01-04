"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { CertificateListItem } from "@/types/certificates";

export function CertificateCard({
  certificate,
  onView,
  onDownload,
  onShare,
}: {
  certificate: CertificateListItem;
  onView: () => void;
  onDownload: () => void;
  onShare: () => void;
}) {
  return (
    <Card>
      <CardContent>
        <div className="space-y-3">
          <div className="rounded-lg border border-gray-200 bg-white/60 p-3 text-sm dark:border-gray-800 dark:bg-gray-950/40">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-300">Event</div>
            <div className="mt-1 font-semibold text-gray-900 dark:text-gray-100">{certificate.event.title}</div>
            <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
              Issued {new Date(certificate.issuedAt).toLocaleDateString()}
            </div>
            <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
              Certificate ID: <span className="font-mono">{certificate.certificateId}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={onView}>
              View
            </Button>
            <Button type="button" variant="outline" onClick={onDownload}>
              Download
            </Button>
            <Button type="button" variant="ghost" onClick={onShare}>
              Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
