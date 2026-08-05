"use client";

import { useEffect, useState } from "react";

import { PageHero } from "@/components/ui/PageHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { Card, CardBody } from "@/components/ui/Card";
import { useApi } from "@/lib/swr";
import type { AnalyticsSummary } from "@/lib/types";

const COLORS = ["#2a7553", "#3a916a", "#8b5cf6", "#16a34a", "#d97706"];

export default function HiringFunnelPage() {
  const { data, isLoading: loading } = useApi<AnalyticsSummary>("/analytics/summary");

  const pipeline = data?.pipeline ?? [];

  const bgSvgPattern = "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232a7553' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

  return (
    <div className="space-y-6 p-4 lg:p-6 min-h-screen" style={{ backgroundImage: bgSvgPattern }}>
      <PageHero
        title="Hiring Funnel Conversion"
        subtitle="Stage-by-stage candidate conversion rates and volume metrics across your recruitment pipeline"
        badge="Conversion Analytics"
      />

      <Card className="shadow-sm">
        <CardBody className="pt-6">
        {loading ? (
          <SkeletonTable rows={5} cols={4} />
        ) : pipeline.length === 0 ? (
          <EmptyState
            title="No Funnel Analytics Available"
            description="Your recruitment pipeline has no applicant movement yet. Once candidates pass through pipeline stages, conversion metrics will render here."
          />
        ) : (
          <div className="space-y-5">
            {pipeline.map((stage, i) => {
              const prev = i > 0 ? pipeline[i - 1].count : stage.count;
              const conversion = prev > 0 ? Math.round((stage.count / prev) * 100) : 100;
              const staggerClass = `stagger-${(i % 5) + 1}`;
              return (
                <div key={stage.label} className={`animate-fade-slide-up ${staggerClass}`}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink-900">{stage.label}</span>
                    <span className="font-medium text-ink-500 text-xs">
                      {stage.count} candidates · {stage.pct}% total{i > 0 && ` · ${conversion}% step conversion`}
                    </span>
                  </div>
                  <div className="h-10 w-full overflow-hidden rounded-xl bg-slate-100 p-0.5 border border-line/50">
                    <div
                      className="flex h-full items-center justify-end rounded-lg px-3.5 text-xs font-bold text-white shadow-xs transition-all duration-500"
                      style={{ width: `${Math.max(stage.pct, 8)}%`, backgroundColor: COLORS[i % COLORS.length] }}
                    >
                      {stage.count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </CardBody>
      </Card>
    </div>
  );
}

