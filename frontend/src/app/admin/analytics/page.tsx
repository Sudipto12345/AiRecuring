"use client";

import { useEffect, useState } from "react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ChartCard } from "@/components/admin/ChartCard";
import { StatWidget } from "@/components/admin/StatWidget";
import { Bot, Briefcase, Building2, Users, Video } from "lucide-react";
import { api } from "@/lib/api";
import type { AdminOverview } from "@/lib/types";

export default function PlatformAnalyticsPage() {
  const [data, setData] = useState<AdminOverview | null>(null);

  useEffect(() => {
    api<AdminOverview>("/admin/overview").then(setData).catch(() => setData(null));
  }, []);

  const k = data?.kpis;

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Platform Analytics" subtitle="Growth, usage, and engagement trends." />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatWidget label="Companies" value={k?.companies ?? "—"} icon={Building2} />
        <StatWidget label="Users" value={k?.users ?? "—"} icon={Users} tone="emerald" />
        <StatWidget label="Candidates" value={k?.candidates ?? "—"} icon={Users} tone="sky" />
        <StatWidget label="Jobs" value={k?.jobs ?? "—"} icon={Briefcase} tone="amber" />
        <StatWidget label="Interviews" value={k?.interviews ?? "—"} icon={Video} tone="accent" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Company Growth" subtitle="Cumulative tenants" type="area" data={data?.charts.company_growth ?? []} series={[{ key: "value", color: "#8b5cf6" }]} />
        <ChartCard title="User Growth" subtitle="Cumulative users" type="area" data={data?.charts.user_growth ?? []} series={[{ key: "value", color: "#0ea5e9" }]} />
        <ChartCard title="New Companies" subtitle="Sign-ups per month" type="bar" data={data?.charts.company_new ?? []} series={[{ key: "value", color: "#10b981" }]} />
        <ChartCard title="AI Usage" subtitle="Credits per month" type="bar" data={data?.charts.ai_usage ?? []} series={[{ key: "credits", color: "#6366f1" }]} />
        <ChartCard title="Revenue" subtitle="MRR trend" draft type="area" data={data?.charts.revenue ?? []} series={[{ key: "revenue", color: "#22c55e" }]} />
        <div className="a-card flex items-center justify-center p-8 text-center">
          <div>
            <Bot className="mx-auto mb-2 h-8 w-8 a-faint" />
            <p className="text-sm a-muted">Retention cohorts and funnel analytics are available in dedicated reports.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
