"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";

type SettingItem = {
  key: string;
  category: string;
  value: unknown;
  description?: string | null;
};

type EmailTemplateItem = {
  name: string;
  subject: string;
  body: string;
  variables: string[];
  enabled: boolean;
};

type NotificationCampaignItem = {
  id: string;
  title: string;
  role: string;
  status: string;
  scheduledFor: string | null;
  sentAt: string | null;
  recipientsCount: number;
  createdAt: string;
};

async function saveSetting(key: string, category: string, value: unknown, description?: string) {
  const res = await fetch("/api/admin/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, category, value, description }),
  });

  const json = await res.json();
  if (!res.ok || !json?.success) {
    throw new Error(json?.error?.message ?? "Failed to save setting");
  }
}

async function saveTemplate(template: EmailTemplateItem) {
  const res = await fetch("/api/admin/settings/templates", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(template),
  });

  const json = await res.json();
  if (!res.ok || !json?.success) {
    throw new Error(json?.error?.message ?? "Failed to save email template");
  }
}

async function broadcastOrScheduleSystemMessage(payload: {
  title: string;
  message: string;
  role: "ALL" | "STUDENT" | "ORGANIZER" | "ADMIN";
  scheduledFor?: string;
}) {
  const res = await fetch("/api/admin/notifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok || !json?.success) {
    throw new Error(json?.error?.message ?? "Failed to send system message");
  }

  return {
    createdCount: Number(json?.data?.createdCount ?? 0),
    scheduled: Boolean(json?.data?.scheduled),
    campaignId: String(json?.data?.campaignId ?? ""),
  };
}

async function sendTemplateTestEmail(templateName: string, recipientEmail: string) {
  const res = await fetch("/api/admin/settings/templates/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ templateName, recipientEmail }),
  });

  const json = await res.json();
  if (!res.ok || !json?.success) {
    throw new Error(json?.error?.message ?? "Failed to send test email");
  }
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function formatDateTime(value: string | null) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString();
}

