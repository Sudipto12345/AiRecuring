"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarCheck2,
  CheckCircle2,
  ChevronDown,
  Eye,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  Users,
} from "lucide-react";

import { CandidateDetail, CandidateDrawer } from "@/components/candidates/CandidateDrawer";
import { UploadDialog } from "@/components/candidates/UploadDialog";
import { PipelineChevron } from "@/components/dashboard/PipelineChevron";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { StageBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Field";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { StatCard } from "@/components/ui/StatCard";
import { api } from "@/lib/api";
import type { Candidate, CandidateStats, Job } from "@/lib/types";

const PAGE_SIZE = 10;

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<CandidateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    const [c, j, s] = await Promise.all([
      api<Candidate[]>("/candidates?sort=score"),
      api<Job[]>("/jobs"),
      api<CandidateStats>("/candidates/stats"),
    ]);
    setCandidates(c);
    setJobs(j);
    setStats(s);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (jobFilter && c.job_id !== jobFilter) return false;
      if (stageFilter && c.stage !== stageFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        if (
          !c.name.toLowerCase().includes(s) &&
          !(c.email || "").toLowerCase().includes(s) &&
          !(c.phone || "").includes(s)
        )
          return false;
      }
      return true;
    });
  }, [candidates, jobFilter, stageFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, jobFilter, stageFilter]);

  function syncCandidate(c: Candidate) {
    setSelected(c);
    setCandidates((rows) => rows.map((r) => (r.id === c.id ? c : r)));
  }

  async function changeStage(id: string, stage: string) {
    const updated = await api<Candidate>(`/candidates/${id}/stage`, { method: "PATCH", body: { stage } });
    setCandidates((rows) => rows.map((r) => (r.id === id ? updated : r)));
    setSelected(updated);
    setStats(await api<CandidateStats>("/candidates/stats"));
  }

  const pipelineStages = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of candidates) {
      const key =
        c.stage === "Interview Scheduled"
          ? "Interview"
          : c.stage === "Offer"
            ? "Offer"
            : c.stage;
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return [
      { label: "Applied", count: counts.Applied ?? stats?.total ?? 0 },
      { label: "AI Screened", count: counts["AI Screened"] ?? 0 },
      { label: "AI Shortlisted", count: counts["AI Shortlisted"] ?? stats?.shortlisted ?? 0 },
      { label: "Interview", count: counts.Interview ?? counts["Interview Scheduled"] ?? stats?.interview ?? 0 },
      { label: "Offer", count: counts.Offer ?? 0 },
      { label: "Hired", count: counts.Hired ?? stats?.hired ?? 0 },
    ];
  }, [candidates, stats]);

  const statCards = [
    {
      label: "Total Candidates",
      value: String(stats?.total ?? 0),
      delta: (stats?.total ?? 0) > 0 ? 18.7 : undefined,
      icon: Users,
      accent: "#6366f1",
      spark: [8, 10, 9, 14, 13, 18, 20],
    },
    {
      label: "AI Shortlisted",
      value: String(stats?.shortlisted ?? 0),
      delta: (stats?.shortlisted ?? 0) > 0 ? 12.4 : undefined,
      icon: Star,
      accent: "#a855f7",
      spark: [3, 4, 5, 6, 6, 8, 9],
    },
    {
      label: "Interviews Completed",
      value: String(stats?.interview ?? 0),
      delta: (stats?.interview ?? 0) > 0 ? 15.3 : undefined,
      icon: CalendarCheck2,
      accent: "#22c55e",
      spark: [1, 2, 2, 3, 3, 4, 5],
    },
    {
      label: "Offers Extended",
      value: String(Math.max(0, Math.round((stats?.shortlisted ?? 0) * 0.13))),
      delta: 8.2,
      icon: CheckCircle2,
      accent: "#f59e0b",
      spark: [0, 1, 1, 2, 2, 3, 4],
    },
    {
      label: "Hired",
      value: String(stats?.hired ?? 0),
      delta: (stats?.hired ?? 0) > 0 ? 9.1 : undefined,
      icon: CheckCircle2,
      accent: "#0ea5e9",
      spark: [0, 1, 1, 1, 2, 2, 3],
    },
  ];

  function scoreLabel(score: number) {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    return "Fair";
  }

  return (
    <div className="space-y-5 p-4 lg:p-6">
      <PageHeader
        title="Candidates"
        subtitle="Manage and track all candidates in your pipeline."
        actions={
          <Button onClick={() => setUploadOpen(true)}>
            <Plus className="h-4 w-4" /> Add Candidate <ChevronDown className="h-4 w-4 opacity-70" />
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <Card className="p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-400">Pipeline Progress</p>
        <PipelineChevron stages={pipelineStages} />
      </Card>

      <div className="flex gap-5">
        <div className="min-w-0 flex-1 space-y-4">
          <Card className="p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, skills…"
                  className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-300"
                />
              </div>
              <Select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)} className="h-10 w-36">
                <option value="">All Jobs</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </Select>
              <Select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="h-10 w-36">
                <option value="">All Stages</option>
                {["Applied", "AI Screened", "AI Shortlisted", "Interview Scheduled", "Hired", "Rejected"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
              <button className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-sm text-ink-600 hover:bg-slate-50">
                <SlidersHorizontal className="h-4 w-4" /> More Filters
              </button>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-400">
                    <th className="px-5 py-3 font-medium">Candidate</th>
                    <th className="px-5 py-3 font-medium">Job Title</th>
                    <th className="px-5 py-3 font-medium">AI Score</th>
                    <th className="px-5 py-3 font-medium">Stage</th>
                    <th className="px-5 py-3 font-medium">Last Activity</th>
                    <th className="px-5 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-ink-400">
                        Loading…
                      </td>
                    </tr>
                  ) : pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-ink-400">
                        No candidates yet. Upload CVs to get started.
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((c) => (
                      <tr
                        key={c.id}
                        onClick={() => setSelected(c)}
                        className={`cursor-pointer border-b border-line/70 last:border-0 hover:bg-brand-50/40 ${
                          selected?.id === c.id ? "bg-brand-50/60 ring-1 ring-inset ring-brand-200" : ""
                        }`}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={c.name} size="sm" />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-ink-900">{c.name}</p>
                              <p className="truncate text-xs text-ink-400">{c.email}</p>
                              {c.phone && <p className="truncate text-[11px] text-ink-400">{c.phone}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-ink-700">{c.job_title}</p>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <ScoreRing score={c.overall_score} size={46} stroke={4} showLabel={false} />
                            <div className="hidden sm:block">
                              <p className="text-sm font-semibold text-ink-900">{c.overall_score.toFixed(1)}</p>
                              <p className="text-[11px] text-emerald-600">{scoreLabel(c.overall_score)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <StageBadge stage={c.stage} />
                        </td>
                        <td className="px-5 py-3 text-xs text-ink-400">{new Date(c.added_on).toLocaleDateString()}</td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Eye className="h-4 w-4 text-ink-400" />
                            <MoreHorizontal className="h-4 w-4 text-ink-300" />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 text-sm text-ink-500">
              <p>
                Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length.toLocaleString()} candidates
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-line px-2.5 py-1 disabled:opacity-40"
                >
                  ‹
                </button>
                <span className="tabular-nums">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-line px-2.5 py-1 disabled:opacity-40"
                >
                  ›
                </button>
                <span className="ml-2 text-xs text-ink-400">{PAGE_SIZE} / page</span>
              </div>
            </div>
          </Card>
        </div>

        {selected && (
          <div className="hidden w-[400px] shrink-0 lg:block">
            <Card className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto shadow-card">
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

      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} jobs={jobs} onDone={() => load()} />
    </div>
  );
}
