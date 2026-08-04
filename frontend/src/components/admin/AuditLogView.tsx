"use client";

import { useEffect, useState } from "react";

import { type Column, DataGrid } from "@/components/admin/DataGrid";
import { api } from "@/lib/api";
import type { AuditRow } from "@/lib/types";

const ACTION_TONE = (action: string) => {
  if (action.includes("delete")) return "bg-rose-500/10 text-rose-500";
  if (action.includes("impersonate")) return "bg-amber-500/10 text-amber-500";
  if (action.includes("create")) return "bg-emerald-500/10 text-emerald-500";
  return "a-accent-soft a-accent";
};

export function AuditLogView({ endpoint = "/admin/audit" }: { endpoint?: string }) {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<AuditRow[]>(endpoint)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [endpoint]);

  const columns: Column<AuditRow>[] = [
    {
      key: "action",
      header: "Action",
      sortValue: (r) => r.action,
      render: (r) => <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${ACTION_TONE(r.action)}`}>{r.action}</span>,
    },
    { key: "actor_email", header: "Actor", sortValue: (r) => r.actor_email, render: (r) => <span className="a-text">{r.actor_email}</span> },
    { key: "actor_role", header: "Role", render: (r) => <span className="a-muted">{r.actor_role}</span> },
    {
      key: "target",
      header: "Target",
      render: (r) => <span className="a-muted">{r.target_type ? `${r.target_type}:${(r.target_id ?? "").slice(0, 8)}` : "—"}</span>,
    },
    { key: "ip", header: "IP", render: (r) => <span className="a-faint">{r.ip ?? "—"}</span> },
    {
      key: "created_at",
      header: "When",
      sortValue: (r) => r.created_at,
      align: "right",
      render: (r) => <span className="a-faint">{new Date(r.created_at).toLocaleString()}</span>,
    },
  ];

  return (
    <DataGrid
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id}
      loading={loading}
      search={(r) => `${r.action} ${r.actor_email} ${r.target_type ?? ""}`}
      searchPlaceholder="Search audit log…"
      storageKey="admin-audit"
      empty="No audit entries yet."
    />
  );
}
