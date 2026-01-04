"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DeleteAccountModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <Button type="button" variant="destructive" onClick={() => setOpen(true)}>
        Delete account
      </Button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Delete account</div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              This action is permanent. Type <span className="font-mono">DELETE</span> to confirm.
            </p>
            <div className="mt-3 space-y-3">
              <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="DELETE" />
              {error ? <div className="text-sm text-red-600">{error}</div> : null}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={busy || confirm !== "DELETE"}
                  onClick={async () => {
                    setBusy(true);
                    setError(null);
                    try {
                      const res = await fetch("/api/user/account", { method: "DELETE" });
                      const json = await res.json();
                      if (!res.ok || !json?.success) throw new Error(json?.error?.message ?? "Failed to delete account");
                      router.push("/");
                    } catch (e: any) {
                      setError(e?.message ?? "Failed to delete account");
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  {busy ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
