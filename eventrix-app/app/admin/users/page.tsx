import { prisma } from "@/lib/db";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { UsersTableClient, AdminUserRow } from "@/components/admin/UsersTableClient";
import { Prisma, UserRole } from "@prisma/client";

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: { q?: string; role?: string; verified?: string; status?: string };
}) {
  const dbAvailable = isDatabaseAvailable();

  const q = (searchParams?.q ?? "").trim();
  const role = (searchParams?.role ?? "").trim();
  const verified = (searchParams?.verified ?? "").trim();
  const status = (searchParams?.status ?? "").trim();

  const roleFilter = Object.values(UserRole).includes(role as UserRole)
    ? (role as UserRole)
    : undefined;

  const statusFilter = ["ACTIVE", "SUSPENDED", "BANNED"].includes(status)
    ? (status as "ACTIVE" | "SUSPENDED" | "BANNED")
    : undefined;

  let users: AdminUserRow[] = [];

  if (dbAvailable) {
    const where: Prisma.UserWhereInput = {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(roleFilter ? { role: roleFilter } : {}),
      ...(verified === "true" ? { emailVerified: { not: null } } : {}),
      ...(verified === "false" ? { emailVerified: null } : {}),
    };

    const rows = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    users = rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
      status: "ACTIVE" as const,
      emailVerified: Boolean(u.emailVerified),
      joinedAt: u.createdAt.toLocaleDateString(),
      lastActive: null,
    }));
  }

  return (
    <div className="space-y-6">
      <DashboardSection title="Users" description="Search and review platform users">
        <></>
      </DashboardSection>

      <DashboardCard>
        <form className="grid gap-3 sm:grid-cols-3" method="get">
          <div className="sm:col-span-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Search
              <input
                name="q"
                defaultValue={q}
                placeholder="Name or email"
                className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-100 dark:focus:ring-gray-800"
              />
            </label>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Role
              <select
                name="role"
                defaultValue={role}
                className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-100 dark:focus:ring-gray-800"
              >
                <option value="">All</option>
                <option value="STUDENT">STUDENT</option>
                <option value="ORGANIZER">ORGANIZER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </label>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Verified
              <select
                name="verified"
                defaultValue={verified}
                className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-100 dark:focus:ring-gray-800"
              >
                <option value="">All</option>
                <option value="true">Verified</option>
                <option value="false">Unverified</option>
              </select>
            </label>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Status
              <select
                name="status"
                defaultValue={status}
                className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-100 dark:focus:ring-gray-800"
              >
                <option value="">All</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="BANNED">BANNED</option>
              </select>
            </label>
          </div>

          <div className="sm:col-span-3 text-xs text-gray-500 dark:text-gray-400">
            Showing up to 50 users.
          </div>
        </form>
      </DashboardCard>

      <UsersTableClient initialUsers={users} />

      {!dbAvailable ? (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-200">
          DATABASE_URL is not configured; admin data is unavailable.
        </div>
      ) : null}
    </div>
  );
}
