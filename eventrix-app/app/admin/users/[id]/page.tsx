import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isDatabaseAvailable()) {
    return (
      <div className="space-y-6">
        <DashboardSection title="User" description="User details">
          <></>
        </DashboardSection>
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-200">
          DATABASE_URL is not configured; user data is unavailable.
        </div>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      emailVerified: true,
      profileCompleted: true,
      phone: true,
      department: true,
      semester: true,
      createdAt: true,
      registrations: {
        take: 10,
        orderBy: { registeredAt: "desc" },
        select: { id: true, status: true, registeredAt: true, event: { select: { id: true, title: true } } },
      },
    },
  });

  if (!user) notFound();

  return (
    <div className="space-y-6">
      <DashboardSection title={user.name} description="User profile and recent activity">
        <></>
      </DashboardSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard title="Profile">
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600 dark:text-gray-300">Email</dt>
              <dd className="text-gray-900 dark:text-gray-100">{user.email}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600 dark:text-gray-300">Role</dt>
              <dd className="text-gray-900 dark:text-gray-100">{user.role}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600 dark:text-gray-300">Verified</dt>
              <dd className="text-gray-900 dark:text-gray-100">{user.emailVerified ? "Yes" : "No"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600 dark:text-gray-300">Profile completed</dt>
              <dd className="text-gray-900 dark:text-gray-100">{user.profileCompleted ? "Yes" : "No"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600 dark:text-gray-300">Phone</dt>
              <dd className="text-gray-900 dark:text-gray-100">{user.phone ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600 dark:text-gray-300">Department</dt>
              <dd className="text-gray-900 dark:text-gray-100">{user.department ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600 dark:text-gray-300">Semester</dt>
              <dd className="text-gray-900 dark:text-gray-100">{user.semester ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600 dark:text-gray-300">Joined</dt>
              <dd className="text-gray-900 dark:text-gray-100">{user.createdAt.toLocaleString()}</dd>
            </div>
          </dl>
        </DashboardCard>

        <DashboardCard title="Recent Registrations" description="Last 10 registrations">
          {user.registrations.length === 0 ? (
            <div className="text-sm text-gray-600 dark:text-gray-300">No registrations found.</div>
          ) : (
            <div className="space-y-2">
              {user.registrations.map((r) => (
                <div key={r.id} className="rounded-md border border-gray-200 p-3 text-sm dark:border-gray-800">
                  <div className="font-medium text-gray-900 dark:text-gray-100">{r.event.title}</div>
                  <div className="mt-1 text-gray-600 dark:text-gray-300">Status: {r.status}</div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{r.registeredAt.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>
      </div>

      <DashboardCard title="Admin Actions" description="Notes, suspension, ban, and impersonation">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Admin actions require additional user status and audit log fields. Tell me what user status fields you want (suspended/banned) and I’ll wire this up.
        </div>
      </DashboardCard>
    </div>
  );
}
