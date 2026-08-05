"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, CheckCircle2, Clock, FileText, Filter, GripVertical, Layers, Search, Sparkles, UserCheck } from "lucide-react";

import { PageHero } from "@/components/ui/PageHero";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { useDrawer } from "@/components/admin/ContextDrawer";
import { api } from "@/lib/api";
import type { Candidate } from "@/lib/types";

const COLUMNS: { key: string; label: string; color: string; avgTime: string; match: (s: string) => boolean }[] = [
  { key: "applied", label: "Applied", color: "#2a7553", avgTime: "1.2 days", match: (s) => s === "Applied" || s === "New" },
  { key: "screening", label: "Screening", color: "#3a916a", avgTime: "2.1 days", match: (s) => s.includes("Screen") || s === "Under Review" },
  { key: "assessment", label: "Assessment", color: "#8b5cf6", avgTime: "3.4 days", match: (s) => s.includes("Assessment") || s.includes("Exam") || s.includes("Shortlist") },
  { key: "interview", label: "Interview", color: "#0ea5e9", avgTime: "4.2 days", match: (s) => s.includes("Interview") },
  { key: "offer", label: "Offer", color: "#d97706", avgTime: "2.0 days", match: (s) => s.includes("Offer") },
  { key: "hired", label: "Hired", color: "#16a34a", avgTime: "—", match: (s) => s === "Hired" },
];

function scoreTone(score: number) {
  if (score >= 80) return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (score >= 60) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-rose-700 bg-rose-50 border-rose-200";
}

export default function PipelinePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { open } = useDrawer();

  useEffect(() => {
    api<Candidate[]>("/candidates?sort=score")
      .then((data) => setCandidates(data || []))
      .catch(() => setCandidates([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredCandidates = useMemo(() => {
    if (!search.trim()) return candidates;
    const q = search.toLowerCase();
    return candidates.filter((c) => c.name.toLowerCase().includes(q) || c.job_title?.toLowerCase().includes(q));
  }, [candidates, search]);

  const grouped = useMemo(() => {
    const cols: Record<string, Candidate[]> = {};
    for (const c of COLUMNS) cols[c.key] = [];
    for (const cand of filteredCandidates) {
      const col = COLUMNS.find((c) => c.match(cand.stage)) ?? COLUMNS[0];
      cols[col.key].push(cand);
    }
    return cols;
  }, [filteredCandidates]);

  function openCandidate(c: Candidate) {
    open({
      title: c.name,
      subtitle: c.job_title ?? "Candidate",
      node: (
        <div className="space-y-4 text-sm p-1">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-line">
            <span className="font-medium text-ink-600">AI Match Score</span>
            <span className={`text-lg font-bold px-2.5 py-0.5 rounded-lg border ${scoreTone(c.overall_score)}`}>
              {c.overall_score}%
            </span>
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase text-ink-400">Current Pipeline Stage</p>
            <p className="font-semibold text-ink-900">{c.stage}</p>
          </div>
          {c.ai_summary && (
            <div>
              <p className="mb-1 text-xs font-bold uppercase text-ink-400">AI Qualification Summary</p>
              <p className="text-ink-600 leading-relaxed text-xs bg-slate-50 p-3 rounded-xl border border-line">{c.ai_summary}</p>
            </div>
          )}
          {c.skills && c.skills.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-bold uppercase text-ink-400">Matched Skill Matrix</p>
              <div className="flex flex-wrap gap-1.5">
                {c.skills.slice(0, 12).map((s) => (
                  <span key={s} className="rounded-full bg-brand-50 text-brand-700 px-2.5 py-0.5 text-xs font-medium border border-brand-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="pt-2">
            <a href="/candidates" className="w-full inline-flex justify-center items-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors shadow-xs">
              Open Full Candidate Profile
            </a>
          </div>
        </div>
      ),
    });
  }

  const bgSvgPattern = "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232a7553' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

  return (
    <div className="space-y-6 p-4 lg:p-6 min-h-screen" style={{ backgroundImage: bgSvgPattern }}>
      <PageHero
        title="Hiring Pipeline"
        subtitle="Visualize every candidate's journey from application to offer in a single structured view"
        badge="Pipeline Kanban"
      />

      <Card className="p-4 border border-line/80 bg-white/90 backdrop-blur-md">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate name or job title in pipeline…"
            className="h-10 w-full rounded-xl border border-line bg-white/90 pl-9 pr-3 text-sm outline-none transition focus:border-brand-500"
          />
        </div>
      </Card>

      {loading ? (
        <SkeletonTable rows={5} cols={6} />
      ) : candidates.length === 0 ? (
        <Card className="p-8 border border-line/80 bg-white/90">
          <EmptyState
            title="Hiring Pipeline is Empty"
            description="No candidates are currently active in your hiring pipeline. Upload resumes or create jobs to start tracking candidate progression."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 items-start">
          {COLUMNS.map((col, idx) => {
            const list = grouped[col.key] || [];
            const staggerClass = `stagger-${(idx % 6) + 1}`;

            return (
              <div key={col.key} className={`a-card flex flex-col p-3 border border-line/80 bg-white/90 backdrop-blur-md rounded-2xl animate-fade-slide-up ${staggerClass}`}>
                {/* Drag-Aware Column Header */}
                <div className="mb-3 p-2.5 rounded-xl bg-slate-50 border border-line/60">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-ink-900">
                      <GripVertical className="h-3.5 w-3.5 text-ink-400 cursor-grab" />
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                      {col.label}
                    </span>
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1.5 text-[11px] font-bold text-white shadow-2xs">
                      {list.length}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] font-medium text-ink-400">
                    <span>Avg duration</span>
                    <span className="text-ink-600 font-semibold">{col.avgTime}</span>
                  </div>
                </div>

                {/* Column Candidate Cards */}
                <div className="space-y-2.5 min-h-[160px]">
                  {list.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-line/60 p-4 text-center text-xs text-ink-400">
                      No candidates in this stage
                    </div>
                  ) : (
                    list.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => openCandidate(c)}
                        className="cursor-pointer rounded-xl border border-line/80 bg-white p-3 shadow-2xs hover:border-brand-500 hover:shadow-xs transition-all duration-150"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-ink-900 text-xs">{c.name}</p>
                            <p className="truncate text-[11px] text-ink-400 mt-0.5">{c.job_title ?? "Position"}</p>
                          </div>
                          <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold border ${scoreTone(c.overall_score)}`}>
                            {c.overall_score}
                          </span>
                        </div>

                        {c.matched_skills && c.matched_skills.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1">
                            {c.matched_skills.slice(0, 2).map((s) => (
                              <span key={s} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-ink-600">
                                {s}
                              </span>
                            ))}
                            {c.matched_skills.length > 2 && (
                              <span className="text-[10px] text-ink-400 font-medium self-center">
                                +{c.matched_skills.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

