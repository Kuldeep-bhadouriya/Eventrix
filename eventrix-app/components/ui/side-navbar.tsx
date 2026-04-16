"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type SideNavbarItem = {
  label: string;
  href?: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void | Promise<void>;
};

export function SideNavbar({
  title,
  items,
  hintTitle,
  hintText,
  className,
  onNavigate,
}: {
  title: string;
  items: SideNavbarItem[];
  hintTitle?: string;
  hintText?: string;
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <nav
      aria-label={`${title} navigation`}
      className={cn(
        "h-full w-full border-r border-gray-200 bg-white/70 backdrop-blur dark:border-gray-800 dark:bg-gray-950/60",
        className,
      )}
    >
      <ScrollArea className="h-full py-6">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">{title}</h2>
          <div className="space-y-1">
            {items.map((item) => {
              const classNames = cn(
                "w-full justify-start",
                item.active && "bg-accent text-accent-foreground hover:bg-accent",
              );

              if (item.href) {
                return (
                  <Button
                    key={item.label}
                    asChild
                    variant="ghost"
                    className={classNames}
                  >
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={item.active ? "page" : undefined}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </Button>
                );
              }

              return (
                <Button
                  key={item.label}
                  variant="ghost"
                  className={classNames}
                  onClick={async () => {
                    await item.onClick?.();
                    onNavigate?.();
                  }}
                >
                  {item.icon}
                  {item.label}
                </Button>
              );
            })}
          </div>

          {hintTitle && hintText ? (
            <div className="mt-6 rounded-md border border-gray-200 bg-white/60 p-3 text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-300">
              <div className="font-medium text-gray-900 dark:text-gray-100">{hintTitle}</div>
              <div className="mt-1">{hintText}</div>
            </div>
          ) : null}
        </div>
      </ScrollArea>
    </nav>
  );
}
