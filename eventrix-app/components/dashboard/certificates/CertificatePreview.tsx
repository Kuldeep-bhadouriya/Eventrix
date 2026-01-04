"use client";

import { useMemo, useState } from "react";

import type { CertificateListItem } from "@/types/certificates";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createMailtoHref, createWhatsAppHref } from "@/lib/share-utils";

export function CertificatePreview({
  certificate,
  open,
  onClose,
}: {
  certificate: CertificateListItem;
  open: boolean;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(1);

  const shareText = useMemo(() => {
    return [
      `Certificate: ${certificate.event.title}`,
      `Issued: ${new Date(certificate.issuedAt).toLocaleDateString()}`,
      `Certificate ID: ${certificate.certificateId}`,
    ].join("\n");
  }, [certificate]);

  const mailtoHref = useMemo(
    () =>
      createMailtoHref({
        subject: `Certificate - ${certificate.event.title}`,
        body: shareText,
      }),
    [certificate.event.title, shareText]
  );

  const whatsappHref = useMemo(() => createWhatsAppHref(shareText), [shareText]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{certificate.event.title}</div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              Certificate ID: <span className="font-mono">{certificate.certificateId}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}>
              Zoom -
            </Button>
            <Button type="button" variant="outline" onClick={() => setZoom((z) => Math.min(2, z + 0.25))}>
              Zoom +
            </Button>
            <Button type="button" variant="ghost" onClick={() => window.print()}>
              Print
            </Button>
            <Button asChild variant="outline">
              <a href={mailtoHref} target="_blank" rel="noreferrer">
                Share Email
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={whatsappHref} target="_blank" rel="noreferrer">
                Share WhatsApp
              </a>
            </Button>
            <Button type="button" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        <div className="mt-4 overflow-auto rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
          <div className="flex min-h-[420px] items-center justify-center p-6">
            {certificate.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={certificate.previewUrl}
                alt="Certificate preview"
                className={cn("max-w-none rounded-md border border-gray-200 dark:border-gray-800", "bg-white")}
                style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
              />
            ) : (
              <div className="text-sm text-gray-600 dark:text-gray-300">
                No preview available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
