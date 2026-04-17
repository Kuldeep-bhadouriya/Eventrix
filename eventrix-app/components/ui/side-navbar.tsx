"use client";

import Image from "next/image";
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

export type SideNavbarBrand = {
  name: string;
  logoSrc: string;
  logoAlt?: string;
  href?: string;
  badge?: string;
};

export function SideNavbar({
  title,
  items,
  brand,
  hintTitle,
  hintText,
  className,
  onNavigate,
}: {
  title: string;
  items: SideNavbarItem[];
  brand?: SideNavbarBrand;
  hintTitle?: string;
  hintText?: string;
  className?: string;
  onNavigate?: () => void;
}) {
  const BrandHeader = (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/90 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
      <div className="relative size-9 overflow-hidden rounded-lg border border-slate-200/80 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
        <Image
          src={brand?.logoSrc ?? "/assets/Logo.png"}
          alt={brand?.logoAlt ?? `${brand?.name ?? title} logo`}
          fill
          className="object-cover"
          sizes="36px"
          priority
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {brand?.name ?? title}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-300">{title}</div>
      </div>

      {brand?.badge ? (
        <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {brand.badge}
        </span>
      ) : null}
    </div>
  );

  return (
    <nav
      aria-label={`${title} navigation`}
      className={cn(
        "h-full w-full border-r border-slate-200/80 bg-gradient-to-b from-white to-slate-100/80 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950",
        className,
      )}
    >
      <ScrollArea className="h-full">
        <div className="flex min-h-full flex-col px-3 py-4">
          <div className="mb-5">
            {brand?.href ? (
              <Link href={brand.href} onClick={onNavigate}>
                {BrandHeader}
              </Link>
            ) : (
              BrandHeader
            )}
          </div>

          <div className="mb-4 px-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-300">
              {title} Menu
            </h2>
          </div>

          <div className="flex flex-col gap-1">
            {items.map((item) => {
              const classNames = cn(
                "h-11 w-full justify-start rounded-xl px-3 text-[15px] font-medium text-slate-700 transition-colors hover:bg-slate-200/80 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50",
                item.active && "bg-slate-900 text-white shadow-sm hover:bg-slate-800 hover:text-white dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700",
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
            <div className="mt-6 rounded-xl border border-slate-200/90 bg-white/80 p-3 text-sm leading-5 text-slate-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300">
              <div className="font-semibold text-slate-900 dark:text-slate-100">{hintTitle}</div>
              <div className="mt-1.5 text-slate-600 dark:text-slate-200">{hintText}</div>
            </div>
          ) : null}
        </div>
      </ScrollArea>
    </nav>
  );
}
