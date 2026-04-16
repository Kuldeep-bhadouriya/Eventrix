"use client";

import { EventStatus } from "@prisma/client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";

async function moderateEvent(eventId: string, action: "approve" | "reject" | "close" | "complete" | "draft") {
  const res = await fetch(`/api/admin/events/${eventId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });

  const json = await res.json();
  if (!res.ok || !json?.success) {
    throw new Error(json?.error?.message ?? "Failed to update event moderation status");
  }

  return json.data as { status: EventStatus };
}

export function EventReviewActionsClient({ eventId, initialStatus }: { eventId: string; initialStatus: EventStatus }) {
  const { toast } = useToast();
  const [status, setStatus] = useState<EventStatus>(initialStatus);
  const [busy, setBusy] = useState(false);

  const onAction = async (action: "approve" | "reject" | "close" | "complete" | "draft") => {
    try {
      setBusy(true);
      const data = await moderateEvent(eventId, action);
      setStatus(data.status);
      toast({ title: "Event moderation updated", variant: "success" });
    } catch (error) {
      toast({
        title: "Could not update event",
        description: error instanceof Error ? error.message : "Unexpected error",
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-700 dark:text-gray-200">
        Current status: <span className="font-medium">{status}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" disabled={busy} onClick={() => onAction("approve")}>Approve</Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => onAction("reject")}>Reject</Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => onAction("close")}>Close</Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => onAction("complete")}>Complete</Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => onAction("draft")}>Move to Draft</Button>
      </div>
    </div>
  );
}
