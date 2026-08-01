"use client";

import { useEffect, useState } from "react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { type Column, DataGrid } from "@/components/admin/DataGrid";
import { StatWidget } from "@/components/admin/StatWidget";
import { Badge } from "@/components/ui/Badge";
import { Wallet } from "lucide-react";
import { api } from "@/lib/api";

interface ActiveSub {
  company_id: string;
  company: string;
  plan: string;
  plan_label: string;
  price_monthly: number;
  status: string;
  modules: string[];
  updated_at: string;
}

export default function ActiveSubscriptionsPage() {
  const [rows, setRows] = useState<ActiveSub[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<ActiveSub[]>("/admin/subscriptions/active")
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const mrr = rows.filter((r) => r.status === "active").reduce((a, r) => a + r.price_monthly, 0);
  const paid = rows.filter((r) => r.price_monthly > 0).length;

  const columns: Column<ActiveSub>[] = [
    { key: "company", header: "Company", sortValue: (r) => r.company, render: (r) => <span className="font-medium a-text">{r.company}</span> },
    { key: "plan_label", header: "Plan", sortValue: (r) => r.plan_label, render: (r) => <Badge tone="indigo">{r.plan_label}</Badge> },
    { key: "price_monthly", header: "MRR", align: "right", sortValue: (r) => r.price_monthly, render: (r) => <span className="tabular-nums a-text">${r.price_monthly.toLocaleString()}</span> },
    { key: "modules", header: "Modules", render: (r) => <span className="a-muted">{r.modules.length}</span> },
    { key: "status", header: "Status", sortValue: (r) => r.status, render: (r) => <Badge tone={r.status === "active" ? "green" : "rose"}>{r.status}</Badge> },
    { key: "updated_at", header: "Updated", align: "right", sortValue: (r) => r.updated_at, render: (r) => <span className="a-faint">{new Date(r.updated_at).toLocaleDateString()}</span> },
  ];

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Active Subscriptions" subtitle="Live subscription state across all tenants." />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatWidget label="Total subscriptions" value={rows.length} icon={Wallet} />
        <StatWidget label="Paying" value={paid} icon={Wallet} tone="emerald" />
        <StatWidget label="MRR" value={`$${mrr.toLocaleString()}`} icon={Wallet} tone="amber" draft />
        <StatWidget label="ARR" value={`$${(mrr * 12).toLocaleString()}`} icon={Wallet} tone="amber" draft />
      </div>
      <DataGrid columns={columns} rows={rows} rowKey={(r) => r.company_id} loading={loading} search={(r) => `${r.company} ${r.plan_label}`} storageKey="admin-active-subs" />
    </div>
  );
}
