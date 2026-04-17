"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { ChevronDown, LogOut, User as UserIcon, ArrowLeftRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function initialsFromEmail(email?: string | null) {
  const localPart = email?.split("@")[0]?.trim() ?? "";
  const cleaned = localPart.replace(/[^a-zA-Z0-9]/g, "");
  if (!cleaned) return "U";
  return cleaned.slice(0, 2).toUpperCase();
}

export function OrganizerMenu({
  email,
  roleLabel = "Organizer",
  showStudentSwitch = true,
  className,
}: {
  email?: string | null;
  roleLabel?: string;
  showStudentSwitch?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const displayEmail = useMemo(() => email?.trim() || "User", [email]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    const onMouseDown = (e: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, []);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <Button
        type="button"
        variant="ghost"
        className="h-10 gap-2 px-2"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
          {initialsFromEmail(displayEmail)}
        </span>

        <div className="hidden min-w-0 flex-col items-start md:flex">
          <span className="max-w-[14rem] truncate text-sm font-medium text-gray-900 dark:text-gray-100">
            {displayEmail}
          </span>
          <span className="text-[11px] text-gray-600 dark:text-gray-300">{roleLabel}</span>
        </div>

        <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950"
        >
          <div className="px-3 py-2">
            <div className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
              {displayEmail}
            </div>
            <div className="mt-1 text-[11px] text-gray-600 dark:text-gray-300">{roleLabel}</div>
          </div>

          <div className="h-px bg-gray-200 dark:bg-gray-800" />

          <Link
            role="menuitem"
            href="/organizer/profile"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900"
            onClick={() => setOpen(false)}
          >
            <UserIcon className="h-4 w-4" />
            Profile
          </Link>

          {showStudentSwitch && (
            <Link
              role="menuitem"
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900"
              onClick={() => setOpen(false)}
            >
              <ArrowLeftRight className="h-4 w-4" />
              Switch to student view
            </Link>
          )}

          <div className="h-px bg-gray-200 dark:bg-gray-800" />

          <button
            role="menuitem"
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900"
            onClick={async () => {
              setOpen(false);
              await signOut({ redirect: false });
              router.push("/");
            }}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
