"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EventStatusBadge } from "@/components/organizer/events/EventStatusBadge";

export function EventQuickView({
  open,
  onClose,
  event,
}: {
  open: boolean;
  onClose: () => void;
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    venue: string;
    status: string;
    registeredCount: number;
    capacity: number;
    category: string;
  } | null;
}) {
  return (
    <AnimatePresence>
      {open && event ? (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Event quick view"
        >
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />

          <motion.aside
            className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.2 }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-lg font-semibold text-gray-900 dark:text-gray-100">{event.title}</div>
                <div className="mt-1 flex items-center gap-2">
                  <EventStatusBadge status={event.status} />
                  <span className="text-xs text-gray-600 dark:text-gray-300">{event.category}</span>
                </div>
              </div>
              <Button type="button" variant="ghost" size="icon" aria-label="Close" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <div><span className="font-medium text-gray-900 dark:text-gray-100">Date:</span> {event.date}</div>
              <div><span className="font-medium text-gray-900 dark:text-gray-100">Time:</span> {event.time}</div>
              <div><span className="font-medium text-gray-900 dark:text-gray-100">Venue:</span> {event.venue}</div>
              <div><span className="font-medium text-gray-900 dark:text-gray-100">Registrations:</span> {event.registeredCount} / {event.capacity}</div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link href={`/organizer/events/${event.id}/edit`}>Edit</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/organizer/events/${event.id}/analytics`}>Analytics</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/organizer/events/${event.id}/participants`}>Participants</Link>
              </Button>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
