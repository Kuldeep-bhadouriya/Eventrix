"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function initialsFromEmail(email?: string | null) {
  const localPart = email?.split("@")[0]?.trim() ?? "";
  const cleaned = localPart.replace(/[^a-zA-Z0-9]/g, "");
  if (!cleaned) return "U";
  return cleaned.slice(0, 2).toUpperCase();
}

export function UserMenu({
  email,
  className,
}: {
  email?: string | null;
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
        <span className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          {initialsFromEmail(displayEmail)}
        </span>

        <span className="hidden max-w-[14rem] truncate text-sm font-medium text-slate-900 dark:text-slate-100 md:inline">
          {displayEmail}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-300" />
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="px-3 py-2">
            <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
              {displayEmail}
            </div>
          </div>
          <div className="h-px bg-slate-200 dark:bg-slate-800" />

          <Link
            role="menuitem"
            href="/dashboard/profile"
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
            onClick={() => setOpen(false)}
          >
            <UserIcon className="h-4 w-4" />
            Profile
          </Link>

          <button
            role="menuitem"
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
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
