"use client";

export function DraftSaveIndicator({
  status,
}: {
  status: "idle" | "saving" | "saved" | "error";
}) {
  const text =
    status === "saving"
      ? "Saving draft…"
      : status === "saved"
        ? "Draft saved"
        : status === "error"
          ? "Draft save failed"
          : "";

  if (!text) return null;

  return (
    <div className="text-xs text-gray-600 dark:text-gray-300" aria-live="polite">
      {text}
    </div>
  );
}
