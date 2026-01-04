"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type Prefs = {
  email: boolean;
  whatsapp: boolean;
};

const KEY = "eventrix.notificationPrefs";

export function NotificationPreferences() {
  const [prefs, setPrefs] = useState<Prefs>({ email: true, whatsapp: false });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setPrefs(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notification preferences</div>
      <div className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={prefs.email}
            onChange={(e) => setPrefs((p) => ({ ...p, email: e.target.checked }))}
          />
          Email notifications
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={prefs.whatsapp}
            onChange={(e) => setPrefs((p) => ({ ...p, whatsapp: e.target.checked }))}
          />
          WhatsApp notifications
        </label>
      </div>
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          localStorage.setItem(KEY, JSON.stringify(prefs));
        }}
      >
        Save preferences
      </Button>
    </div>
  );
}
