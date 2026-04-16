"use client";

import { useEffect, useMemo, useState } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/providers/toast-provider";

type ParticipantRow = {
  id: string;
  userId: string;
  name: string;
  email: string;
  department: string | null;
  status: "REGISTERED" | "ATTENDED" | "CANCELLED";
  registeredAt: string;
  checkInTime: string | null;
  certificateIssued: boolean;
};

type ParticipantDetail = {
  registration: {
    id: string;
    status: string;
    registeredAt: string;
    checkInTime: string | null;
  };
  user: {
    id: string;
    name: string;
    email: string;
    department: string | null;
    semester: string | null;
    phone: string | null;
  };
  certificate: {
    id: string;
    issuedAt: string;
    downloadUrl: string | null;
  } | null;
};

type Paginated<T> = {
  success: boolean;
  data: T;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
};

export function ParticipantsManager({ eventId }: { eventId: string }) {
  const { toast } = useToast();
  const [rows, setRows] = useState<ParticipantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [detail, setDetail] = useState<ParticipantDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (status) p.set("status", status);
    p.set("page", String(page));
    p.set("limit", "20");
    return p.toString();
  }, [page, query, status]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`/api/organizer/events/${eventId}/participants?${queryString}`)
      .then((r) => r.json())
      .then((json: Paginated<ParticipantRow[]>) => {
        if (cancelled) return;
        setRows(json.data ?? []);
        const pagination = json.meta?.pagination;
        setTotalPages(pagination?.totalPages ?? 1);
        setTotal(pagination?.total ?? 0);
        setSelected(new Set());
        setSelectedUserIds(new Set());
      })
      .catch(() => {
        if (cancelled) return;
        toast({ title: "Failed to load participants", variant: "error" });
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [eventId, queryString, toast]);

  function toggle(row: ParticipantRow) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(row.id)) next.delete(row.id);
      else next.add(row.id);
      return next;
    });

    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(row.userId)) next.delete(row.userId);
      else next.add(row.userId);
      return next;
    });
  }

  async function checkInOne(registrationId: string) {
    const res = await fetch(`/api/organizer/events/${eventId}/participants/check-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationId }),
    });

    if (!res.ok) throw new Error("Check-in failed");
  }

  async function bulkCheckIn() {
    const registrationIds = Array.from(selected);
    if (registrationIds.length === 0) return;

    try {
      const res = await fetch(`/api/organizer/events/${eventId}/participants/bulk-check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationIds }),
      });
      if (!res.ok) throw new Error("Bulk check-in failed");
      toast({ title: "Participants checked in", variant: "success" });
      setPage(1);
    } catch {
      toast({ title: "Bulk check-in failed", variant: "error" });
    }
  }

  async function issueCertificates() {
    const userIds = Array.from(selectedUserIds);
    if (userIds.length === 0) return;

    try {
      const res = await fetch(`/api/organizer/events/${eventId}/certificates/generate-bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds }),
      });
      if (!res.ok) throw new Error("Certificate generation failed");
      toast({ title: "Certificate generation started", variant: "success" });
    } catch {
      toast({ title: "Failed to issue certificates", variant: "error" });
    }
  }

  async function sendEmail() {
    const userIds = Array.from(selectedUserIds);
    if (userIds.length === 0) return;

    try {
      const res = await fetch(`/api/organizer/events/${eventId}/participants/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds,
          subject: "Event update",
          message: "Thanks for registering. Please check your dashboard for latest updates.",
        }),
      });
      if (!res.ok) throw new Error("Email send failed");
      toast({ title: "Email queue updated", variant: "success" });
    } catch {
      toast({ title: "Could not queue email", variant: "error" });
    }
  }

  async function openDetail(userId: string) {
    setDetailLoading(true);
    setDetail(null);

    try {
      const res = await fetch(`/api/organizer/events/${eventId}/participants/${userId}`);
      const json = await res.json();
      if (!res.ok) throw new Error();
      setDetail(json.data as ParticipantDetail);
    } catch {
      toast({ title: "Failed to load participant details", variant: "error" });
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Participants</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">Manage check-ins, communication, and certificate eligibility.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={bulkCheckIn} disabled={selected.size === 0}>
            Bulk check-in
          </Button>
          <Button type="button" variant="outline" onClick={issueCertificates} disabled={selectedUserIds.size === 0}>
            Issue certificates
          </Button>
          <Button type="button" variant="outline" onClick={sendEmail} disabled={selectedUserIds.size === 0}>
            Email selected
          </Button>
          <Button asChild variant="outline">
            <a href={`/api/organizer/events/${eventId}/participants/export`}>Export CSV</a>
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="mb-4 flex flex-col gap-2 md:flex-row">
          <Input
            placeholder="Search by name or email"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
          <select
            className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm dark:border-gray-800 dark:bg-gray-950"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="REGISTERED">Registered</option>
            <option value="ATTENDED">Attended</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">Loading participants...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">No participants found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="py-2 pr-2">Select</th>
                  <th className="py-2 pr-2">Participant</th>
                  <th className="py-2 pr-2">Department</th>
                  <th className="py-2 pr-2">Status</th>
                  <th className="py-2 pr-2">Certificate</th>
                  <th className="py-2 pr-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-gray-200 dark:border-gray-800">
                    <td className="py-2 pr-2 align-top">
                      <input
                        type="checkbox"
                        checked={selected.has(row.id)}
                        onChange={() => toggle(row)}
                        aria-label={`Select ${row.name}`}
                      />
                    </td>
                    <td className="py-2 pr-2 align-top">
                      <button
                        type="button"
                        className="text-left hover:underline"
                        onClick={() => openDetail(row.userId)}
                      >
                        <div className="font-medium text-gray-900 dark:text-gray-100">{row.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">{row.email}</div>
                      </button>
                    </td>
                    <td className="py-2 pr-2 align-top text-gray-700 dark:text-gray-200">{row.department || "-"}</td>
                    <td className="py-2 pr-2 align-top text-gray-700 dark:text-gray-200">{row.status}</td>
                    <td className="py-2 pr-2 align-top text-gray-700 dark:text-gray-200">{row.certificateIssued ? "Issued" : "Not issued"}</td>
                    <td className="py-2 pr-2 align-top">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={row.status === "ATTENDED"}
                        onClick={async () => {
                          try {
                            await checkInOne(row.id);
                            toast({ title: "Checked in", variant: "success" });
                            setPage(1);
                          } catch {
                            toast({ title: "Check-in failed", variant: "error" });
                          }
                        }}
                      >
                        Check-in
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
          <span>Total: {total}</span>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Prev
            </Button>
            <span>
              Page {page} / {totalPages}
            </span>
            <Button type="button" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Participant detail</h2>
        {detailLoading ? (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Loading participant detail...</p>
        ) : detail ? (
          <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <div><span className="font-medium">Name:</span> {detail.user.name}</div>
            <div><span className="font-medium">Email:</span> {detail.user.email}</div>
            <div><span className="font-medium">Department:</span> {detail.user.department || "-"}</div>
            <div><span className="font-medium">Semester:</span> {detail.user.semester || "-"}</div>
            <div><span className="font-medium">Phone:</span> {detail.user.phone || "-"}</div>
            <div><span className="font-medium">Status:</span> {detail.registration.status}</div>
            <div><span className="font-medium">Registered:</span> {new Date(detail.registration.registeredAt).toLocaleString()}</div>
            <div><span className="font-medium">Check-in:</span> {detail.registration.checkInTime ? new Date(detail.registration.checkInTime).toLocaleString() : "Not checked in"}</div>
            <div className="sm:col-span-2"><span className="font-medium">Certificate:</span> {detail.certificate ? "Issued" : "Not issued"}</div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Select a participant to view details.</p>
        )}
      </Card>
    </div>
  );
}
