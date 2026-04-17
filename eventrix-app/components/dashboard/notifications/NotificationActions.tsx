"use client";

import { Button } from "@/components/ui/button";

export function NotificationActions({
  onMarkAllRead,
  onClearAll,
  busy,
}: {
  onMarkAllRead: () => void;
  onClearAll: () => void;
  busy?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" size="sm" variant="outline" onClick={onMarkAllRead} disabled={busy}>
        Mark all as read
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={onClearAll} disabled={busy}>
        Clear all
      </Button>
    </div>
  );
}
