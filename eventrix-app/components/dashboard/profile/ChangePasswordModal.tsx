"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ChangePasswordModal() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        Change Password
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
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Change password</div>
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Current password</label>
                <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">New password</label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>

              {error ? <div className="text-sm text-red-600">{error}</div> : null}
              {success ? <div className="text-sm text-green-600">{success}</div> : null}

              <div className="flex flex-wrap justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={busy || !currentPassword || !newPassword}
                  onClick={async () => {
                    setBusy(true);
                    setError(null);
                    setSuccess(null);
                    try {
                      const res = await fetch("/api/user/change-password", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ currentPassword, newPassword }),
                      });
                      const json = await res.json();
                      if (!res.ok || !json?.success) throw new Error(json?.error?.message ?? "Failed to change password");
                      setSuccess("Password updated.");
                      setCurrentPassword("");
                      setNewPassword("");
                    } catch (e: any) {
                      setError(e?.message ?? "Failed to change password");
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  {busy ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
