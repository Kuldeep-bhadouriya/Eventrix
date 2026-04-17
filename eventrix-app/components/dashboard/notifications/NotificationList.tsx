"use client";

import { useEffect, useMemo, useState } from "react";

import type { NotificationItem as Item } from "@/types/notifications";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { NotificationItem } from "@/components/dashboard/notifications/NotificationItem";
import { NotificationFilter } from "@/components/dashboard/notifications/NotificationFilter";
import { NotificationActions } from "@/components/dashboard/notifications/NotificationActions";

export function NotificationList({ initial }: { initial: Item[] }) {
  const [tab, setTab] = useState<"all" | "unread" | "read">("all");
  const [items, setItems] = useState<Item[]>(initial);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const res = await fetch("/api/notifications", { cache: "no-store" });
    const json = await res.json();
    if (res.ok && json?.success) {
      setItems(json.data);
    }
  }

  useEffect(() => {
    const id = window.setInterval(() => {
      refresh().catch(() => undefined);
    }, 15000);
    return () => window.clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    if (tab === "unread") return items.filter((i) => !i.read);
    if (tab === "read") return items.filter((i) => i.read);
    return items;
  }, [items, tab]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200/90 bg-white/85 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
        <NotificationFilter tab={tab} onTabChange={setTab} />
        <NotificationActions
          busy={busy}
          onMarkAllRead={async () => {
            setBusy(true);
            try {
              await fetch("/api/notifications/read-all", { method: "POST" });
              await refresh();
            } finally {
              setBusy(false);
            }
          }}
          onClearAll={async () => {
            setBusy(true);
            try {
              await fetch("/api/notifications/clear", { method: "DELETE" });
              await refresh();
            } finally {
              setBusy(false);
            }
          }}
        />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No notifications" description="You’re all caught up." />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <NotificationItem
              key={item.id}
              item={item}
              onToggleRead={async () => {
                await fetch(`/api/notifications/${item.id}/read`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ read: !item.read }),
                });
                await refresh();
              }}
              onDelete={async () => {
                await fetch(`/api/notifications/${item.id}`, { method: "DELETE" });
                await refresh();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
