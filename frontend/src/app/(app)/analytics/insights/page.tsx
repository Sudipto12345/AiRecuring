"use client";

import { useEffect, useState } from "react";

import { PageHero } from "@/components/ui/PageHero";
import { ChartCard } from "@/components/admin/ChartCard";
import { StatWidget } from "@/components/admin/StatWidget";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { Award, Sparkles, TrendingUp, Users } from "lucide-react";
import { api } from "@/lib/api";
import type { AnalyticsSummary } from "@/lib/types";

export default function AiInsightsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<AnalyticsSummary>("/analytics/summary")
      .then(setData)
      .catch((err) => console.error("Failed to load analytics summary", err))
      .finally(() => setLoading(false));
  }, []);

  const totals = data?.totals ?? {};
  const skills = (data?.top_skills ?? []).map((s) => ({ label: s.skill, count: s.count }));
  const scores = (data?.score_distribution ?? []).map((s) => ({ label: s.label, value: s.count, color: s.color }));

  const bgSvgPattern = "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232a7553' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

  return (
    <div className="space-y-6 p-4 lg:p-6 min-h-screen" style={{ backgroundImage: bgSvgPattern }}>
      <PageHero
        title="AI Recruitment Insights"
        subtitle="Deep diagnostic intelligence across candidate skill taxonomies and scoring distributions"
        badge="Intelligent Analytics"
      />

      {loading ? (
        <SkeletonTable rows={4} cols={4} />
      ) : !data ? (
        <EmptyState
          title="No Analytics Data Available"
          description="We couldn't retrieve candidate insight analytics at this time. Please check your system data or try refreshing."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="animate-fade-slide-up stagger-1">
              <StatWidget label="Candidates Analyzed" value={totals.candidates ?? 0} icon={Users} tone="accent" />
            </div>
            <div className="animate-fade-slide-up stagger-2">
              <StatWidget label="Shortlisted Talent" value={totals.shortlisted ?? 0} icon={Sparkles} tone="emerald" />
            </div>
            <div className="animate-fade-slide-up stagger-3">
              <StatWidget label="Successful Hires" value={totals.hired ?? 0} icon={Award} tone="amber" />
            </div>
            <div className="animate-fade-slide-up stagger-4">
              <StatWidget label="Open Job Requisitions" value={totals.jobs ?? 0} icon={TrendingUp} tone="sky" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="animate-fade-slide-up stagger-5">
              <ChartCard
                title="Top Candidate Skills in Pipeline"
                subtitle="Most frequent candidate proficiencies identified by AI parsing"
                type="bar"
                data={skills.length ? skills : [{ label: "React", count: 12 }, { label: "Python", count: 9 }, { label: "Node.js", count: 8 }, { label: "TypeScript", count: 7 }]}
                height={260}
                series={[{ key: "count", color: "#2a7553" }]}
              />
            </div>
            <div className="animate-fade-slide-up stagger-6">
              <ChartCard
                title="AI Score Distribution"
                subtitle="Candidate resume scoring brackets across active applicants"
                type="pie"
                data={scores.length ? scores : [
                  { label: "High Match (80%+)", value: 14, color: "#16a34a" },
                  { label: "Medium Match (60-79%)", value: 22, color: "#d97706" },
                  { label: "Low Match (<60%)", value: 8, color: "#dc2626" },
                ]}
                height={260}
                series={[{ key: "value", color: "#2a7553" }]}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

