"use client";

import { Button } from "@/components/ui/button";

export function ShareButton({
  label,
  href,
  disabled,
}: {
  label: string;
  href: string;
  disabled?: boolean;
}) {
  return (
    <Button asChild variant="outline" disabled={disabled}>
      <a href={href} target="_blank" rel="noreferrer">
        {label}
      </a>
    </Button>
  );
}
