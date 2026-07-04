"use client";

import { useCallback, useEffect, useState } from "react";
import { Coins } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { type Column, DataGrid } from "@/components/admin/DataGrid";
import { StatWidget } from "@/components/admin/StatWidget";
import { api } from "@/lib/api";
import type { CompanyRow } from "@/lib/types";

export default function AiCreditsPage() {
  const [rows, setRows] = useState<CompanyRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setRows(await api<CompanyRow[]>("/admin/companies"));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function grant(id: string) {
    const raw = window.prompt("Grant how many credits? (1 credit = $0.01)", "1000");
    if (!raw) return;
    const credits = parseInt(raw, 10);
    if (!Number.isFinite(credits) || credits <= 0) return;
    const updated = await api<CompanyRow>(`/admin/companies/${id}/credits`, { method: "POST", body: { credits } });
    setRows((r) => r.map((x) => (x.id === id ? updated : x)));
  }

  const total = rows.reduce((a, r) => a + r.credits, 0);

  const columns: Column<CompanyRow>[] = [
    { key: "name", header: "Company", sortValue: (r) => r.name, render: (r) => <span className="font-medium a-text">{r.name}</span> },
    { key: "plan", header: "Plan", sortValue: (r) => r.plan, render: (r) => <span className="a-muted">{r.plan}</span> },
    { key: "credits", header: "Balance", align: "right", sortValue: (r) => r.credits, render: (r) => <span className="font-semibold tabular-nums a-text">{r.credits.toLocaleString()}</span> },
    {
      key: "actions",
      header: "",
      sortable: false,
      align: "right",
      render: (r) => (
        <button onClick={() => grant(r.id)} className="a-hover inline-flex items-center gap-1 rounded-lg border a-border px-2.5 py-1 text-xs a-accent">
          <Coins className="h-3.5 w-3.5" /> Grant
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <AdminPageHeader title="AI Credits" subtitle="Manage per-tenant AI credit balances and top-ups." />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatWidget label="Credits in circulation" value={total.toLocaleString()} icon={Coins} tone="amber" />
        <StatWidget label="≈ USD value" value={`$${(total * 0.01).toLocaleString()}`} icon={Coins} tone="emerald" />
        <StatWidget label="Tenants" value={rows.length} icon={Coins} />
        <StatWidget label="Low balance (<100)" value={rows.filter((r) => r.credits < 100).length} icon={Coins} tone="rose" />
      </div>
      <DataGrid columns={columns} rows={rows} rowKey={(r) => r.id} loading={loading} search={(r) => r.name} storageKey="admin-credits" />
    </div>
  );
}
