"use client";

import type { NotificationItem as Item } from "@/types/notifications";
import { Button } from "@/components/ui/button";

export function NotificationItem({
  item,
  onToggleRead,
  onDelete,
}: {
  item: Item;
  onToggleRead: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</div>
            {!item.read ? (
              <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs text-white dark:bg-slate-100 dark:text-slate-900">
                Unread
              </span>
            ) : null}
          </div>
          <div className="mt-1 text-sm text-slate-700 dark:text-slate-200">{item.message}</div>
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">
            {new Date(item.createdAt).toLocaleString()} • {item.type}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onToggleRead}>
            Mark as {item.read ? "unread" : "read"}
          </Button>
          <Button type="button" variant="ghost" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
