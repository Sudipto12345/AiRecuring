"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Bot,
  Briefcase,
  Building2,
  Coins,
  Cpu,
  Gauge,
  HardDrive,
  MemoryStick,
  TrendingUp,
  Users,
  Video,
  Wallet,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ChartCard } from "@/components/admin/ChartCard";
import { StatWidget } from "@/components/admin/StatWidget";
import { api } from "@/lib/api";
import type { AdminOverview } from "@/lib/types";

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminOverview | null>(null);

  useEffect(() => {
    api<AdminOverview>("/admin/overview").then(setData).catch(() => setData(null));
  }, []);

  const k = data?.kpis;
  const r = data?.revenue;
  const inf = data?.infra_sample;
  const usd = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Platform Overview" subtitle="Live operational snapshot of the entire AIRecruit platform." />

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide a-faint">Revenue</p>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatWidget label="MRR" value={r ? usd(r.mrr) : "—"} icon={Wallet} draft tone="emerald" />
          <StatWidget label="ARR" value={r ? usd(r.arr) : "—"} icon={TrendingUp} draft tone="emerald" />
          <StatWidget label="Today's Revenue" value={r ? usd(r.today) : "—"} icon={Coins} draft tone="amber" />
          <StatWidget label="AI Credits Spent" value={k?.ai_credits_spent.toLocaleString() ?? "—"} icon={Coins} tone="accent" />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide a-faint">Platform</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <StatWidget label="Companies" value={k?.companies ?? "—"} icon={Building2} />
          <StatWidget label="Active Users" value={k?.users ?? "—"} icon={Users} tone="emerald" />
          <StatWidget label="Candidates" value={k?.candidates ?? "—"} icon={Users} tone="sky" />
          <StatWidget label="Jobs" value={k?.jobs ?? "—"} icon={Briefcase} tone="amber" />
          <StatWidget label="Interviews" value={k?.interviews ?? "—"} icon={Video} tone="accent" />
          <StatWidget label="AI Requests" value={k?.ai_requests ?? "—"} icon={Bot} tone="accent" />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide a-faint">Infrastructure</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <StatWidget label="CPU" value={inf ? `${inf.cpu_pct}%` : "—"} icon={Cpu} draft />
          <StatWidget label="RAM" value={inf ? `${inf.ram_pct}%` : "—"} icon={MemoryStick} draft />
          <StatWidget label="Queue Depth" value={inf?.queue_depth ?? "—"} icon={Activity} draft />
          <StatWidget label="Error Rate" value={inf ? `${inf.error_rate_pct}%` : "—"} icon={Activity} draft tone="rose" />
          <StatWidget label="API Req (24h)" value={inf?.api_requests_24h.toLocaleString() ?? "—"} icon={Gauge} draft />
          <StatWidget
            label="Storage"
            value={data ? `${data.storage.used_gb} GB` : "—"}
            icon={HardDrive}
            draft
            tone="sky"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Revenue"
          subtitle="Monthly recurring revenue trend"
          draft
          type="area"
          data={data?.charts.revenue ?? []}
          series={[{ key: "revenue", color: "#22c55e" }]}
        />
        <ChartCard
          title="AI Usage"
          subtitle="Requests & credits consumed per month"
          type="bar"
          data={data?.charts.ai_usage ?? []}
          series={[{ key: "credits", color: "#6366f1" }]}
        />
        <ChartCard
          title="Company Growth"
          subtitle="Cumulative tenants"
          type="area"
          data={data?.charts.company_growth ?? []}
          series={[{ key: "value", color: "#8b5cf6" }]}
        />
        <ChartCard
          title="User Growth"
          subtitle="Cumulative platform users"
          type="area"
          data={data?.charts.user_growth ?? []}
          series={[{ key: "value", color: "#0ea5e9" }]}
        />
      </div>
    </div>
  );
}
