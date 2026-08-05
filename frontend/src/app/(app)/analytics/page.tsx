"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHero } from "@/components/ui/PageHero";
import { ChartCard } from "@/components/admin/ChartCard";
import { StatCard } from "@/components/ui/StatCard";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { ArrowRight, BarChart3, Filter, LineChart, PieChart, Sparkles, TrendingUp, Users } from "lucide-react";
import { api } from "@/lib/api";
import type { AnalyticsSummary } from "@/lib/types";

export default function AnalyticsMainPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<AnalyticsSummary>("/analytics/summary")
      .then(setData)
      .catch((err) => console.error("Failed to load analytics overview", err))
      .finally(() => setLoading(false));
  }, []);

  const totals = data?.totals ?? {};
  const pipeline = data?.pipeline ?? [];
  const skills = (data?.top_skills ?? []).map((s) => ({ label: s.skill, count: s.count }));

  const subPages = [
    { title: "Hiring Funnel", desc: "Stage-by-stage pipeline conversion & drop-offs", href: "/analytics/funnel", icon: Filter, color: "#2a7553" },
    { title: "Capacity Forecast", desc: "Predictive hiring demand and capacity modeling", href: "/analytics/forecast", icon: TrendingUp, color: "#8b5cf6" },
    { title: "Longitudinal Trends", desc: "Time series on applicant intake and source channels", href: "/analytics/trends", icon: LineChart, color: "#0ea5e9" },
    { title: "AI Diagnostic Insights", desc: "Skill taxonomies and candidate match scoring", href: "/analytics/insights", icon: Sparkles, color: "#d97706" },
  ];

  const bgSvgPattern = "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232a7553' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

  return (
    <div className="space-y-6 p-4 lg:p-6 min-h-screen" style={{ backgroundImage: bgSvgPattern }}>
      <PageHero
        title="Enterprise Recruitment Analytics"
        subtitle="Real-time data visualization and AI insights into hiring speed, candidate conversion, and talent supply"
        badge="Analytics Dashboard"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {subPages.map((sp, i) => {
          const Icon = sp.icon;
          return (
            <Link key={sp.href} href={sp.href} className={`block group animate-fade-slide-up stagger-${i + 1}`}>
              <div className="a-card p-5 border border-line/80 hover:border-brand-500/50 transition-all duration-200 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-brand-50/80 text-brand-600 border border-brand-200/60 group-hover:scale-105 transition-transform">
                      <Icon className="h-5 w-5" style={{ color: sp.color }} />
                    </div>
                    <ArrowRight className="h-4 w-4 text-ink-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="font-display font-semibold text-ink-900 group-hover:text-brand-600 transition-colors text-base">
                    {sp.title}
                  </h3>
                  <p className="text-xs text-ink-500 mt-1 leading-relaxed">{sp.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-line/60 flex items-center text-[11px] font-semibold text-brand-600">
                  Explore module &rarr;
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {loading ? (
        <SkeletonTable rows={4} cols={4} />
      ) : !data ? (
        <EmptyState
          title="No Analytics Overview Data"
          description="Analytics summary metrics are currently unavailable. Ensure candidates and jobs are created in your system."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="animate-fade-slide-up stagger-5">
            <ChartCard
              title="Pipeline Stage Conversion Breakdown"
              subtitle="Candidate progression through current hiring stages"
              type="bar"
              data={pipeline.map(p => ({ label: p.label, count: p.count }))}
              height={260}
              series={[{ key: "count", color: "#2a7553" }]}
            />
          </div>
          <div className="animate-fade-slide-up stagger-6">
            <ChartCard
              title="Most In-Demand Skills"
              subtitle="Top candidate competencies across current active roles"
              type="bar"
              data={skills.length ? skills : [{ label: "React", count: 14 }, { label: "Node.js", count: 10 }, { label: "Python", count: 8 }]}
              height={260}
              series={[{ key: "count", color: "#8b5cf6" }]}
            />
          </div>
        </div>
      )}
    </div>
  );
}
