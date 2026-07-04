"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";

import { ActionMenu } from "@/components/admin/ActionMenu";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { type Column, DataGrid } from "@/components/admin/DataGrid";
import { Avatar } from "@/components/ui/Avatar";
import { api } from "@/lib/api";
import type { AdminUserRow, Role } from "@/lib/types";

const ROLE_TONE: Record<string, string> = {
  super_admin: "bg-amber-500/10 text-amber-500",
  company_admin: "bg-[var(--admin-accent-soft)] a-accent",
  hr: "bg-emerald-500/10 text-emerald-500",
  interviewer: "bg-sky-500/10 text-sky-500",
};
const ROLES: Role[] = ["super_admin", "company_admin", "hr", "interviewer"];

export default function PlatformUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setUsers(await api<AdminUserRow[]>("/admin/users"));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function resetPassword(id: string) {
    const res = await api<{ temp_password: string }>(`/admin/users/${id}/reset-password`, { method: "POST" });
    window.alert(`Temporary password:\n\n${res.temp_password}`);
  }

  async function changeRole(id: string, role: string) {
    const updated = await api<AdminUserRow>(`/admin/users/${id}/role?role=${role}`, { method: "PATCH" });
    setUsers((rows) => rows.map((u) => (u.id === id ? updated : u)));
  }

  const columns: Column<AdminUserRow>[] = [
    {
      key: "name",
      header: "User",
      sortValue: (r) => r.name.toLowerCase(),
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={r.name} size="sm" />
          <div>
            <p className="font-medium a-text">{r.name}</p>
            <p className="text-xs a-faint">{r.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortValue: (r) => r.role,
      render: (r) => <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${ROLE_TONE[r.role] ?? "a-surface-2"}`}>{r.role}</span>,
    },
    { key: "company_name", header: "Company", sortValue: (r) => r.company_name ?? "", render: (r) => <span className="a-muted">{r.company_name ?? "—"}</span> },
    { key: "title", header: "Title", render: (r) => <span className="a-muted">{r.title ?? "—"}</span> },
    {
      key: "created_at",
      header: "Joined",
      sortValue: (r) => r.created_at,
      render: (r) => <span className="a-faint">{new Date(r.created_at).toLocaleDateString()}</span>,
    },
    {
      key: "actions",
      header: "",
      sortable: false,
      align: "right",
      render: (r) => (
        <div className="flex justify-end">
          <ActionMenu
            items={[
              { label: "Reset password", icon: KeyRound, onClick: () => resetPassword(r.id) },
              ...ROLES.filter((role) => role !== r.role).map((role) => ({
                label: `Make ${role}`,
                icon: ShieldCheck,
                onClick: () => changeRole(r.id, role),
              })),
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Platform Users" subtitle="Every user across all tenants." />
      <DataGrid
        columns={columns}
        rows={users}
        rowKey={(r) => r.id}
        loading={loading}
        search={(r) => `${r.name} ${r.email} ${r.role} ${r.company_name ?? ""}`}
        searchPlaceholder="Search users…"
        storageKey="admin-users"
      />
    </div>
  );
}
