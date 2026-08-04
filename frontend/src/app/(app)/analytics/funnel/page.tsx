"use client";

import { useEffect, useState } from "react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { api } from "@/lib/api";
import type { AnalyticsSummary } from "@/lib/types";

const COLORS = ["#6366f1", "#7c6cf0", "#9b7bf0", "#22c55e", "#f59e0b"];

export default function HiringFunnelPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<AnalyticsSummary>("/analytics/summary")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pipeline = data?.pipeline ?? [];

  return (
    <div className="space-y-5 p-4 lg:p-6">
      <AdminPageHeader title="Hiring Funnel" subtitle="Stage-by-stage conversion across your pipeline." />

      <div className="a-card p-5">
        {loading ? (
          <p className="py-10 text-center text-sm a-faint">Loading…</p>
        ) : pipeline.length === 0 ? (
          <p className="py-10 text-center text-sm a-faint">No pipeline data yet.</p>
        ) : (
          <div className="space-y-4">
            {pipeline.map((stage, i) => {
              const prev = i > 0 ? pipeline[i - 1].count : stage.count;
              const conversion = prev > 0 ? Math.round((stage.count / prev) * 100) : 100;
              return (
                <div key={stage.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium a-text">{stage.label}</span>
                    <span className="a-faint">
                      {stage.count} · {stage.pct}%{i > 0 && ` · ${conversion}% step`}
                    </span>
                  </div>
                  <div className="h-9 w-full overflow-hidden rounded-lg a-surface-2">
                    <div
                      className="flex h-full items-center justify-end rounded-lg px-3 text-xs font-medium text-white transition-all"
                      style={{ width: `${Math.max(stage.pct, 6)}%`, backgroundColor: COLORS[i % COLORS.length] }}
                    >
                      {stage.count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
