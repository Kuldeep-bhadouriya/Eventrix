"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";

type ToastVariant = "default" | "success" | "error";

export type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastItem = ToastInput & {
  id: string;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function uid() {
  return Math.random().toString(36).slice(2);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((input: ToastInput) => {
    const id = uid();
    const item: ToastItem = { id, variant: "default", durationMs: 4500, ...input };
    setItems((prev) => [item, ...prev].slice(0, 5));

    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, item.durationMs ?? 4500);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions"
        className="fixed bottom-4 right-4 z-[60] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
      >
        {items.map((t) => {
          const border =
            t.variant === "success"
              ? "border-green-200 dark:border-green-900"
              : t.variant === "error"
                ? "border-red-200 dark:border-red-900"
                : "border-gray-200 dark:border-gray-800";
          return (
            <div
              key={t.id}
              role="status"
              className={`rounded-md border bg-white/90 p-3 text-sm shadow-sm backdrop-blur dark:bg-gray-950/90 ${border}`}
            >
              <div className="font-semibold text-gray-900 dark:text-gray-100">{t.title}</div>
              {t.description ? (
                <div className="mt-1 text-gray-600 dark:text-gray-300">{t.description}</div>
              ) : null}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
