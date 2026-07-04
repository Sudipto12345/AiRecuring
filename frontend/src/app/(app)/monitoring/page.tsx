"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, AlertTriangle, Eye, FileBarChart, ShieldCheck } from "lucide-react";

import { InterviewDetail } from "@/components/interviews/InterviewDetail";
import { ModuleLocked } from "@/components/layout/ModuleLocked";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatCard } from "@/components/ui/StatCard";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Interview, MonitoringSummary } from "@/lib/types";

export default function MonitoringPage() {
  const { hasModule } = useAuth();
  const enabled = hasModule("interviewFace");
  const [summary, setSummary] = useState<MonitoringSummary | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [selected, setSelected] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    const [s, i] = await Promise.all([
      api<MonitoringSummary>("/monitoring/summary"),
      api<Interview[]>("/interviews"),
    ]);
    setSummary(s);
    setInterviews(i.filter((x) => x.face));
    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    load();
  }, [load]);

  if (!enabled) {
    return (
      <div className="space-y-5 p-4 lg:p-6">
        <PageHeader title="AI Monitoring" subtitle="Live proctoring and integrity analysis." />
        <ModuleLocked feature="AI Monitoring" />
      </div>
    );
  }

  const statCards = [
    { label: "Live Sessions", value: String(summary?.live_sessions ?? 0), icon: Activity, accent: "#6366f1", spark: [1, 2, 1, 3, 2, 3, 2] },
    { label: "High Risk Alerts", value: String(summary?.high_risk ?? 0), icon: AlertTriangle, accent: "#ef4444", spark: [0, 1, 1, 2, 1, 2, 1] },
    { label: "Avg Focus", value: `${summary?.focus_avg ?? 0}%`, icon: Eye, accent: "#22c55e", spark: [80, 82, 81, 84, 86, 85, 88] },
    { label: "Avg Integrity", value: `${summary?.integrity_avg ?? 0}%`, icon: ShieldCheck, accent: "#0ea5e9", spark: [88, 89, 90, 91, 92, 93, 94] },
    { label: "Reports", value: String(summary?.reports ?? 0), icon: FileBarChart, accent: "#a855f7", spark: [2, 3, 4, 5, 6, 7, 8] },
  ];

  return (
    <div className="space-y-5 p-4 lg:p-6">
      <PageHeader title="AI Monitoring" subtitle="Live proctoring, focus tracking and integrity analysis." />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="flex gap-5">
        <div className="min-w-0 flex-1">
          <Card className="overflow-hidden">
            <div className="border-b border-line px-5 py-3.5">
              <h3 className="text-sm font-semibold text-ink-900">Proctoring Sessions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-400">
                    <th className="px-4 py-3 font-medium">Candidate</th>
                    <th className="px-4 py-3 font-medium">Identity</th>
                    <th className="px-4 py-3 font-medium">Focus</th>
                    <th className="px-4 py-3 font-medium">Integrity</th>
                    <th className="px-4 py-3 font-medium">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="px-5 py-12 text-center text-ink-400">Loading…</td></tr>
                  ) : interviews.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-12 text-center text-ink-400">No analyzed sessions yet. Upload interview videos to monitor integrity.</td></tr>
                  ) : (
                    interviews.map((itv) => (
                      <tr
                        key={itv.id}
                        onClick={() => setSelected(itv)}
                        className={`cursor-pointer border-b border-line/70 last:border-0 hover:bg-brand-50/40 ${selected?.id === itv.id ? "bg-brand-50/60" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={itv.candidate_name} size="sm" />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-ink-900">{itv.candidate_name}</p>
                              <p className="truncate text-xs text-ink-400">{itv.interview_code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {itv.face!.identity_verified === true ? (
                            <Badge tone="green">Verified</Badge>
                          ) : itv.face!.identity_verified === false ? (
                            <Badge tone="rose">Mismatch</Badge>
                          ) : itv.face!.distinct_identities > 1 ? (
                            <Badge tone="rose">{itv.face!.distinct_identities} people</Badge>
                          ) : (
                            <Badge tone="slate">Unverified</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex w-28 items-center gap-2">
                            <ProgressBar value={itv.face!.focus_score} tone="green" />
                            <span className="w-9 text-right text-xs font-semibold text-ink-700">{itv.face!.focus_score}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex w-28 items-center gap-2">
                            <ProgressBar value={itv.face!.integrity_score} tone="brand" />
                            <span className="w-9 text-right text-xs font-semibold text-ink-700">{itv.face!.integrity_score}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={itv.face!.risk_level === "high" ? "rose" : itv.face!.risk_level === "medium" ? "amber" : "green"}>
                            {itv.face!.risk_level}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {selected && (
          <div className="hidden w-[400px] shrink-0 lg:block">
            <Card className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <InterviewDetail interview={selected} onClose={() => setSelected(null)} />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
