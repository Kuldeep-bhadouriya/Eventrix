"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

type NavbarsProps = {
  menuLabel?: string;
  triggerClassName?: string;
  panelClassName?: string;
  renderContent: (closeMenu: () => void) => ReactNode;
};

export default function Navbars({
  menuLabel = "Navigation menu",
  triggerClassName,
  panelClassName,
  renderContent,
}: NavbarsProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("lg:hidden", triggerClassName)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className={cn("w-[88vw] max-w-[320px] p-0", panelClassName)}
      >
        <SheetTitle className="sr-only">{menuLabel}</SheetTitle>
        {renderContent(() => setOpen(false))}
      </SheetContent>
    </Sheet>
  );
}
