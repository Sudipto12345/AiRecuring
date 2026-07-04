"use client";

import { useEffect, useState } from "react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { type Column, DataGrid } from "@/components/admin/DataGrid";
import { Avatar } from "@/components/ui/Avatar";
import { api } from "@/lib/api";
import type { AdminUserRow } from "@/lib/types";

export default function SuperAdminsPage() {
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<AdminUserRow[]>("/admin/users/super-admins")
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<AdminUserRow>[] = [
    {
      key: "name",
      header: "Super Admin",
      sortValue: (r) => r.name,
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
    { key: "title", header: "Title", render: (r) => <span className="a-muted">{r.title ?? "—"}</span> },
    {
      key: "created_at",
      header: "Joined",
      align: "right",
      sortValue: (r) => r.created_at,
      render: (r) => <span className="a-faint">{new Date(r.created_at).toLocaleDateString()}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Super Admins" subtitle="Platform owners with full control." />
      <DataGrid columns={columns} rows={rows} rowKey={(r) => r.id} loading={loading} search={(r) => `${r.name} ${r.email}`} />
    </div>
  );
}
