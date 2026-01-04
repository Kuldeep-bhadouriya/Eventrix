"use client";

import { Button } from "@/components/ui/button";

export function BulkActions({
  count,
  onPublish,
  onCancel,
  onDelete,
}: {
  count: number;
  onPublish: () => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  if (count === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-gray-200 bg-white/60 p-3 text-sm dark:border-gray-800 dark:bg-gray-950/40">
      <div className="text-gray-600 dark:text-gray-300">{count} selected</div>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" onClick={onPublish}>Publish</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="button" variant="destructive" onClick={onDelete}>Delete</Button>
      </div>
    </div>
  );
}
