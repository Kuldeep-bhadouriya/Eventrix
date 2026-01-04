"use client";

import { useMemo, useState } from "react";

import type { EventPassData } from "@/types/event-pass";
import { DownloadButton } from "@/components/dashboard/events/DownloadButton";
import { ShareButton } from "@/components/dashboard/events/ShareButton";
import { Button } from "@/components/ui/button";
import { downloadElementAsPdf, downloadElementAsPng } from "@/lib/pdf-generator";
import { buildIcsEvent, createMailtoHref, createWhatsAppHref, downloadTextFile } from "@/lib/share-utils";

export function PassActions({
  pass,
  passElement,
}: {
  pass: EventPassData;
  passElement: HTMLElement | null;
}) {
  const [busy, setBusy] = useState<null | "pdf" | "png">(null);

  const shareText = useMemo(() => {
    return [
      `Event Pass: ${pass.event.title}`,
      `Date: ${new Date(pass.event.date).toLocaleDateString()}`,
      `Time: ${pass.event.time}`,
      `Venue: ${pass.event.venue}`,
      `Pass Ref: ${pass.registration.referenceNumber}`,
    ].join("\n");
  }, [pass]);

  const mailtoHref = useMemo(
    () =>
      createMailtoHref({
        subject: `Event Pass - ${pass.event.title}`,
        body: shareText,
      }),
    [pass.event.title, shareText]
  );

  const whatsappHref = useMemo(() => createWhatsAppHref(shareText), [shareText]);

  return (
    <div className="flex flex-wrap gap-2">
      <DownloadButton
        label={busy === "pdf" ? "Preparing PDF..." : "Download PDF"}
        disabled={!passElement || busy !== null}
        onClick={async () => {
          if (!passElement) return;
          setBusy("pdf");
          try {
            await downloadElementAsPdf(passElement, {
              fileName: `event-pass-${pass.registration.referenceNumber}.pdf`,
              title: "Event Pass",
            });
          } finally {
            setBusy(null);
          }
        }}
      />

      <DownloadButton
        label={busy === "png" ? "Preparing Image..." : "Download Image"}
        disabled={!passElement || busy !== null}
        onClick={async () => {
          if (!passElement) return;
          setBusy("png");
          try {
            await downloadElementAsPng(passElement, {
              fileName: `event-pass-${pass.registration.referenceNumber}.png`,
            });
          } finally {
            setBusy(null);
          }
        }}
      />

      <ShareButton label="Share Email" href={mailtoHref} />
      <ShareButton label="Share WhatsApp" href={whatsappHref} />

      <Button
        type="button"
        variant="outline"
        onClick={() => {
          // Minimal ICS support: assumes 2 hours duration.
          const start = new Date(pass.event.date);
          const [hh, mm] = pass.event.time.split(":");
          if (hh) start.setHours(Number(hh), Number(mm ?? 0), 0, 0);
          const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

          const ics = buildIcsEvent({
            uid: `${pass.registration.id}@eventrix`,
            title: pass.event.title,
            description: `Eventrix Event Pass Ref: ${pass.registration.referenceNumber}`,
            location: pass.event.venue,
            startUtc: start,
            endUtc: end,
          });

          downloadTextFile(
            `event-${pass.event.id}.ics`,
            ics,
            "text/calendar;charset=utf-8"
          );
        }}
      >
        Add to Calendar
      </Button>

      <Button type="button" variant="ghost" onClick={() => window.print()}>
        Print
      </Button>
    </div>
  );
}
