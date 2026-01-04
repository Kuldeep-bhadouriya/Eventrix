"use client";

import { useState } from "react";

import type { UserProfile } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AvatarUpload } from "@/components/dashboard/profile/AvatarUpload";
import { ChangePasswordModal } from "@/components/dashboard/profile/ChangePasswordModal";
import { NotificationPreferences } from "@/components/dashboard/profile/NotificationPreferences";
import { DeleteAccountModal } from "@/components/dashboard/profile/DeleteAccountModal";

export function ProfileForm({ profile }: { profile: UserProfile }) {
  const [form, setForm] = useState<UserProfile>(profile);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white/60 p-4 dark:border-gray-800 dark:bg-gray-950/40">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Personal info</div>
            <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
              Email {form.emailVerified ? "verified" : "not verified"}
            </div>
          </div>
          <ChangePasswordModal />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <AvatarUpload
              initialUrl={form.avatar}
              onUpdated={(avatar) => setForm((f) => ({ ...f, avatar }))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Name</label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Phone</label>
            <Input value={form.phone ?? ""} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value || null }))} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Roll number</label>
            <Input
              value={form.collegeRollNumber ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, collegeRollNumber: e.target.value || null }))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Semester</label>
            <Input value={form.semester ?? ""} onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value || null }))} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Department</label>
            <Input
              value={form.department ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, department: e.target.value || null }))}
            />
          </div>
        </div>

        {message ? <div className="mt-3 text-sm text-gray-700 dark:text-gray-200">{message}</div> : null}

        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setMessage(null);
              try {
                const res = await fetch("/api/user/profile", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: form.name,
                    phone: form.phone,
                    collegeRollNumber: form.collegeRollNumber,
                    semester: form.semester,
                    department: form.department,
                  }),
                });
                const json = await res.json();
                if (!res.ok || !json?.success) throw new Error(json?.error?.message ?? "Failed to update profile");
                setMessage("Profile updated.");
              } catch (e: any) {
                setMessage(e?.message ?? "Failed to update profile");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white/60 p-4 dark:border-gray-800 dark:bg-gray-950/40">
        <NotificationPreferences />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white/60 p-4 dark:border-gray-800 dark:bg-gray-950/40">
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Danger zone</div>
        <div className="mt-3">
          <DeleteAccountModal />
        </div>
      </div>
    </div>
  );
}
