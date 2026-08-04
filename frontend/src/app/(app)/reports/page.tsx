"use client";

import { useEffect, useState } from "react";
import { Briefcase, CheckCircle2, Star, Users } from "lucide-react";

import { Donut } from "@/components/charts/Donut";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { api } from "@/lib/api";
import type { AnalyticsSummary } from "@/lib/types";

const FUNNEL_COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#22c55e", "#0ea5e9"];

export default function ReportsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<AnalyticsSummary>("/analytics/summary")
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const totals = data?.totals ?? {};
  const statCards = [
    { label: "Total Candidates", value: String(totals.candidates ?? 0), icon: Users, accent: "#6366f1", spark: [6, 8, 10, 12, 14, 16, 18] },
    { label: "Shortlisted", value: String(totals.shortlisted ?? 0), icon: Star, accent: "#a855f7", spark: [2, 3, 4, 5, 6, 7, 8] },
    { label: "Interviews", value: String(totals.interviews ?? 0), icon: CheckCircle2, accent: "#22c55e", spark: [1, 2, 2, 3, 4, 5, 6] },
    { label: "Open Jobs", value: String(totals.jobs ?? 0), icon: Briefcase, accent: "#f59e0b", spark: [3, 3, 4, 4, 5, 6, 6] },
  ];

  const scoreSlices = (data?.score_distribution ?? []).map((s) => ({ name: s.label, value: s.count, color: s.color }));
  const totalScored = scoreSlices.reduce((a, s) => a + s.value, 0);

  return (
    <div className="space-y-5 p-4 lg:p-6">
      <PageHeader title="Reports & Analytics" subtitle="Comprehensive insights across your recruitment pipeline." />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-ink-900">Recruitment Funnel</h3>
          <p className="text-xs text-ink-400">Conversion across hiring stages</p>
          <div className="mt-5 space-y-3">
            {loading ? (
              <p className="py-8 text-center text-sm text-ink-400">Loading…</p>
            ) : (
              (data?.pipeline ?? []).map((stage, i) => (
                <div key={stage.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-ink-700">{stage.label}</span>
                    <span className="text-ink-500">{stage.count} · {stage.pct}%</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${stage.pct}%`, backgroundColor: FUNNEL_COLORS[i % FUNNEL_COLORS.length] }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="flex flex-col items-center p-5">
          <h3 className="self-start text-sm font-semibold text-ink-900">Score Distribution</h3>
          <Donut
            data={totalScored ? scoreSlices : [{ name: "No data", value: 1, color: "#e2e8f0" }]}
            centerTop={<span className="text-2xl font-bold text-ink-900">{totalScored}</span>}
            centerBottom={<span className="text-xs text-ink-400">candidates</span>}
          />
          <div className="mt-4 w-full space-y-2">
            {scoreSlices.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-ink-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} /> {s.name}
                </span>
                <span className="font-semibold text-ink-800">{s.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-ink-900">Top Skills in Pipeline</h3>
        <p className="text-xs text-ink-400">Most common skills across all candidates</p>
        <div className="mt-4 space-y-3">
          {(data?.top_skills ?? []).length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-400">No candidate data yet.</p>
          ) : (
            (() => {
              const max = Math.max(...(data?.top_skills ?? []).map((s) => s.count), 1);
              return (data?.top_skills ?? []).map((s) => (
                <div key={s.skill} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 truncate text-sm text-ink-700">{s.skill}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="gradient-brand h-full rounded-full" style={{ width: `${(s.count / max) * 100}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs font-semibold text-ink-700">{s.count}</span>
                </div>
              ));
            })()
          )}
        </div>
      </Card>

      <div className="rounded-2xl bg-amber-50/70 p-4 text-sm text-amber-800">
        <span className="font-semibold">Important Note:</span> AI scoring, CV ranking, proctoring, and automated
        reports are decision-support tools. They should not be treated as legally final hiring decisions. HR or authorized
        reviewers must manually review reports, videos and candidate data before making final employment decisions.
      </div>
    </div>
  );
}
