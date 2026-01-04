"use client";

import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";

export function CancelEventModal({
  open,
  onClose,
  onConfirm,
  title,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Cancel event"
        >
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <div className="absolute left-1/2 top-1/2 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Cancel event</div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              This will close registrations for <span className="font-medium">{title}</span>.
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Back
              </Button>
              <Button type="button" onClick={onConfirm}>
                Confirm
              </Button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
