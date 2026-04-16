import Link from "next/link";

import { GrowthChart, GrowthPoint } from "@/components/admin/GrowthChart";
import { PlatformMetricsCard } from "@/components/admin/PlatformMetricsCard";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { prisma } from "@/lib/db";

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

function yyyyMmDd(d: Date) {
  return d.toISOString().slice(0, 10);
}

function parsePeriod(value: string | undefined) {
  const period = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(period) || period <= 0) return 30;
  if (period > 365) return 365;
  return period;
}

function groupByDay(dates: Date[], start: Date, days: number) {
  const map = new Map<string, number>();
  for (let i = 0; i < days; i += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    map.set(yyyyMmDd(day), 0);
  }
  for (const dt of dates) {
    const key = yyyyMmDd(dt);
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams?: { period?: string };
}) {
  const dbAvailable = isDatabaseAvailable();
  const period = parsePeriod(searchParams?.period);

  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - (period - 1));
  start.setHours(0, 0, 0, 0);

  let growth: GrowthPoint[] = [];
  let usersCount = 0;
  let eventsCount = 0;
  let registrationsCount = 0;
  let completionRatePct = 0;
  let topCategories: { category: string; count: number }[] = [];

  if (dbAvailable) {
    const [users, events, registrations] = await Promise.all([
      prisma.user.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true } }),
      prisma.event.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true, category: true, status: true } }),
      prisma.registration.findMany({ where: { registeredAt: { gte: start } }, select: { registeredAt: true, status: true } }),
    ]);

    usersCount = users.length;
    eventsCount = events.length;
    registrationsCount = registrations.length;

    const completed = registrations.filter((row) => row.status === "ATTENDED").length;
    completionRatePct = registrations.length > 0 ? Math.round((completed / registrations.length) * 100) : 0;

    const userMap = groupByDay(users.map((row) => row.createdAt), start, period);
    const eventMap = groupByDay(events.map((row) => row.createdAt), start, period);
    const regMap = groupByDay(registrations.map((row) => row.registeredAt), start, period);

    growth = Array.from(userMap.keys()).map((date) => ({
      date,
      users: userMap.get(date) ?? 0,
      events: eventMap.get(date) ?? 0,
      registrations: regMap.get(date) ?? 0,
    }));

    const categoryMap = new Map<string, number>();
    for (const event of events) {
      categoryMap.set(event.category, (categoryMap.get(event.category) ?? 0) + 1);
    }
    topCategories = Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }

  return (
    <div className="space-y-6">
      <DashboardSection
        title="Analytics"
        description="Platform trends, growth metrics, and downloadable reports"
        action={
          <Button asChild variant="outline">
            <Link href={`/api/admin/analytics/export?period=${period}`}>Export CSV</Link>
          </Button>
        }
      >
        <></>
      </DashboardSection>

      <DashboardCard>
        <form className="flex flex-wrap items-end gap-3" method="get">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Time period
            <select
              name="period"
              defaultValue={String(period)}
              className="mt-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-100 dark:focus:ring-gray-800"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="180">Last 180 days</option>
            </select>
          </label>
          <Button type="submit" variant="outline">Apply</Button>
        </form>
      </DashboardCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PlatformMetricsCard label="New users" value={String(usersCount)} helper={`${period} day window`} />
        <PlatformMetricsCard label="New events" value={String(eventsCount)} helper={`${period} day window`} />
        <PlatformMetricsCard label="Registrations" value={String(registrationsCount)} helper={`${period} day window`} />
        <PlatformMetricsCard label="Attendance rate" value={`${completionRatePct}%`} helper="Attended / registrations" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GrowthChart title="Growth Trends" description={`Daily metrics for last ${period} days`} data={growth} />

        <DashboardCard title="Top Categories" description="Most active categories by event creation">
          {topCategories.length === 0 ? (
            <div className="text-sm text-gray-600 dark:text-gray-300">No event data available for selected range.</div>
          ) : (
            <div className="space-y-2">
              {topCategories.map((item) => (
                <div key={item.category} className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-sm dark:border-gray-800">
                  <span className="text-gray-700 dark:text-gray-200">{item.category}</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>
      </div>

      {!dbAvailable ? (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-200">
          DATABASE_URL is not configured; analytics data is unavailable.
        </div>
      ) : null}
    </div>
  );
}
