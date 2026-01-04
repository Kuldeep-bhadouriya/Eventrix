"use client";

import { useEffect, useState } from "react";
import { Menu, ShieldCheck, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SystemHealthIndicator } from "@/components/admin/SystemHealthIndicator";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

function AdminMobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Admin menu"
              className="absolute left-0 top-0 h-full w-[80vw] max-w-sm overflow-y-auto bg-white dark:bg-gray-950"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.2 }}
            >
              <div className="flex items-center justify-between border-b border-gray-200 p-3 dark:border-gray-800">
                <div className="text-sm font-semibold">Menu</div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <AdminSidebar className="border-r-0" onNavigate={() => setOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function AdminHeader({ className }: { className?: string }) {
  const { user, isLoading } = useAuth();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-gray-200 bg-white/70 backdrop-blur dark:border-gray-800 dark:bg-gray-950/60",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <AdminMobileMenu />
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white/60 px-2 py-1 text-xs font-medium text-gray-900 dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-100">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin
            </span>
            <SystemHealthIndicator className="hidden sm:flex" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <div className="hidden sm:block">
            {isLoading ? "Loading..." : (user?.name ?? user?.email ?? "")}
          </div>
          <SystemHealthIndicator className="sm:hidden" />
        </div>
      </div>
    </header>
  );
}
