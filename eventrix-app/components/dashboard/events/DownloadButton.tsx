"use client";

import { Button } from "@/components/ui/button";

export function DownloadButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button type="button" variant="secondary" onClick={onClick} disabled={disabled}>
      {label}
    </Button>
  );
}