export function AdminSettingsClient({
  initialSettings,
  initialTemplates,
  initialCampaigns,
}: {
  initialSettings: SettingItem[];
  initialTemplates: EmailTemplateItem[];
  initialCampaigns: Array<{
    id: string;
    title: string;
    role: string;
    status: string;
    scheduledFor: Date | string | null;
    sentAt: Date | string | null;
    recipientsCount: number;
    createdAt: Date | string;
  }>;
}) {
  const { toast } = useToast();

  const settingMap = useMemo(() => {
    return new Map(initialSettings.map((item) => [item.key, item]));
  }, [initialSettings]);

  const [siteName, setSiteName] = useState(asString(settingMap.get("site_name")?.value, "Eventrix"));
  const [supportEmail, setSupportEmail] = useState(asString(settingMap.get("support_email")?.value, "support@eventrix.com"));
  const [maintenanceMode, setMaintenanceMode] = useState(asBoolean(settingMap.get("maintenance_mode")?.value, false));
  const [allowSignups, setAllowSignups] = useState(asBoolean(settingMap.get("allow_signups")?.value, true));
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(asNumber(settingMap.get("session_timeout_minutes")?.value, 60));

  const [templates, setTemplates] = useState<EmailTemplateItem[]>(initialTemplates);
  const [selectedTemplateName, setSelectedTemplateName] = useState(initialTemplates[0]?.name ?? "welcome");
  const [templateTestRecipient, setTemplateTestRecipient] = useState("");

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.name === selectedTemplateName) ?? null,
    [templates, selectedTemplateName],
  );

  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationScheduleAt, setNotificationScheduleAt] = useState("");
  const [notificationRole, setNotificationRole] = useState<"ALL" | "STUDENT" | "ORGANIZER" | "ADMIN">("ALL");
  const [campaigns, setCampaigns] = useState<NotificationCampaignItem[]>(
    initialCampaigns.map((campaign) => ({
      id: campaign.id,
      title: campaign.title,
      role: campaign.role,
      status: campaign.status,
      scheduledFor: campaign.scheduledFor ? new Date(campaign.scheduledFor).toISOString() : null,
      sentAt: campaign.sentAt ? new Date(campaign.sentAt).toISOString() : null,
      recipientsCount: campaign.recipientsCount,
      createdAt: new Date(campaign.createdAt).toISOString(),
    })),
  );
  const [busy, setBusy] = useState(false);

  const onSaveGeneral = async () => {
    try {
      setBusy(true);
      await Promise.all([
        saveSetting("site_name", "general", siteName, "Platform name shown in metadata and UI"),
        saveSetting("support_email", "general", supportEmail, "Primary support contact"),
        saveSetting("maintenance_mode", "general", maintenanceMode, "When enabled, non-admin traffic can be restricted"),
      ]);
      toast({ title: "General settings updated", variant: "success" });
    } catch (error) {
      toast({ title: "Could not save settings", description: error instanceof Error ? error.message : undefined, variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  const onSaveSecurity = async () => {
    try {
      setBusy(true);
      await Promise.all([
        saveSetting("allow_signups", "security", allowSignups, "Controls whether new accounts can sign up"),
        saveSetting("session_timeout_minutes", "security", sessionTimeoutMinutes, "Default user session timeout"),
      ]);
      toast({ title: "Security settings updated", variant: "success" });
    } catch (error) {
      toast({ title: "Could not save settings", description: error instanceof Error ? error.message : undefined, variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  const onSaveTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setBusy(true);
      await saveTemplate(selectedTemplate);
      toast({ title: "Template updated", variant: "success" });
    } catch (error) {
      toast({ title: "Could not save template", description: error instanceof Error ? error.message : undefined, variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  const onSendTemplateTest = async () => {
    if (!selectedTemplateName || !templateTestRecipient.trim()) {
      toast({ title: "Template and recipient email are required", variant: "error" });
      return;
    }

    try {
      setBusy(true);
      await sendTemplateTestEmail(selectedTemplateName, templateTestRecipient.trim());
      toast({ title: "Test email sent", variant: "success" });
    } catch (error) {
      toast({
        title: "Could not send test email",
        description: error instanceof Error ? error.message : undefined,
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  const onSendNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      toast({ title: "Notification title and message are required", variant: "error" });
      return;
    }

    try {
      setBusy(true);
      const scheduledFor = notificationScheduleAt ? new Date(notificationScheduleAt).toISOString() : undefined;
      const { createdCount, scheduled, campaignId } = await broadcastOrScheduleSystemMessage({
        title: notificationTitle.trim(),
        message: notificationMessage.trim(),
        role: notificationRole,
        scheduledFor,
      });

      if (campaignId) {
        setCampaigns((prev) => [
          {
            id: campaignId,
            title: notificationTitle.trim(),
            role: notificationRole,
            status: scheduled ? "SCHEDULED" : "SENT",
            scheduledFor: scheduledFor ?? null,
            sentAt: scheduled ? null : new Date().toISOString(),
            recipientsCount: createdCount,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      }

      toast({
        title: scheduled
          ? "Notification scheduled successfully"
          : `Notification sent to ${createdCount} users`,
        variant: "success",
      });

      setNotificationTitle("");
      setNotificationMessage("");
      setNotificationScheduleAt("");
    } catch (error) {
      toast({ title: "Could not send notification", description: error instanceof Error ? error.message : undefined, variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">General</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Site name
            <input
              value={siteName}
              onChange={(event) => setSiteName(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-100 dark:focus:ring-gray-800"
            />
          </label>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Support email
            <input
              type="email"
              value={supportEmail}
              onChange={(event) => setSupportEmail(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-100 dark:focus:ring-gray-800"
            />
          </label>
        </div>
        <label className="mt-3 inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
          <input
            type="checkbox"
            checked={maintenanceMode}
            onChange={(event) => setMaintenanceMode(event.target.checked)}
          />
          Enable maintenance mode
        </label>
        <div className="mt-4">
          <Button onClick={onSaveGeneral} disabled={busy}>Save General Settings</Button>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Security</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
            <input
              type="checkbox"
              checked={allowSignups}
              onChange={(event) => setAllowSignups(event.target.checked)}
            />
            Allow new signups
          </label>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Session timeout (minutes)
            <input
              type="number"
              min={5}
              max={1440}
              value={sessionTimeoutMinutes}
              onChange={(event) => setSessionTimeoutMinutes(Number(event.target.value) || 60)}
              className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-100 dark:focus:ring-gray-800"
            />
          </label>
        </div>
        <div className="mt-4">
          <Button onClick={onSaveSecurity} disabled={busy}>Save Security Settings</Button>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Email Templates</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Template
            <select
              value={selectedTemplateName}
              onChange={(event) => setSelectedTemplateName(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-100 dark:focus:ring-gray-800"
            >
              {templates.map((template) => (
                <option key={template.name} value={template.name}>{template.name}</option>
              ))}
            </select>
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 sm:mt-8">
            <input
              type="checkbox"
              checked={selectedTemplate?.enabled ?? true}
              onChange={(event) => {
                setTemplates((prev) =>
                  prev.map((template) =>
                    template.name === selectedTemplateName ? { ...template, enabled: event.target.checked } : template,
                  ),
                );
              }}
            />
            Enabled
          </label>
        </div>

        {selectedTemplate ? (
          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Subject
              <input
                value={selectedTemplate.subject}
                onChange={(event) =>
                  setTemplates((prev) =>
                    prev.map((template) =>
                      template.name === selectedTemplateName ? { ...template, subject: event.target.value } : template,
                    ),
                  )
                }
                className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-100 dark:focus:ring-gray-800"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Body
              <textarea
                rows={8}
                value={selectedTemplate.body}
                onChange={(event) =>
                  setTemplates((prev) =>
                    prev.map((template) =>
                      template.name === selectedTemplateName ? { ...template, body: event.target.value } : template,
                    ),
                  )
                }
                className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-100 dark:focus:ring-gray-800"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Variables (comma separated)
              <input
                value={(selectedTemplate.variables || []).join(", ")}
                onChange={(event) =>
                  setTemplates((prev) =>
                    prev.map((template) =>
                      template.name === selectedTemplateName
                        ? {
                            ...template,
                            variables: event.target.value
                              .split(",")
                              .map((value) => value.trim())
                              .filter(Boolean),
                          }
                        : template,
                    ),
                  )
                }
                className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-100 dark:focus:ring-gray-800"
              />
            </label>
            <Button onClick={onSaveTemplate} disabled={busy}>Save Template</Button>
            <div className="rounded-md border border-dashed border-gray-300 p-3 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Send test email</p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  value={templateTestRecipient}
                  onChange={(event) => setTemplateTestRecipient(event.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-100 dark:focus:ring-gray-800"
                />
                <Button onClick={onSendTemplateTest} disabled={busy}>Send Test</Button>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">System Notification</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Target role
            <select
              value={notificationRole}
              onChange={(event) => setNotificationRole(event.target.value as "ALL" | "STUDENT" | "ORGANIZER" | "ADMIN")}
              className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-100 dark:focus:ring-gray-800"
            >
              <option value="ALL">All users</option>
              <option value="STUDENT">Students</option>
              <option value="ORGANIZER">Organizers</option>
              <option value="ADMIN">Admins</option>
            </select>
          </label>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Title
            <input
              value={notificationTitle}
              onChange={(event) => setNotificationTitle(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-100 dark:focus:ring-gray-800"
            />
          </label>
        </div>
        <label className="mt-3 block text-sm font-medium text-gray-700 dark:text-gray-200">
          Message
          <textarea
            rows={4}
            value={notificationMessage}
            onChange={(event) => setNotificationMessage(event.target.value)}
            className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-100 dark:focus:ring-gray-800"
          />
        </label>
        <label className="mt-3 block text-sm font-medium text-gray-700 dark:text-gray-200">
          Schedule (optional)
          <input
            type="datetime-local"
            value={notificationScheduleAt}
            onChange={(event) => setNotificationScheduleAt(event.target.value)}
            className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-100 dark:focus:ring-gray-800"
          />
        </label>
        <div className="mt-4">
          <Button onClick={onSendNotification} disabled={busy}>
            {notificationScheduleAt ? "Schedule Notification" : "Send Notification"}
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Notification Campaign History</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-2 py-2 font-medium text-gray-700 dark:text-gray-300">Title</th>
                <th className="px-2 py-2 font-medium text-gray-700 dark:text-gray-300">Role</th>
                <th className="px-2 py-2 font-medium text-gray-700 dark:text-gray-300">Status</th>
                <th className="px-2 py-2 font-medium text-gray-700 dark:text-gray-300">Recipients</th>
                <th className="px-2 py-2 font-medium text-gray-700 dark:text-gray-300">Scheduled</th>
                <th className="px-2 py-2 font-medium text-gray-700 dark:text-gray-300">Sent</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-2 py-4 text-center text-gray-500 dark:text-gray-400">
                    No campaigns yet.
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-gray-100 dark:border-gray-900/80">
                    <td className="px-2 py-2 text-gray-800 dark:text-gray-200">{campaign.title}</td>
                    <td className="px-2 py-2 text-gray-700 dark:text-gray-300">{campaign.role}</td>
                    <td className="px-2 py-2 text-gray-700 dark:text-gray-300">{campaign.status}</td>
                    <td className="px-2 py-2 text-gray-700 dark:text-gray-300">{campaign.recipientsCount}</td>
                    <td className="px-2 py-2 text-gray-700 dark:text-gray-300">{formatDateTime(campaign.scheduledFor)}</td>
                    <td className="px-2 py-2 text-gray-700 dark:text-gray-300">{formatDateTime(campaign.sentAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
