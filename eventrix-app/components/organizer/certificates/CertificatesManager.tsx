"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";

type EventRow = {
  id: string;
  title: string;
  date: string;
};

type TemplateRow = {
  id: string;
  name: string;
  size: number;
  createdAt: string;
  url: string;
};

type CertificateRow = {
  id: string;
  issuedAt: string;
  downloadUrl: string | null;
  templateUrl: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export function CertificatesManager() {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [issued, setIssued] = useState<CertificateRow[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loadingIssued, setLoadingIssued] = useState(false);

  useEffect(() => {
    fetch("/api/organizer/events?limit=100")
      .then((r) => r.json())
      .then((json) => {
        const items = (json?.data ?? []) as Array<{ id: string; title: string; date: string }>;
        setEvents(items);
        if (items.length > 0) setSelectedEvent((prev) => prev || items[0].id);
      })
      .catch(() => {
        toast({ title: "Failed to load organizer events", variant: "error" });
      });
  }, [toast]);

  const loadTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/organizer/certificates/templates");
      const json = await res.json();
      const items = (json?.data ?? []) as TemplateRow[];
      setTemplates(items);
      if (items.length > 0) setSelectedTemplate((prev) => prev || items[0].url);
    } catch {
      toast({ title: "Failed to load templates", variant: "error" });
    }
  }, [toast]);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  const loadIssued = useCallback(async (eventId: string) => {
    if (!eventId) return;

    setLoadingIssued(true);
    try {
      const res = await fetch(`/api/organizer/events/${eventId}/certificates`);
      const json = await res.json();
      setIssued((json?.data ?? []) as CertificateRow[]);
    } catch {
      toast({ title: "Failed to load issued certificates", variant: "error" });
    } finally {
      setLoadingIssued(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!selectedEvent) return;
    void loadIssued(selectedEvent);
  }, [selectedEvent, loadIssued]);

  const selectedEventMeta = useMemo(
    () => events.find((e) => e.id === selectedEvent) ?? null,
    [events, selectedEvent],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Certificates</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">Manage templates and issue event certificates.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Template library</h2>

          <div className="mt-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900">
              <span>{uploading ? "Uploading..." : "Upload template"}</span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,image/*"
                disabled={uploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  setUploading(true);
                  try {
                    const form = new FormData();
                    form.append("file", file);

                    const res = await fetch("/api/organizer/certificates/upload-template", {
                      method: "POST",
                      body: form,
                    });

                    if (!res.ok) throw new Error();
                    toast({ title: "Template uploaded", variant: "success" });
                    await loadTemplates();
                  } catch {
                    toast({ title: "Template upload failed", variant: "error" });
                  } finally {
                    setUploading(false);
                    e.target.value = "";
                  }
                }}
              />
            </label>
          </div>

          <div className="mt-4 space-y-2">
            {templates.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-300">No templates uploaded yet.</p>
            ) : (
              templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                    selectedTemplate === template.url
                      ? "border-gray-900 bg-gray-50 dark:border-gray-100 dark:bg-gray-900"
                      : "border-gray-200 dark:border-gray-800"
                  }`}
                  onClick={() => setSelectedTemplate(template.url)}
                >
                  <div className="font-medium text-gray-900 dark:text-gray-100">{template.name}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    {(template.size / 1024).toFixed(1)} KB • {new Date(template.createdAt).toLocaleString()}
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Issue certificates</h2>

          <div className="mt-3 space-y-3">
            <select
              className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm dark:border-gray-800 dark:bg-gray-950"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
            >
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>

            <Button
              type="button"
              className="w-full"
              disabled={!selectedEvent}
              onClick={async () => {
                try {
                  const res = await fetch(`/api/organizer/events/${selectedEvent}/certificates/generate-bulk`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ templateUrl: selectedTemplate || undefined }),
                  });
                  if (!res.ok) throw new Error();
                  toast({ title: "Certificates generated", variant: "success" });
                  await loadIssued(selectedEvent);
                } catch {
                  toast({ title: "Certificate generation failed", variant: "error" });
                }
              }}
            >
              Generate for attended participants
            </Button>
          </div>

          {selectedEventMeta ? (
            <p className="mt-3 text-xs text-gray-600 dark:text-gray-300">
              Selected event: {selectedEventMeta.title} ({new Date(selectedEventMeta.date).toLocaleDateString()})
            </p>
          ) : null}
        </Card>
      </div>

      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Issued certificates</h2>
          <Button type="button" variant="outline" onClick={() => selectedEvent && loadIssued(selectedEvent)}>
            Refresh
          </Button>
        </div>

        {loadingIssued ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">Loading certificates...</p>
        ) : issued.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">No certificates issued yet for this event.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="py-2 pr-2">Participant</th>
                  <th className="py-2 pr-2">Email</th>
                  <th className="py-2 pr-2">Issued at</th>
                  <th className="py-2 pr-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {issued.map((row) => (
                  <tr key={row.id} className="border-t border-gray-200 dark:border-gray-800">
                    <td className="py-2 pr-2">{row.user.name}</td>
                    <td className="py-2 pr-2">{row.user.email}</td>
                    <td className="py-2 pr-2">{new Date(row.issuedAt).toLocaleString()}</td>
                    <td className="py-2 pr-2">
                      <div className="flex items-center gap-2">
                        {row.downloadUrl ? (
                          <Button asChild size="sm" variant="outline">
                            <a href={row.downloadUrl} target="_blank" rel="noreferrer">
                              Open
                            </a>
                          </Button>
                        ) : null}
                        <Button asChild size="sm" variant="outline">
                          <a href={`/api/organizer/certificates/${row.id}/download`}>Download</a>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
