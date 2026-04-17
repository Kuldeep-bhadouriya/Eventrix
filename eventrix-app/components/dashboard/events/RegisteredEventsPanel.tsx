"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownUp } from "lucide-react";

import {
  type ApiEnvelope,
  type RegisteredEventItem,
  type RegistrationSort,
  type RegistrationTab,
  type RegistrationsPagination,
  type SortOrder,
} from "@/components/dashboard/events/types";
import { EventTabs } from "@/components/dashboard/events/EventTabs";
import { EventSearch } from "@/components/dashboard/events/EventSearch";
import { RegisteredEventCard } from "@/components/dashboard/events/RegisteredEventCard";
import { RegisteredEventCardSkeleton } from "@/components/dashboard/events/RegisteredEventCardSkeleton";
import { CancelRegistrationModal } from "@/components/dashboard/events/CancelRegistrationModal";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LoadingState } from "@/components/dashboard/LoadingState";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 8;

function createPageList(page: number, totalPages: number): number[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 3) return [1, 2, 3, 4, 5];
  if (page >= totalPages - 2) return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [page - 2, page - 1, page, page + 1, page + 2];
}

export function RegisteredEventsPanel() {
  const [items, setItems] = useState<RegisteredEventItem[]>([]);
  const [pagination, setPagination] = useState<RegistrationsPagination>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [tab, setTab] = useState<RegistrationTab>("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<RegistrationSort>("date");
  const [order, setOrder] = useState<SortOrder>("asc");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedForCancel, setSelectedForCancel] = useState<RegisteredEventItem | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    setPagination((current) => ({ ...current, page: 1 }));
  }, [tab, searchQuery, sort, order]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchRegistrations() {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const params = new URLSearchParams({
          tab,
          sort,
          order,
          page: String(pagination.page),
          limit: String(PAGE_SIZE),
        });

        if (searchQuery) {
          params.set("search", searchQuery);
        }

        const res = await fetch(`/api/user/registrations?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        const json = (await res.json()) as ApiEnvelope<RegisteredEventItem[]>;

        if (!res.ok || !json.success) {
          throw new Error(json.error?.message ?? "Could not fetch your registrations.");
        }

        const data = json.data ?? [];
        const nextPagination = json.meta?.pagination;

        setItems(data);
        setPagination((current) => ({
          ...current,
          ...(nextPagination ?? {
            total: data.length,
            totalPages: data.length > 0 ? 1 : 0,
            hasNext: false,
            hasPrev: false,
          }),
        }));

        if (nextPagination && nextPagination.totalPages > 0 && pagination.page > nextPagination.totalPages) {
          setPagination((current) => ({ ...current, page: nextPagination.totalPages }));
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Could not fetch your registrations.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void fetchRegistrations();
    return () => controller.abort();
  }, [tab, searchQuery, sort, order, pagination.page, reloadKey]);

  const pageNumbers = useMemo(
    () => createPageList(pagination.page, pagination.totalPages),
    [pagination.page, pagination.totalPages],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white/85 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <EventTabs value={tab} onChange={setTab} />
          <div className="inline-flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="dashboard-events-sort">
              Sort
            </label>
            <select
              id="dashboard-events-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value as RegistrationSort)}
              disabled={loading}
              className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="status">Status</option>
            </select>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOrder((current) => (current === "asc" ? "desc" : "asc"))}
              aria-label="Toggle sort order"
              disabled={loading}
            >
              <ArrowDownUp className="h-4 w-4" />
              {order === "asc" ? "Asc" : "Desc"}
            </Button>
          </div>
        </div>

        <EventSearch value={searchInput} onChange={setSearchInput} onClear={() => setSearchInput("")} />

        <div className="text-sm text-slate-600 dark:text-slate-300" aria-live="polite">
          {loading ? "Loading events..." : `${pagination.total} result${pagination.total === 1 ? "" : "s"}`}
        </div>
      </div>

      {loading && items.length === 0 ? (
        <div className="space-y-3">
          <LoadingState label="Loading your registered events..." />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RegisteredEventCardSkeleton />
            <RegisteredEventCardSkeleton />
          </div>
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300" role="status" aria-live="polite">
          {successMessage}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300" role="alert">
          {error}
          <Button
            type="button"
            variant="link"
            className="ml-1 h-auto p-0"
            onClick={() => setReloadKey((current) => current + 1)}
          >
            Retry
          </Button>
        </div>
      ) : null}

      {!loading && items.length === 0 ? (
        <EmptyState
          title="No registrations found"
          description="Try changing filters, or explore new events to register."
          action={
            <Button asChild>
              <Link href="/events">Browse events</Link>
            </Button>
          }
        />
      ) : null}

      {items.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <RegisteredEventCard
              key={item.registrationId}
              item={item}
              onCancel={(candidate) => setSelectedForCancel(candidate)}
            />
          ))}
        </div>
      ) : null}

      {pagination.totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!pagination.hasPrev || loading}
            onClick={() => setPagination((current) => ({ ...current, page: Math.max(1, current.page - 1) }))}
          >
            Previous
          </Button>

          {pageNumbers.map((pageNumber) => (
            <Button
              key={pageNumber}
              type="button"
              size="sm"
              variant={pageNumber === pagination.page ? "default" : "outline"}
              onClick={() => setPagination((current) => ({ ...current, page: pageNumber }))}
              disabled={loading}
            >
              {pageNumber}
            </Button>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!pagination.hasNext || loading}
            onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))}
          >
            Next
          </Button>
        </div>
      ) : null}

      <CancelRegistrationModal
        open={Boolean(selectedForCancel)}
        eventId={selectedForCancel?.event.id}
        eventTitle={selectedForCancel?.event.title}
        onClose={() => setSelectedForCancel(null)}
        onConfirmed={() => {
          setSuccessMessage("Registration cancelled successfully.");
          setReloadKey((current) => current + 1);
        }}
      />
    </div>
  );
}
