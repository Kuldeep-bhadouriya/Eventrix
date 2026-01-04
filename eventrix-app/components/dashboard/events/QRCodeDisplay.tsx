"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

import { cn } from "@/lib/utils";

export function QRCodeDisplay({
  value,
  className,
  size = 180,
}: {
  value: string;
  className?: string;
  size?: number;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, { margin: 1, width: size })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  return (
    <div className={cn("flex items-center justify-center", className)}>
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={dataUrl}
          alt="Event pass QR code"
          width={size}
          height={size}
          className="rounded-md border border-gray-200 bg-white p-2 dark:border-gray-800"
        />
      ) : (
        <div
          aria-label="QR code loading"
          className="flex h-[180px] w-[180px] items-center justify-center rounded-md border border-gray-200 bg-white text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
        >
          Generating QR...
        </div>
      )}
    </div>
  );
}
