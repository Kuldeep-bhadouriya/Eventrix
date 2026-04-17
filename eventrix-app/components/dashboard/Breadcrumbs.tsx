"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  "my-events": "My Events",
  certificates: "Certificates",
  profile: "Profile",
  notifications: "Notifications",
};

function formatSegment(seg: string) {
  return LABELS[seg] || seg.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname() || "/";
  const parts = pathname.split("/").filter(Boolean);

  const dashIndex = parts.indexOf("dashboard");
  const crumbs = dashIndex >= 0 ? parts.slice(dashIndex) : parts;

  const buildHref = (idx: number) => "/" + crumbs.slice(0, idx + 1).join("/");

  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-1 text-slate-600 dark:text-slate-300">
        {crumbs.length === 0 ? (
          <li className="font-medium text-slate-900 dark:text-slate-100">Dashboard</li>
        ) : (
          crumbs.map((seg, idx) => {
            const href = buildHref(idx);
            const label = formatSegment(seg);
            const isLast = idx === crumbs.length - 1;

            return (
              <li key={href} className="flex items-center gap-1">
                {idx !== 0 && <span className="px-1 text-slate-400">/</span>}
                {isLast ? (
                  <span className="rounded-md bg-slate-200/70 px-1.5 py-0.5 font-medium text-slate-900 dark:bg-slate-800 dark:text-slate-100">
                    {label}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="hover:text-slate-900 hover:underline dark:hover:text-slate-100"
                  >
                    {label}
                  </Link>
                )}
              </li>
            );
          })
        )}
      </ol>
    </nav>
  );
}
