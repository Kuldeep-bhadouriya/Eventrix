import Link from "next/link";
import { notFound } from "next/navigation";
import { ReportStatus } from "@prisma/client";

import { EventReviewActionsClient } from "@/components/admin/EventReviewActionsClient";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { prisma } from "@/lib/db";

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

export default async function AdminEventReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isDatabaseAvailable()) {
    return (
      <div className="space-y-6">
        <DashboardSection title="Event Review" description="Moderation and event details">
          <></>
        </DashboardSection>
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-200">
          DATABASE_URL is not configured; event review data is unavailable.
        </div>
      </div>
    );
  }

  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      category: true,
      venue: true,
      date: true,
      time: true,
      endTime: true,
      capacity: true,
      registeredCount: true,
      createdAt: true,
      organizer: {
        select: {
          id: true,
          organizationName: true,
          verified: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      reports: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          reason: true,
          message: true,
          status: true,
          priority: true,
          createdAt: true,
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  const openReports = event.reports.filter(
    (report) => report.status === ReportStatus.OPEN || report.status === ReportStatus.INVESTIGATING,
  ).length;

  return (
    <div className="space-y-6">
      <DashboardSection
        title={event.title}
        description="Review event details, reports, and moderation actions"
        action={
          <Button asChild variant="outline">
            <Link href={`/events/${event.id}`}>Open Public Page</Link>
          </Button>
        }
      >
        <></>
      </DashboardSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard title="Event Details">
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600 dark:text-gray-300">Status</dt>
              <dd className="text-gray-900 dark:text-gray-100">{event.status}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600 dark:text-gray-300">Category</dt>
              <dd className="text-gray-900 dark:text-gray-100">{event.category}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600 dark:text-gray-300">Date</dt>
              <dd className="text-gray-900 dark:text-gray-100">{event.date.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600 dark:text-gray-300">Venue</dt>
              <dd className="text-gray-900 dark:text-gray-100">{event.venue}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600 dark:text-gray-300">Capacity</dt>
              <dd className="text-gray-900 dark:text-gray-100">
                {event.registeredCount}/{event.capacity}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600 dark:text-gray-300">Created</dt>
              <dd className="text-gray-900 dark:text-gray-100">{event.createdAt.toLocaleString()}</dd>
            </div>
          </dl>
          <p className="mt-4 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200">{event.description}</p>
        </DashboardCard>

        <DashboardCard title="Organizer">
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600 dark:text-gray-300">Organization</dt>
              <dd className="text-gray-900 dark:text-gray-100">{event.organizer.organizationName}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600 dark:text-gray-300">Contact</dt>
              <dd className="text-gray-900 dark:text-gray-100">{event.organizer.user.email}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600 dark:text-gray-300">Verified</dt>
              <dd className="text-gray-900 dark:text-gray-100">{event.organizer.verified ? "Yes" : "No"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600 dark:text-gray-300">Open Reports</dt>
              <dd className="text-gray-900 dark:text-gray-100">{openReports}</dd>
            </div>
          </dl>
        </DashboardCard>
      </div>

      <DashboardCard title="Moderation Actions">
        <EventReviewActionsClient eventId={event.id} initialStatus={event.status} />
      </DashboardCard>

      <DashboardCard title="Recent Reports" description="Most recent moderation reports for this event">
        {event.reports.length === 0 ? (
          <div className="text-sm text-gray-600 dark:text-gray-300">No reports found for this event.</div>
        ) : (
          <div className="space-y-2">
            {event.reports.map((report) => (
              <div key={report.id} className="rounded-md border border-gray-200 p-3 text-sm dark:border-gray-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium text-gray-900 dark:text-gray-100">{report.reason}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{report.createdAt.toLocaleString()}</div>
                </div>
                <div className="mt-1 text-gray-700 dark:text-gray-200">{report.message || "No additional details."}</div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {report.status} • {report.priority} • Reporter: {report.reporter?.email ?? "Unknown"}
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
