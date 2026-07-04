"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, Search, Star, TrendingDown, TrendingUp, UploadCloud } from "lucide-react";

import { CandidateDetail } from "@/components/candidates/CandidateDrawer";
import { UploadDialog } from "@/components/candidates/UploadDialog";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Field";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { SkillChip } from "@/components/ui/SkillChip";
import { StatCard } from "@/components/ui/StatCard";
import { api } from "@/lib/api";
import type { Candidate, Job } from "@/lib/types";

export default function CvRankingPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const load = useCallback(async () => {
    const [c, j] = await Promise.all([api<Candidate[]>("/candidates?sort=score"), api<Job[]>("/jobs")]);
    setCandidates(c);
    setJobs(j);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () =>
      candidates.filter((c) => {
        if (jobFilter && c.job_id !== jobFilter) return false;
        if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      }),
    [candidates, jobFilter, search],
  );

  const avg = candidates.length ? candidates.reduce((a, c) => a + c.overall_score, 0) / candidates.length : 0;
  const high = candidates.filter((c) => c.overall_score >= 80).length;
  const mid = candidates.filter((c) => c.overall_score >= 60 && c.overall_score < 80).length;
  const low = candidates.filter((c) => c.overall_score < 60).length;

  const statCards = [
    { label: "Total CVs Analyzed", value: String(candidates.length), icon: FileText, accent: "#6366f1", spark: [6, 8, 10, 12, 14, 16, 18] },
    { label: "Avg Match Score", value: avg ? avg.toFixed(1) : "0", icon: Star, accent: "#a855f7", spark: [70, 72, 74, 73, 76, 78, 79] },
    { label: "High Match (80%+)", value: String(high), icon: TrendingUp, accent: "#22c55e", spark: [2, 3, 4, 5, 6, 7, 8] },
    { label: "Medium Match", value: String(mid), icon: TrendingUp, accent: "#f59e0b", spark: [3, 4, 4, 5, 5, 6, 6] },
    { label: "Low Match (<60%)", value: String(low), icon: TrendingDown, accent: "#ef4444", spark: [1, 1, 2, 2, 2, 3, 3] },
  ];

  return (
    <div className="space-y-5 p-4 lg:p-6">
      <PageHeader
        title="CV Ranking"
        subtitle="AI ranked candidates based on resume analysis and job relevance."
        actions={
          <Button onClick={() => setUploadOpen(true)}>
            <UploadCloud className="h-4 w-4" /> Upload CVs
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="flex gap-5">
        <div className="min-w-0 flex-1 space-y-4">
          <Card className="flex flex-wrap items-center gap-2 p-3">
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, skills, experience…"
                className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-300"
              />
            </div>
            <Select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)} className="h-10 w-44">
              <option value="">All Jobs</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </Select>
          </Card>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-400">
                    <th className="px-4 py-3 font-medium">Rank</th>
                    <th className="px-4 py-3 font-medium">Candidate</th>
                    <th className="px-4 py-3 font-medium">Applied For</th>
                    <th className="px-4 py-3 font-medium">Match</th>
                    <th className="px-4 py-3 font-medium">Key Skills</th>
                    <th className="px-4 py-3 font-medium">Exp</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="px-5 py-12 text-center text-ink-400">Loading…</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-12 text-center text-ink-400">No ranked CVs yet.</td></tr>
                  ) : (
                    filtered.map((c, i) => (
                      <tr
                        key={c.id}
                        onClick={() => setSelected(c)}
                        className={`cursor-pointer border-b border-line/70 last:border-0 hover:bg-brand-50/40 ${selected?.id === c.id ? "bg-brand-50/60" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${i < 3 ? "gradient-brand text-white" : "bg-slate-100 text-ink-500"}`}>
                            {i + 1}
                          </span>
                        </td>
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
                        <td className="px-4 py-3"><ScoreRing score={c.overall_score} size={46} stroke={4} showLabel={false} /></td>
                        <td className="px-4 py-3">
                          <div className="flex max-w-[200px] flex-wrap gap-1">
                            {c.matched_skills.slice(0, 3).map((s) => <SkillChip key={s} label={s} matched />)}
                            {c.matched_skills.length > 3 && <span className="text-xs text-ink-400">+{c.matched_skills.length - 3}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-ink-600">{c.experience_years}y</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {selected && (
          <div className="hidden w-[380px] shrink-0 lg:block">
            <Card className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <CandidateDetail candidate={selected} onClose={() => setSelected(null)} />
            </Card>
          </div>
        )}
      </div>

      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} jobs={jobs} onDone={() => load()} />
    </div>
  );
}
