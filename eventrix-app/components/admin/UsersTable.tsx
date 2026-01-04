import { UserRole } from "@prisma/client";

import { UserActions } from "@/components/admin/UserActions";
import { UserStatusBadge, UserStatusValue } from "@/components/admin/UserStatusBadge";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  status: UserStatusValue;
  emailVerified: boolean;
  joinedAt: string;
  lastActive?: string | null;
};

export function UsersTable({ users }: { users: AdminUserRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
      <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-900/40">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">
              User
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">
              Email
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">
              Role
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">
              Status
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">
              Verified
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">
              Joined
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">
              Last active
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-200">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950/30">
          {users.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-center text-gray-600 dark:text-gray-300">
                No users found.
              </td>
            </tr>
          ) : (
            users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 overflow-hidden rounded-full border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900">
                      {u.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.avatar} alt={u.name} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium text-gray-900 dark:text-gray-100">{u.name}</div>
                      <div className="truncate text-xs text-gray-500 dark:text-gray-400">{u.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{u.email}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{u.role}</td>
                <td className="px-4 py-3">
                  <UserStatusBadge status={u.status} />
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{u.emailVerified ? "Yes" : "No"}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{u.joinedAt}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{u.lastActive ?? "—"}</td>
                <td className="px-4 py-3">
                  <UserActions userId={u.id} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
