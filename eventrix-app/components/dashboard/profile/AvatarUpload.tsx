"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AvatarUpload({
  initialUrl,
  onUpdated,
}: {
  initialUrl: string | null;
  onUpdated: (newUrl: string) => void;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Avatar URL</label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
        <Button
          type="button"
          variant="secondary"
          disabled={busy || !url.trim()}
          onClick={async () => {
            setBusy(true);
            setError(null);
            try {
              const res = await fetch("/api/user/avatar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ avatar: url.trim() }),
              });
              const json = await res.json();
              if (!res.ok || !json?.success) throw new Error(json?.error?.message ?? "Failed to update avatar");
              onUpdated(url.trim());
            } catch (e: any) {
              setError(e?.message ?? "Failed to update avatar");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Saving..." : "Save"}
        </Button>
      </div>
      {error ? <div className="text-sm text-red-600">{error}</div> : null}
    </div>
  );
}
