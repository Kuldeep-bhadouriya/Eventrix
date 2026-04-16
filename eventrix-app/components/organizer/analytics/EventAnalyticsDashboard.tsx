"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";
import { RegistrationsChart } from "@/components/organizer/dashboard/RegistrationsChart";
import { RegistrationStatusChart } from "@/components/organizer/dashboard/RegistrationStatusChart";

type AnalyticsResponse = {
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    venue: string;
    status: string;
    category: string;
    capacity: number;
    registeredCount: number;
  };
  metrics: {
    totalRegistrations: number;
    attended: number;
    cancelled: number;
    certificatesIssued: number;
    attendanceRate: number;
  };
  charts: {
    registrationsOverTime: Array<{ date: string; count: number }>;
    registrationStatus: Array<{ status: string; count: number }>;
    demographics: Array<{ label: string; value: number }>;
    conversionFunnel: Array<{ stage: string; value: number }>;
  };
};

export function EventAnalyticsDashboard({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/organizer/events/${eventId}/analytics`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        setData(json?.data ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        toast({ title: "Failed to load analytics", variant: "error" });
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [eventId, toast]);

  if (loading) {
    return (
      <Card className="p-4 text-sm text-gray-600 dark:text-gray-300">
        Loading analytics...
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-4 text-sm text-gray-600 dark:text-gray-300">
        Analytics data is unavailable.
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{data.event.title}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {new Date(data.event.date).toLocaleDateString()} at {data.event.time} • {data.event.venue}
          </p>
        </div>
        <Button asChild variant="outline">
          <a href={`/api/organizer/events/${eventId}/analytics/export`}>Export report</a>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="p-4">
          <p className="text-xs text-gray-600 dark:text-gray-300">Registrations</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{data.metrics.totalRegistrations}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600 dark:text-gray-300">Attended</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{data.metrics.attended}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600 dark:text-gray-300">Cancelled</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{data.metrics.cancelled}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600 dark:text-gray-300">Certificates</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{data.metrics.certificatesIssued}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600 dark:text-gray-300">Attendance rate</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{data.metrics.attendanceRate}%</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RegistrationsChart
          data={data.charts.registrationsOverTime.map((point) => ({
            date: point.date,
            registrations: point.count,
          }))}
        />
        <RegistrationStatusChart data={data.charts.registrationStatus} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Participant demographics</h2>
          <div className="mt-4 space-y-3">
            {data.charts.demographics.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-300">No demographic data yet.</p>
            ) : (
              data.charts.demographics.map((row) => (
                <div key={row.label}>
                  <div className="mb-1 flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                    <span className="truncate">{row.label}</span>
                    <span>{row.value}</span>
                  </div>
                  <div className="h-2 rounded bg-gray-100 dark:bg-gray-900">
                    <div
                      className="h-2 rounded bg-gray-900 dark:bg-gray-100"
                      style={{ width: `${Math.max(6, (row.value / Math.max(...data.charts.demographics.map((d) => d.value), 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Conversion funnel</h2>
          <div className="mt-4 space-y-3">
            {data.charts.conversionFunnel.map((row) => (
              <div key={row.stage} className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-sm dark:border-gray-800">
                <span className="text-gray-700 dark:text-gray-200">{row.stage}</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{row.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
