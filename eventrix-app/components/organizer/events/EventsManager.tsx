"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";

import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { EventFilters } from "@/components/organizer/events/EventFilters";
import { EventsTable, type OrganizerEventRow } from "@/components/organizer/events/EventsTable";
import { EventsGrid } from "@/components/organizer/events/EventsGrid";
import { BulkActions } from "@/components/organizer/events/BulkActions";
import { DeleteEventModal } from "@/components/organizer/events/DeleteEventModal";
import { CancelEventModal } from "@/components/organizer/events/CancelEventModal";
import { EventQuickView } from "@/components/organizer/events/EventQuickView";

type Paginated<T> = {
  success: boolean;
  data: T;
  meta?: { pagination?: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean } };
};

type OrganizerEventsApiRow = {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  status: string;
  registeredCount: number;
  capacity: number;
  category: string;
};

export function EventsManager() {
  const { toast } = useToast();
  const [view, setView] = useState<"table" | "grid">("table");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<OrganizerEventRow[]>([]);
  const [pagination, setPagination] = useState<{ page: number; totalPages: number; total: number }>(
    { page: 1, totalPages: 1, total: 0 },
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [deleteTarget, setDeleteTarget] = useState<OrganizerEventRow | null>(null);
  const [cancelTarget, setCancelTarget] = useState<OrganizerEventRow | null>(null);
  const [quickView, setQuickView] = useState<OrganizerEventRow | null>(null);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (status) p.set("status", status);
    if (category) p.set("category", category);
    p.set("page", String(page));
    p.set("limit", "10");
    return p.toString();
  }, [query, status, category, page]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/organizer/events?${qs}`)
      .then((r) => r.json())
      .then((json: Paginated<OrganizerEventsApiRow[]>) => {
        if (cancelled) return;
        const rows: OrganizerEventRow[] = (json.data ?? []).map((e) => ({
          id: e.id,
          title: e.title,
          date: e.date ? format(new Date(e.date), "PPP") : "—",
          time: e.time,
          status: e.status,
          registeredCount: e.registeredCount,
          capacity: e.capacity,
          category: e.category,
        }));
        setEvents(rows);
        const meta = json.meta?.pagination;
        setPagination({ page: meta?.page ?? 1, totalPages: meta?.totalPages ?? 1, total: meta?.total ?? rows.length });
        setSelected(new Set());
      })
      .catch(() => {
        if (cancelled) return;
        toast({ title: "Failed to load events", variant: "error" });
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [qs, toast]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function bulk(action: "publish" | "cancel" | "delete") {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    try {
      const res = await fetch("/api/organizer/events/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Bulk action completed", variant: "success" });
      setPage(1);
      setSelected(new Set());
      // refresh
      setLoading(true);
      const r = await fetch(`/api/organizer/events?${qs}`);
      const json: Paginated<OrganizerEventsApiRow[]> = await r.json();
      const rows: OrganizerEventRow[] = (json.data ?? []).map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date ? format(new Date(e.date), "PPP") : "—",
        time: e.time,
        status: e.status,
        registeredCount: e.registeredCount,
        capacity: e.capacity,
        category: e.category,
      }));
      setEvents(rows);
      const meta = json.meta?.pagination;
      setPagination({ page: meta?.page ?? 1, totalPages: meta?.totalPages ?? 1, total: meta?.total ?? rows.length });
    } catch {
      toast({ title: "Bulk action failed", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function deleteOne(e: OrganizerEventRow) {
    try {
      const res = await fetch(`/api/organizer/events/${e.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ title: "Event deleted", variant: "success" });
      setDeleteTarget(null);
      setPage(1);
    } catch {
      toast({ title: "Delete failed", variant: "error" });
    }
  }

  async function cancelOne(e: OrganizerEventRow) {
    try {
      const res = await fetch("/api/organizer/events/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [e.id] }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Event cancelled", variant: "success" });
      setCancelTarget(null);
      setPage(1);
    } catch {
      toast({ title: "Cancel failed", variant: "error" });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">Events</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Manage your events and registrations.</div>
        </div>
        <Button asChild>
          <Link href="/organizer/events/create">Create Event</Link>
        </Button>
      </div>

      <EventFilters
        view={view}
        onViewChange={setView}
        query={query}
        onQueryChange={(v) => {
          setQuery(v);
          setPage(1);
        }}
        status={status}
        onStatusChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
        category={category}
        onCategoryChange={(v) => {
          setCategory(v);
          setPage(1);
        }}
      />

      <BulkActions
        count={selected.size}
        onPublish={() => bulk("publish")}
        onCancel={() => bulk("cancel")}
        onDelete={() => bulk("delete")}
      />

      {loading ? (
        <div className="rounded-md border border-gray-200 p-6 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
          Loading events…
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-md border border-dashed border-gray-200 p-8 text-center text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
          No events found.
        </div>
      ) : view === "table" ? (
        <EventsTable
          events={events}
          selected={selected}
          onToggle={toggle}
          onQuickView={(e) => setQuickView(e)}
          onDelete={(e) => setDeleteTarget(e)}
          onCancel={(e) => setCancelTarget(e)}
        />
      ) : (
        <EventsGrid events={events} onQuickView={(e) => setQuickView(e)} />
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-gray-600 dark:text-gray-300">Total: {pagination.total}</div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" disabled={pagination.page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Prev
          </Button>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Page {pagination.page} / {pagination.totalPages}
          </div>
          <Button type="button" variant="outline" disabled={pagination.page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </div>

      <DeleteEventModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteOne(deleteTarget)}
        title={deleteTarget?.title ?? ""}
      />
      <CancelEventModal
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => cancelTarget && cancelOne(cancelTarget)}
        title={cancelTarget?.title ?? ""}
      />
      <EventQuickView open={Boolean(quickView)} onClose={() => setQuickView(null)} event={quickView} />
    </div>
  );
}
