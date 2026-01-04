"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  organizer: "Organizer",
  dashboard: "Dashboard",
  events: "Events",
  create: "Create Event",
  participants: "Participants",
  analytics: "Analytics",
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

  const orgIndex = parts.indexOf("organizer");
  const crumbs = orgIndex >= 0 ? parts.slice(orgIndex) : parts;

  const buildHref = (idx: number) => "/" + crumbs.slice(0, idx + 1).join("/");

  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-1 text-gray-600 dark:text-gray-300">
        {crumbs.length === 0 ? (
          <li className="text-gray-900 dark:text-gray-100">Organizer</li>
        ) : (
          crumbs.map((seg, idx) => {
            const href = buildHref(idx);
            const label = formatSegment(seg);
            const isLast = idx === crumbs.length - 1;

            return (
              <li key={href} className="flex items-center gap-1">
                {idx !== 0 && <span className="px-1 text-gray-400">/</span>}
                {isLast ? (
                  <span className="font-medium text-gray-900 dark:text-gray-100">{label}</span>
                ) : (
                  <Link
                    href={href}
                    className="hover:underline hover:text-gray-900 dark:hover:text-gray-100"
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
