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
    <Card className="gap-0 border-slate-200/90 bg-white/90 py-0 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <CardContent>
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-900/80">
            <div className="text-xs font-medium text-slate-600 dark:text-slate-300">Event</div>
            <div className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{certificate.event.title}</div>
            <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Issued {new Date(certificate.issuedAt).toLocaleDateString()}
            </div>
            <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
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
