"use client";

import { useEffect, useState } from "react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ChartCard } from "@/components/admin/ChartCard";
import { StatWidget } from "@/components/admin/StatWidget";
import { Award, Sparkles, TrendingUp, Users } from "lucide-react";
import { api } from "@/lib/api";
import type { AnalyticsSummary } from "@/lib/types";

export default function AiInsightsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    api<AnalyticsSummary>("/analytics/summary")
      .then(setData)
      .catch(() => {});
  }, []);

  const totals = data?.totals ?? {};
  const skills = (data?.top_skills ?? []).map((s) => ({ label: s.skill, count: s.count }));
  const scores = (data?.score_distribution ?? []).map((s) => ({ label: s.label, value: s.count, color: s.color }));

  return (
    <div className="space-y-5 p-4 lg:p-6">
      <AdminPageHeader title="AI Insights" subtitle="What the AI sees across your candidate pool." />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatWidget label="Candidates analyzed" value={totals.candidates ?? 0} icon={Users} tone="accent" />
        <StatWidget label="Shortlisted" value={totals.shortlisted ?? 0} icon={Sparkles} tone="emerald" />
        <StatWidget label="Hired" value={totals.hired ?? 0} icon={Award} tone="amber" />
        <StatWidget label="Open jobs" value={totals.jobs ?? 0} icon={TrendingUp} tone="sky" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard
          title="Top Skills in Pipeline"
          subtitle="Most common skills across candidates"
          type="bar"
          data={skills}
          series={[{ key: "count", color: "#6366f1" }]}
        />
        <ChartCard
          title="Score Distribution"
          subtitle="Candidate AI score buckets"
          type="pie"
          data={scores}
          series={[{ key: "value", color: "#6366f1" }]}
        />
      </div>
    </div>
  );
}
