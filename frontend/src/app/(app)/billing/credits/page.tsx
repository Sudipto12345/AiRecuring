"use client";

import { useEffect, useState } from "react";
import { Coins, TrendingDown, TrendingUp } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataGrid, type Column } from "@/components/admin/DataGrid";
import { StatWidget } from "@/components/admin/StatWidget";
import { api } from "@/lib/api";
import type { CreditBalance, CreditTxn } from "@/lib/types";

export default function CreditsPage() {
  const [data, setData] = useState<CreditBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<CreditBalance>("/credits")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const txns = data?.transactions ?? [];

  const columns: Column<CreditTxn>[] = [
    { key: "reason", header: "Activity", sortValue: (r) => r.reason, render: (r) => r.reason },
    { key: "model", header: "Model", render: (r) => r.model ?? "—" },
    { key: "tokens", header: "Tokens", align: "right", sortValue: (r) => r.tokens ?? 0, render: (r) => (r.tokens ?? 0).toLocaleString() },
    {
      key: "credits",
      header: "Credits",
      align: "right",
      sortValue: (r) => (r.kind === "grant" ? r.credits : -r.credits),
      render: (r) => (
        <span className={r.kind === "grant" ? "text-emerald-500" : "text-rose-500"}>
          {r.kind === "grant" ? "+" : "−"}
          {r.credits}
        </span>
      ),
    },
    { key: "balance_after", header: "Balance", align: "right", render: (r) => r.balance_after.toLocaleString() },
    {
      key: "created_at",
      header: "When",
      align: "right",
      sortValue: (r) => r.created_at,
      render: (r) => new Date(r.created_at).toLocaleString(),
    },
  ];

  return (
    <div className="space-y-5 p-4 lg:p-6">
      <AdminPageHeader title="AI Credits" subtitle="Your AI credit wallet and recent usage." />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatWidget label="Balance" value={(data?.balance ?? 0).toLocaleString()} icon={Coins} tone="accent" />
        <StatWidget label="Lifetime granted" value={(data?.lifetime_granted ?? 0).toLocaleString()} icon={TrendingUp} tone="emerald" />
        <StatWidget label="Lifetime spent" value={(data?.lifetime_spent ?? 0).toLocaleString()} icon={TrendingDown} tone="rose" />
      </div>

      <DataGrid
        columns={columns}
        rows={txns}
        rowKey={(r) => r.id}
        loading={loading}
        storageKey="company-credits"
        empty="No credit activity yet."
      />
    </div>
  );
}
