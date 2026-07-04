"use client";

import { useEffect, useState } from "react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ChartCard } from "@/components/admin/ChartCard";
import { PreviewChip } from "@/components/admin/PreviewChip";
import { StatWidget } from "@/components/admin/StatWidget";
import { DollarSign, TrendingUp, Wallet } from "lucide-react";
import { api } from "@/lib/api";
import type { AdminOverview } from "@/lib/types";

export default function RevenueAnalyticsPage() {
  const [data, setData] = useState<AdminOverview | null>(null);
  useEffect(() => {
    api<AdminOverview>("/admin/overview").then(setData).catch(() => setData(null));
  }, []);
  const r = data?.revenue;
  const usd = (n?: number) => (n == null ? "—" : `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`);
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <AdminPageHeader title="Revenue" subtitle="MRR derived from active subscriptions; trend is illustrative." />
        <PreviewChip />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatWidget label="MRR" value={usd(r?.mrr)} icon={Wallet} tone="emerald" draft />
        <StatWidget label="ARR" value={usd(r?.arr)} icon={TrendingUp} tone="emerald" draft />
        <StatWidget label="Today" value={usd(r?.today)} icon={DollarSign} tone="amber" draft />
      </div>
      <ChartCard title="Revenue trend" draft type="area" height={320} data={data?.charts.revenue ?? []} series={[{ key: "revenue", color: "#22c55e" }]} />
    </div>
  );
}
