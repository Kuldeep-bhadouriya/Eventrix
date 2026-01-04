"use client";

import { useEffect, useMemo, useState } from "react";

type HealthStatus = "healthy" | "degraded" | "down";

type HealthResponse = {
  status: HealthStatus;
  responseTimeMs?: number;
  db?: {
    ok: boolean;
    responseTimeMs?: number;
  };
  errorRatePct?: number;
};

function statusLabel(status: HealthStatus) {
  switch (status) {
    case "healthy":
      return "Healthy";
    case "degraded":
      return "Degraded";
    case "down":
      return "Down";
  }
}

export function SystemHealthIndicator({ className = "" }: { className?: string }) {
  const [data, setData] = useState<HealthResponse | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await fetch("/api/admin/health", { cache: "no-store" });
        if (!res.ok) throw new Error("health fetch failed");
        const json = (await res.json()) as { success: boolean; data?: HealthResponse };
        if (!mounted) return;
        setData(json.data ?? null);
      } catch {
        if (!mounted) return;
        setData({ status: "down" });
      }
    };

    load();
    const id = window.setInterval(load, 30_000);

    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, []);

  const status = data?.status ?? "degraded";

  const dotClass = useMemo(() => {
    switch (status) {
      case "healthy":
        return "bg-green-500";
      case "degraded":
        return "bg-yellow-500";
      case "down":
        return "bg-red-500";
    }
  }, [status]);

  return (
    <div className={`flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 ${className}`}>
      <span className={`h-2 w-2 rounded-full ${dotClass}`} aria-hidden="true" />
      <span className="font-medium text-gray-900 dark:text-gray-100">System:</span>
      <span aria-label={`System health ${statusLabel(status)}`}>{statusLabel(status)}</span>
      {typeof data?.responseTimeMs === "number" ? (
        <span className="text-gray-500 dark:text-gray-400">({data.responseTimeMs}ms)</span>
      ) : null}
    </div>
  );
}
