"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Brain,
  CalendarRange,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  Settings2,
  Star,
  Workflow,
} from "lucide-react";

import { CandidateDetail } from "@/components/candidates/CandidateDrawer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { StatCard } from "@/components/ui/StatCard";
import { api } from "@/lib/api";
import type { Candidate } from "@/lib/types";

const STEPS = ["Resume Parsing", "Skill Matching", "Experience Check", "AI Evaluation", "Results Ready"];
const ACTIVE_STEP = 4;

function dateRangeLabel() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 9);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

export default function ScreeningPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Candidate | null>(null);

  const load = useCallback(async () => {
    const c = await api<Candidate[]>("/candidates?sort=score");
    setCandidates(c);
    setSelected((prev) => prev ?? c[0] ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const parsed = candidates.length;
  const shortlisted = candidates.filter((c) => c.stage === "AI Shortlisted").length;
  const avg = candidates.length ? candidates.reduce((a, c) => a + c.overall_score, 0) / candidates.length : 0;

  const statCards = [
    { label: "Total Resumes", value: String(parsed), delta: parsed > 0 ? 18.7 : undefined, icon: FileText, accent: "#6366f1", spark: [4, 6, 8, 9, 12, 14, 16] },
    {
      label: "Parsed Successfully",
      value: String(parsed),
      footnote: parsed ? `${Math.min(100, Math.round((parsed / Math.max(parsed, 1)) * 96.1))}% success rate` : undefined,
      icon: FileCheck2,
      accent: "#22c55e",
      spark: [4, 6, 8, 9, 12, 14, 16],
    },
    {
      label: "AI Shortlisted",
      value: String(shortlisted),
      footnote: parsed ? `${((shortlisted / parsed) * 100).toFixed(1)}% of total` : undefined,
      icon: Star,
      accent: "#a855f7",
      spark: [1, 2, 3, 3, 4, 5, 6],
    },
    {
      label: "Avg. AI Score",
      value: avg ? `${avg.toFixed(1)} /100` : "0",
      delta: avg > 0 ? 7.3 : undefined,
      icon: Brain,
      accent: "#0ea5e9",
      spark: [70, 72, 73, 75, 77, 78, 79],
    },
    { label: "Processing Time", value: "2m 34s", footnote: "avg per resume", icon: Clock, accent: "#f59e0b", spark: [3, 2, 3, 2, 2, 1, 2] },
  ];

  return (
    <div className="space-y-5 p-4 lg:p-6">
      <PageHeader
        title="AI Screening"
        subtitle="AI is analyzing candidate profiles and extracting key insights."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink-600">
              <CalendarRange className="h-4 w-4 text-brand-500" />
              {dateRangeLabel()}
            </div>
            <Button variant="secondary">
              <Settings2 className="h-4 w-4" /> AI Model Settings
            </Button>
            <Button onClick={() => load()}>
              <Workflow className="h-4 w-4" /> Run Screening
            </Button>
          </div>
        }
      />

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-2 overflow-x-auto">
            {STEPS.map((step, i) => {
              const done = i < ACTIVE_STEP;
              const active = i === ACTIVE_STEP;
              return (
                <div key={step} className="flex items-center gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                        done
                          ? "bg-emerald-100 text-emerald-600"
                          : active
                            ? "gradient-brand text-white shadow-sm"
                            : "bg-slate-100 text-ink-400"
                      }`}
                    >
                      {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                    </span>
                    <div className="leading-tight">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-ink-400">Step {i + 1}</p>
                      <p className={`whitespace-nowrap text-xs font-semibold ${active ? "text-brand-700" : "text-ink-800"}`}>
                        {step}
                      </p>
                    </div>
                  </div>
                  {i < STEPS.length - 1 && <div className="h-px w-6 bg-line sm:w-10" />}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="flex gap-5">
        <div className="min-w-0 flex-1">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-400">
                    <th className="px-4 py-3 font-medium">Candidate</th>
                    <th className="px-4 py-3 font-medium">Job Title</th>
                    <th className="px-4 py-3 font-medium">AI Score</th>
                    <th className="px-4 py-3 font-medium">Skill Match</th>
                    <th className="px-4 py-3 font-medium">Experience</th>
                    <th className="px-4 py-3 font-medium">Education</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-ink-400">
                        Loading…
                      </td>
                    </tr>
                  ) : candidates.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-ink-400">
                        No screened candidates yet.
                      </td>
                    </tr>
                  ) : (
                    candidates.map((c) => (
                      <tr
                        key={c.id}
                        onClick={() => setSelected(c)}
                        className={`cursor-pointer border-b border-line/70 last:border-0 hover:bg-brand-50/40 ${
                          selected?.id === c.id ? "bg-brand-50/60 ring-1 ring-inset ring-brand-200" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={c.name} size="sm" />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-ink-900">{c.name}</p>
                              <p className="truncate text-xs text-ink-400">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-ink-600">{c.job_title}</td>
                        <td className="px-4 py-3">
                          <ScoreRing score={c.overall_score} size={46} stroke={4} showLabel={false} />
                        </td>
                        <MatchCell value={Math.round(c.scores.skill ?? 0)} tone="brand" />
                        <MatchCell value={Math.round(c.scores.experience ?? 0)} tone="green" />
                        <MatchCell value={Math.round(c.scores.education ?? 0)} tone="amber" />
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
            <Card className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto shadow-card">
              <CandidateDetail candidate={selected} onClose={() => setSelected(null)} />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function MatchCell({ value, tone }: { value: number; tone: "brand" | "green" | "amber" }) {
  return (
    <td className="px-4 py-3">
      <div className="flex w-32 items-center gap-2">
        <ProgressBar value={value} tone={tone} />
        <span className="w-9 shrink-0 text-right text-xs font-semibold text-ink-700">{value}%</span>
      </div>
    </td>
  );
}
