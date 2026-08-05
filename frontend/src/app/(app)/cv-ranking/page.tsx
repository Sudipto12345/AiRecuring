"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Award, FileText, RefreshCw, Search, Send, Sparkles, Star, TrendingDown, TrendingUp, UploadCloud } from "lucide-react";

import { ExamDispatch } from "@/components/jobs/ExamDispatch";
import { CandidateDetail, CandidateDrawer } from "@/components/candidates/CandidateDrawer";
import { UploadDialog } from "@/components/candidates/UploadDialog";
import { PageHero } from "@/components/ui/PageHero";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Field";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { SkillChip } from "@/components/ui/SkillChip";
import { StatCard } from "@/components/ui/StatCard";
import { api } from "@/lib/api";
import { formatExperienceDuration } from "@/lib/utils";
import type { Candidate, Job } from "@/lib/types";

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(/\/api\/?$/, "");

export default function CvRankingPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [multiSelect, setMultiSelect] = useState<Set<string>>(new Set());
  const [examDispatchOpen, setExamDispatchOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const load = useCallback(async () => {
    try {
      const [c, j] = await Promise.all([api<Candidate[]>("/candidates?sort=score"), api<Job[]>("/jobs")]);
      setCandidates(c || []);
      setJobs(j || []);
    } catch (err) {
      console.error("Failed to load CV ranking data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      load();
    }, 15000);
    return () => clearInterval(timer);
  }, [load, autoRefresh]);

  const syncCandidate = (updated: Candidate) => {
    setSelected(updated);
    setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const changeStage = async (id: string, stage: string) => {
    const updated = await api<Candidate>(`/candidates/${id}/stage`, { method: "PATCH", body: { stage } });
    syncCandidate(updated);
  };

  const filtered = useMemo(
    () =>
      candidates.filter((c) => {
        if (jobFilter && c.job_id !== jobFilter) return false;
        if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.matched_skills?.some(s => s.toLowerCase().includes(search.toLowerCase()))) return false;
        return true;
      }),
    [candidates, jobFilter, search],
  );

  const avg = candidates.length ? candidates.reduce((a, c) => a + c.overall_score, 0) / candidates.length : 0;
  const high = candidates.filter((c) => c.overall_score >= 80).length;
  const mid = candidates.filter((c) => c.overall_score >= 60 && c.overall_score < 80).length;
  const low = candidates.filter((c) => c.overall_score < 60).length;

  const statCards = [
    { label: "Total CVs Analyzed", value: String(candidates.length), icon: FileText, accent: "#2a7553", spark: [6, 8, 10, 12, 14, 16, 18] },
    { label: "Avg Match Score", value: avg ? avg.toFixed(1) : "0", icon: Star, accent: "#8b5cf6", spark: [70, 72, 74, 73, 76, 78, 79] },
    { label: "High Match (80%+)", value: String(high), icon: TrendingUp, accent: "#16a34a", spark: [2, 3, 4, 5, 6, 7, 8] },
    { label: "Medium Match", value: String(mid), icon: TrendingUp, accent: "#d97706", spark: [3, 4, 4, 5, 5, 6, 6] },
    { label: "Low Match (<60%)", value: String(low), icon: TrendingDown, accent: "#dc2626", spark: [1, 1, 2, 2, 2, 3, 3] },
  ];

  const dispatchCandidates = useMemo(() => {
    const list = Array.from(multiSelect).map(id => candidates.find(c => c.id === id)).filter(Boolean) as Candidate[];
    if (!list.length) return { job: null, ids: [] };
    const job_id = list[0].job_id;
    const sameJob = list.filter(c => c.job_id === job_id);
    const job = jobs.find(j => j.id === job_id);
    return { job, ids: sameJob.map(c => c.id) };
  }, [multiSelect, candidates, jobs]);

  const toggleSelect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setMultiSelect(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bgSvgPattern = "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232a7553' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

  return (
    <div className="space-y-6 p-4 lg:p-6 min-h-screen" style={{ backgroundImage: bgSvgPattern }}>
      <PageHero
        title="CV Ranking & AI Scoring"
        subtitle="Intelligent resume analysis powered by semantic matching and skill taxonomy"
        image="/images/candidates/hero.png"
        badge="AI-Powered"
        actions={
          <Button onClick={() => setUploadOpen(true)} className="bg-white/20 text-white hover:bg-white/30 border-white/20 backdrop-blur-md">
            <UploadCloud className="h-4 w-4 mr-2" /> Upload CVs
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {statCards.map((s, idx) => (
          <div key={s.label} className={`animate-fade-slide-up stagger-${(idx % 5) + 1}`}>
            <StatCard {...s} />
          </div>
        ))}
      </div>

      <div className="flex gap-5">
        <div className="min-w-0 flex-1 space-y-4">
          <Card className="flex flex-wrap items-center gap-3 p-4 border border-line/80 shadow-sm bg-white/80 backdrop-blur-md">
            <div className="relative min-w-[240px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidate name, tech stack, or experience…"
                className="h-10 w-full rounded-xl border border-line bg-white/90 pl-9 pr-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <Select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)} className="h-10 w-52 rounded-xl">
              <option value="">All Job Positions</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </Select>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`inline-flex h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition ${
                autoRefresh ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-2xs" : "border-line bg-white text-ink-500"
              }`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${autoRefresh ? "animate-spin" : ""}`} />
              {autoRefresh ? "Auto-Refresh On (15s)" : "Auto-Refresh Off"}
            </button>
          </Card>

          {loading ? (
            <SkeletonTable rows={6} cols={7} showAvatar />
          ) : filtered.length === 0 ? (
            <Card className="p-8">
              <EmptyState
                title="No Ranked Candidates Found"
                description="We couldn't find any resumes matching your search filters. Try clearing your search query or uploading new CVs to get AI scoring."
                action={
                  <Button onClick={() => setUploadOpen(true)}>
                    <UploadCloud className="h-4 w-4 mr-2" /> Upload Resumes Now
                  </Button>
                }
              />
            </Card>
          ) : (
            <Card className="overflow-hidden border border-line/80 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line bg-slate-50/70 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                      <th className="px-4 py-3.5 w-10">
                        <input 
                          type="checkbox" 
                          className="accent-brand-600 rounded"
                          checked={filtered.length > 0 && multiSelect.size === filtered.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setMultiSelect(new Set(filtered.map(c => c.id)));
                            } else {
                              setMultiSelect(new Set());
                            }
                          }}
                        />
                      </th>
                      <th className="px-4 py-3.5">Rank</th>
                      <th className="px-4 py-3.5">Candidate</th>
                      <th className="px-4 py-3.5">Target Role</th>
                      <th className="px-4 py-3.5 text-center">AI Match Ring</th>
                      <th className="px-4 py-3.5">Top Skills</th>
                      <th className="px-4 py-3.5">Exp Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {filtered.map((c, i) => {
                      const isTopPerformer = i < 3 || c.overall_score >= 85;
                      const staggerClass = `stagger-${(i % 6) + 1}`;
                      const avatarSrc = c.photo_url ? `${API_ORIGIN}${c.photo_url}` : undefined;
                      return (
                        <tr
                          key={c.id}
                          onClick={() => setSelected(c)}
                          className={`cursor-pointer transition-colors duration-150 animate-fade-slide-up ${staggerClass} hover:bg-brand-50/50 ${selected?.id === c.id ? "bg-brand-50/80" : ""}`}
                        >
                          <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="checkbox" 
                              checked={multiSelect.has(c.id)} 
                              onChange={(e) => { e.stopPropagation(); toggleSelect(e as any, c.id); }} 
                              className="accent-brand-600 rounded" 
                            />
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                                i === 0 
                                  ? "bg-amber-500 text-white shadow-sm ring-2 ring-amber-300" 
                                  : i === 1 
                                  ? "bg-slate-400 text-white shadow-sm" 
                                  : i === 2 
                                  ? "bg-amber-700 text-white shadow-sm" 
                                  : "bg-slate-100 text-ink-600"
                              }`}>
                                {i + 1}
                              </span>
                              {isTopPerformer && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-300/60 shadow-xs" title="Top AI Match Candidate">
                                  <Sparkles className="h-3 w-3 text-amber-600 fill-amber-500" />
                                  Gold Match
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar name={c.name} src={avatarSrc} size="sm" />
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-ink-900 flex items-center gap-1.5">
                                  {c.name}
                                </p>
                                <p className="truncate text-xs text-ink-400">{c.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-ink-700 font-medium">{c.job_title}</td>
                          <td className="px-4 py-3.5 text-center">
                            <ScoreRing score={c.overall_score} size={48} stroke={4.5} showLabel={false} />
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex max-w-[220px] flex-wrap gap-1.5">
                              {c.matched_skills.slice(0, 3).map((s) => <SkillChip key={s} label={s} matched />)}
                              {c.matched_skills.length > 3 && (
                                <span className="inline-flex items-center text-xs font-medium text-ink-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                  +{c.matched_skills.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                              {formatExperienceDuration(c.experience_years)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {selected && (
          <div className="hidden w-[390px] shrink-0 lg:block animate-fade-slide-in">
            <Card className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto border border-line/80 shadow-md">
              <CandidateDetail
                candidate={selected}
                onClose={() => setSelected(null)}
                onStageChange={changeStage}
                allowDispatch
                onDispatched={syncCandidate}
                onUpdated={syncCandidate}
              />
            </Card>
          </div>
        )}
      </div>

      <div className="lg:hidden">
        <CandidateDrawer
          candidate={selected}
          open={!!selected}
          onClose={() => setSelected(null)}
          onStageChange={changeStage}
          allowDispatch
          onDispatched={syncCandidate}
          onUpdated={syncCandidate}
        />
      </div>

      {multiSelect.size > 0 && (
        <div className="fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-4 rounded-full border border-line bg-white/95 px-6 py-3 shadow-2xl backdrop-blur-md animate-pop z-50">
          <div className="text-sm font-semibold text-ink-900 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs text-white">
              {multiSelect.size}
            </span>
            candidate{multiSelect.size > 1 ? "s" : ""} selected
          </div>
          <div className="h-6 w-px bg-line" />
          <Button size="sm" onClick={() => setExamDispatchOpen(true)} disabled={!dispatchCandidates.job}>
            <Send className="h-4 w-4 mr-1.5" /> Dispatch Assessment Exam
          </Button>
          <button onClick={() => setMultiSelect(new Set())} className="text-sm font-medium text-ink-500 hover:text-ink-900 transition-colors">
            Clear Selection
          </button>
        </div>
      )}

      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} jobs={jobs} onDone={() => load()} />
      {examDispatchOpen && dispatchCandidates.job && (
        <ExamDispatch 
          open={examDispatchOpen} 
          onClose={() => setExamDispatchOpen(false)} 
          jobId={dispatchCandidates.job.id} 
          jobTitle={dispatchCandidates.job.title} 
          preSelectedIds={dispatchCandidates.ids}
        />
      )}
    </div>
  );
}


