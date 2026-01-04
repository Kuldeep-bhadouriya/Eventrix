"use client";

import { useMemo, useState } from "react";
import { UserRole } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";
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

async function patchUserStatus(userId: string, status: UserStatusValue) {
  const res = await fetch(`/api/admin/users/${userId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const json = await res.json();
  if (!res.ok || !json?.success) {
    throw new Error(json?.error?.message ?? "Request failed");
  }
}

async function bulkUpdate(userIds: string[], action: "suspend" | "activate" | "ban" | "unban") {
  const res = await fetch(`/api/admin/users/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userIds, action }),
  });
  const json = await res.json();
  if (!res.ok || !json?.success) {
    throw new Error(json?.error?.message ?? "Request failed");
  }
}

export function UsersTableClient({ initialUsers }: { initialUsers: AdminUserRow[] }) {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUserRow[]>(initialUsers);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);

  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => k),
    [selected],
  );

  const allChecked = users.length > 0 && selectedIds.length === users.length;

  const setStatusLocal = (userId: string, status: UserStatusValue) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status } : u)));
  };

  const onToggleAll = (checked: boolean) => {
    const next: Record<string, boolean> = {};
    for (const u of users) next[u.id] = checked;
    setSelected(next);
  };

  const onBulk = async (action: "suspend" | "activate" | "ban" | "unban") => {
    if (selectedIds.length === 0) return;
    try {
      setBusy(true);
      await bulkUpdate(selectedIds, action);

      const statusMap: Record<typeof action, UserStatusValue> = {
        suspend: "SUSPENDED",
        activate: "ACTIVE",
        ban: "BANNED",
        unban: "ACTIVE",
      };

      setUsers((prev) => prev.map((u) => (selectedIds.includes(u.id) ? { ...u, status: statusMap[action] } : u)));
      toast({ title: "Bulk action completed", variant: "success" });
      setSelected({});
    } catch (e) {
      toast({ title: "Bulk action failed", description: e instanceof Error ? e.message : undefined, variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {selectedIds.length} selected
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" disabled={busy || selectedIds.length === 0} onClick={() => onBulk("activate")}>
            Activate
          </Button>
          <Button variant="outline" size="sm" disabled={busy || selectedIds.length === 0} onClick={() => onBulk("suspend")}>
            Suspend
          </Button>
          <Button variant="outline" size="sm" disabled={busy || selectedIds.length === 0} onClick={() => onBulk("ban")}>
            Ban
          </Button>
          <Button variant="outline" size="sm" disabled={busy || selectedIds.length === 0} onClick={() => onBulk("unban")}>
            Unban
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900/40">
            <tr>
              <th scope="col" className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  aria-label="Select all users"
                  checked={allChecked}
                  onChange={(e) => onToggleAll(e.target.checked)}
                />
              </th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">User</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">Email</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">Role</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">Status</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">Verified</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">Joined</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">Last active</th>
              <th scope="col" className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950/30">
            {users.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-gray-600 dark:text-gray-300">No users found.</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Select ${u.name}`}
                      checked={Boolean(selected[u.id])}
                      onChange={(e) => setSelected((p) => ({ ...p, [u.id]: e.target.checked }))}
                    />
                  </td>
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
                  <td className="px-4 py-3"><UserStatusBadge status={u.status} /></td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{u.emailVerified ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{u.joinedAt}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{u.lastActive ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <a href={`/admin/users/${u.id}`}>View</a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busy}
                        onClick={async () => {
                          try {
                            setBusy(true);
                            const next: UserStatusValue = u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
                            await patchUserStatus(u.id, next);
                            setStatusLocal(u.id, next);
                            toast({ title: "User updated", variant: "success" });
                          } catch (e) {
                            toast({ title: "Update failed", description: e instanceof Error ? e.message : undefined, variant: "error" });
                          } finally {
                            setBusy(false);
                          }
                        }}
                      >
                        {u.status === "ACTIVE" ? "Suspend" : "Activate"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busy}
                        onClick={async () => {
                          try {
                            setBusy(true);
                            const next: UserStatusValue = u.status === "BANNED" ? "ACTIVE" : "BANNED";
                            await patchUserStatus(u.id, next);
                            setStatusLocal(u.id, next);
                            toast({ title: "User updated", variant: "success" });
                          } catch (e) {
                            toast({ title: "Update failed", description: e instanceof Error ? e.message : undefined, variant: "error" });
                          } finally {
                            setBusy(false);
                          }
                        }}
                      >
                        {u.status === "BANNED" ? "Unban" : "Ban"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
