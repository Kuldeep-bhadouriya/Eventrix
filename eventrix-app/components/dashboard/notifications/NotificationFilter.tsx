"use client";

import { Button } from "@/components/ui/button";

export function NotificationFilter({
  tab,
  onTabChange,
}: {
  tab: "all" | "unread" | "read";
  onTabChange: (tab: "all" | "unread" | "read") => void;
}) {
  const tabs: Array<{ key: "all" | "unread" | "read"; label: string }> = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "read", label: "Read" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => (
        <Button
          key={t.key}
          type="button"
          variant={tab === t.key ? "default" : "outline"}
          size="sm"
          onClick={() => onTabChange(t.key)}
        >
          {t.label}
        </Button>
      ))}
    </div>
  );
}
