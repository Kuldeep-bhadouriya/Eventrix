"use client";

import { useMemo, useRef, useState } from "react";

import type { EventPassData } from "@/types/event-pass";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeDisplay } from "@/components/dashboard/events/QRCodeDisplay";
import { PassActions } from "@/components/dashboard/events/PassActions";
import { cn } from "@/lib/utils";

export function EventPass({ pass, className }: { pass: EventPassData; className?: string }) {
  const passRef = useRef<HTMLDivElement | null>(null);
  const [passElement, setPassElement] = useState<HTMLElement | null>(null);

  const formattedDate = useMemo(() => {
    const d = new Date(pass.event.date);
    return d.toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" });
  }, [pass.event.date]);

  return (
    <div className={cn("space-y-4", className)}>
      <div
        ref={(node) => {
          passRef.current = node;
          setPassElement(node);
        }}
      >
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <CardTitle className="flex flex-wrap items-center justify-between gap-2">
              <span>Event Pass</span>
              <span className="text-sm font-normal text-gray-600 dark:text-gray-300">
                Ref: {pass.registration.referenceNumber}
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-3 lg:col-span-2">
                <div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-300">Event</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{pass.event.title}</div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-gray-200 bg-white/60 p-3 dark:border-gray-800 dark:bg-gray-950/40">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-300">Date</div>
                    <div className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formattedDate}</div>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white/60 p-3 dark:border-gray-800 dark:bg-gray-950/40">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-300">Time</div>
                    <div className="mt-1 text-sm text-gray-900 dark:text-gray-100">{pass.event.time}</div>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white/60 p-3 dark:border-gray-800 dark:bg-gray-950/40 sm:col-span-2">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-300">Venue</div>
                    <div className="mt-1 text-sm text-gray-900 dark:text-gray-100">{pass.event.venue}</div>
                  </div>
                </div>

                <div className="rounded-lg border border-dashed border-gray-200 p-3 text-sm text-gray-700 dark:border-gray-800 dark:text-gray-200">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-300">Pass ID</div>
                      <div className="mt-1 font-mono text-xs text-gray-900 dark:text-gray-100">{pass.registration.id}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-300">Seat</div>
                      <div className="mt-1 text-sm text-gray-900 dark:text-gray-100">{pass.registration.seatNumber ?? "—"}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white/60 p-3 dark:border-gray-800 dark:bg-gray-950/40">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-300">Attendee</div>
                  <div className="mt-1 text-sm text-gray-900 dark:text-gray-100">{pass.user.name ?? "Student"}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">{pass.user.email ?? ""}</div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white/60 p-4 dark:border-gray-800 dark:bg-gray-950/40">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Scan at entry</div>
                  <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                    Contains your user ID, event ID, registration ID, and verification hash.
                  </div>
                </div>
                <QRCodeDisplay value={pass.qrValue} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <PassActions pass={pass} passElement={passElement} />
    </div>
  );
}
