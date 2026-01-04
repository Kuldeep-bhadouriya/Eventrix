import { prisma } from "@/lib/db";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { PlatformMetricsCard } from "@/components/admin/PlatformMetricsCard";
import { GrowthChart, GrowthPoint } from "@/components/admin/GrowthChart";
import { ActivityFeed, ActivityItem } from "@/components/admin/ActivityFeed";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

function yyyyMmDd(d: Date) {
  return d.toISOString().slice(0, 10);
}

function groupByDay(dates: Date[], start: Date, days: number) {
  const map = new Map<string, number>();
  for (let i = 0; i < days; i++) {
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

export default async function AdminDashboardPage() {
  const dbAvailable = isDatabaseAvailable();

  const now = new Date();
  const days = 14;
  const start = new Date(now);
  start.setDate(now.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  let totalUsers = 0;
  let totalEvents = 0;
  let totalRegistrations = 0;
  let activeUsers = 0;

  let growth: GrowthPoint[] = [];
  let activity: ActivityItem[] = [];

  if (dbAvailable) {
    const [usersCount, eventsCount, registrationsCount] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.registration.count(),
    ]);

    totalUsers = usersCount;
    totalEvents = eventsCount;
    totalRegistrations = registrationsCount;

    const active = await prisma.session.findMany({
      where: { expires: { gt: now } },
      select: { userId: true },
      distinct: ["userId"],
    });
    activeUsers = active.length;

    const [newUsers, newEvents, newRegistrations] = await Promise.all([
      prisma.user.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true } }),
      prisma.event.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true } }),
      prisma.registration.findMany({ where: { registeredAt: { gte: start } }, select: { registeredAt: true } }),
    ]);

    const userMap = groupByDay(
      newUsers.map((u) => u.createdAt),
      start,
      days,
    );
    const eventMap = groupByDay(
      newEvents.map((e) => e.createdAt),
      start,
      days,
    );
    const regMap = groupByDay(
      newRegistrations.map((r) => r.registeredAt),
      start,
      days,
    );

    growth = Array.from(userMap.keys()).map((date) => ({
      date,
      users: userMap.get(date) ?? 0,
      events: eventMap.get(date) ?? 0,
      registrations: regMap.get(date) ?? 0,
    }));

    const [latestUsers, latestEvents] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, email: true, createdAt: true },
      }),
      prisma.event.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, title: true, createdAt: true },
      }),
    ]);

    activity = [
      ...latestUsers.map((u) => ({
        id: `user-${u.id}`,
        kind: "user" as const,
        title: `New user: ${u.name}`,
        description: u.email,
        timestamp: u.createdAt.toLocaleString(),
      })),
      ...latestEvents.map((e) => ({
        id: `event-${e.id}`,
        kind: "event" as const,
        title: `New event: ${e.title}`,
        timestamp: e.createdAt.toLocaleString(),
      })),
    ]
      .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
      .slice(0, 8);
  }

  const revenue = 0;

  return (
    <div className="space-y-6">
      <DashboardSection title="Admin Dashboard" description="Platform overview, growth, and system health">
        <></>
      </DashboardSection>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <PlatformMetricsCard label="Total users" value={String(totalUsers)} />
        <PlatformMetricsCard label="Total events" value={String(totalEvents)} />
        <PlatformMetricsCard label="Registrations" value={String(totalRegistrations)} />
        <PlatformMetricsCard
          label="Revenue"
          value={`₹${revenue}`}
          helper="Payments not configured"
        />
        <PlatformMetricsCard label="Active users" value={String(activeUsers)} helper="Active sessions" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GrowthChart title="Growth" description="Last 14 days" data={growth} />
        <ActivityFeed items={activity} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard title="Platform Health" description="API, DB, and error rate">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-gray-200 p-3 text-sm dark:border-gray-800">
              <div className="text-gray-600 dark:text-gray-300">API response time</div>
              <div className="mt-1 font-medium text-gray-900 dark:text-gray-100">—</div>
            </div>
            <div className="rounded-md border border-gray-200 p-3 text-sm dark:border-gray-800">
              <div className="text-gray-600 dark:text-gray-300">DB health</div>
              <div className="mt-1 font-medium text-gray-900 dark:text-gray-100">
                {dbAvailable ? "Connected" : "Not configured"}
              </div>
            </div>
            <div className="rounded-md border border-gray-200 p-3 text-sm dark:border-gray-800">
              <div className="text-gray-600 dark:text-gray-300">Storage</div>
              <div className="mt-1 font-medium text-gray-900 dark:text-gray-100">—</div>
            </div>
            <div className="rounded-md border border-gray-200 p-3 text-sm dark:border-gray-800">
              <div className="text-gray-600 dark:text-gray-300">Error rate</div>
              <div className="mt-1 font-medium text-gray-900 dark:text-gray-100">—</div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Quick Actions" description="Common admin tasks">
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/users">Manage users</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/events">Moderate events</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/settings">Settings</Link>
            </Button>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
