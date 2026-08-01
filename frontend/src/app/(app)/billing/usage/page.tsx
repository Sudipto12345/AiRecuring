"use client";

import { useEffect, useMemo, useState } from "react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ChartCard } from "@/components/admin/ChartCard";
import { StatWidget } from "@/components/admin/StatWidget";
import { Activity, Coins, Hash } from "lucide-react";
import { api } from "@/lib/api";
import type { CreditBalance } from "@/lib/types";

const PALETTE = ["#6366f1", "#22c55e", "#f59e0b", "#0ea5e9", "#a855f7", "#ef4444"];

export default function UsagePage() {
  const [data, setData] = useState<CreditBalance | null>(null);

  useEffect(() => {
    api<CreditBalance>("/credits")
      .then(setData)
      .catch(() => {});
  }, []);

  const debits = useMemo(() => (data?.transactions ?? []).filter((t) => t.kind === "debit"), [data]);

  const byReason = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of debits) map[t.reason] = (map[t.reason] ?? 0) + t.credits;
    return Object.entries(map).map(([label, value], i) => ({ label, value, color: PALETTE[i % PALETTE.length] }));
  }, [debits]);

  const totalSpent = debits.reduce((a, t) => a + t.credits, 0);
  const totalTokens = debits.reduce((a, t) => a + (t.tokens ?? 0), 0);

  return (
    <div className="space-y-5 p-4 lg:p-6">
      <AdminPageHeader title="Usage" subtitle="Where your AI credits are going." />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatWidget label="Credits spent (recent)" value={totalSpent.toLocaleString()} icon={Coins} tone="accent" />
        <StatWidget label="Tokens processed" value={totalTokens.toLocaleString()} icon={Hash} tone="sky" />
        <StatWidget label="Operations" value={debits.length} icon={Activity} tone="emerald" />
      </div>

      {byReason.length === 0 ? (
        <div className="a-card py-12 text-center text-sm a-faint">No usage recorded yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ChartCard title="Spend by Activity" subtitle="Credits per AI operation" type="bar" data={byReason} series={[{ key: "value", color: "#6366f1" }]} />
          <ChartCard title="Spend Share" subtitle="Distribution across operations" type="pie" data={byReason} series={[{ key: "value", color: "#6366f1" }]} />
        </div>
      )}
    </div>
  );
}
