"use client";

import { ReportPriority, ReportStatus } from "@prisma/client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";

type ReportRow = {
  id: string;
  entityType: "EVENT" | "USER";
  entityId: string;
  reason: string;
  message?: string | null;
  priority: ReportPriority;
  status: ReportStatus;
  adminNotes?: string | null;
  createdAt: string;
  reporterName?: string | null;
  reporterEmail?: string | null;
  eventTitle?: string | null;
};

async function updateReport(reportId: string, status: ReportStatus) {
  const res = await fetch(`/api/admin/reports/${reportId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  const json = await res.json();
  if (!res.ok || !json?.success) {
    throw new Error(json?.error?.message ?? "Failed to update report");
  }

  return json.data.report as { status: ReportStatus };
}

function statusStyle(status: ReportStatus) {
  if (status === ReportStatus.OPEN) {
    return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300";
  }
  if (status === ReportStatus.INVESTIGATING) {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";
  }
  if (status === ReportStatus.RESOLVED) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";
  }
  return "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300";
}

function priorityStyle(priority: ReportPriority) {
  if (priority === ReportPriority.CRITICAL) return "text-red-700 dark:text-red-300";
  if (priority === ReportPriority.HIGH) return "text-orange-700 dark:text-orange-300";
  if (priority === ReportPriority.MEDIUM) return "text-blue-700 dark:text-blue-300";
  return "text-gray-700 dark:text-gray-300";
}

export function ReportsTableClient({ initialReports }: { initialReports: ReportRow[] }) {
  const { toast } = useToast();
  const [reports, setReports] = useState<ReportRow[]>(initialReports);
  const [busyId, setBusyId] = useState<string | null>(null);

  const onStatus = async (reportId: string, status: ReportStatus) => {
    try {
      setBusyId(reportId);
      const updated = await updateReport(reportId, status);
      setReports((prev) => prev.map((report) => (report.id === reportId ? { ...report, status: updated.status } : report)));
      toast({ title: "Report updated", variant: "success" });
    } catch (error) {
      toast({
        title: "Failed to update report",
        description: error instanceof Error ? error.message : "Unexpected error",
        variant: "error",
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
      <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-900/40">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">Report</th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">Target</th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">Reporter</th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">Priority</th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">Status</th>
            <th scope="col" className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-200">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950/30">
          {reports.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-gray-600 dark:text-gray-300">
                No reports found.
              </td>
            </tr>
          ) : (
            reports.map((report) => {
              const busy = busyId === report.id;
              return (
                <tr key={report.id}>
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{report.reason}</div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {report.message || "No details provided"}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{report.createdAt}</div>
                  </td>
                  <td className="px-4 py-3 align-top text-gray-700 dark:text-gray-200">
                    <div>{report.entityType}</div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{report.eventTitle || report.entityId}</div>
                  </td>
                  <td className="px-4 py-3 align-top text-gray-700 dark:text-gray-200">
                    <div>{report.reporterName || "Unknown"}</div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{report.reporterEmail || "-"}</div>
                  </td>
                  <td className={`px-4 py-3 align-top font-medium ${priorityStyle(report.priority)}`}>{report.priority}</td>
                  <td className="px-4 py-3 align-top">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyle(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => onStatus(report.id, ReportStatus.INVESTIGATING)}>
                        Investigate
                      </Button>
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => onStatus(report.id, ReportStatus.RESOLVED)}>
                        Resolve
                      </Button>
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => onStatus(report.id, ReportStatus.DISMISSED)}>
                        Dismiss
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
