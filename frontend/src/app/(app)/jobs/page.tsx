"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Briefcase, CheckCircle2, PauseCircle, Plus, Search, XCircle } from "lucide-react";

import Image from "next/image";
import { UploadDialog } from "@/components/candidates/UploadDialog";
import { ExamDispatch } from "@/components/jobs/ExamDispatch";
import { JobDetail } from "@/components/jobs/JobDetail";
import { JobFormModal } from "@/components/jobs/JobFormModal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Field";
import { StatCard } from "@/components/ui/StatCard";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Job, JobStats } from "@/lib/types";

const statusVariant: Record<string, "success" | "warning" | "default"> = {
  active: "success",
  on_hold: "warning",
  closed: "default",
  draft: "default",
};

export default function JobsPage() {
  const { hasModule } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<JobStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<Job | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [uploadJob, setUploadJob] = useState<Job | null>(null);
  const [examJob, setExamJob] = useState<Job | null>(null);

  const load = useCallback(async () => {
    const [j, s] = await Promise.all([api<Job[]>("/jobs"), api<JobStats>("/jobs/stats")]);
    setJobs(j);
    setStats(s);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () =>
      jobs.filter((j) => {
        if (statusFilter && j.status !== statusFilter) return false;
        if (search && !j.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      }),
    [jobs, search, statusFilter],
  );

  async function deleteJob(job: Job) {
    await api(`/jobs/${job.id}`, { method: "DELETE" });
    setSelected(null);
    load();
  }

  const statCards = [
    { label: "Total Jobs", value: String(stats?.total ?? 0), icon: Briefcase, accent: "#2a7553", spark: [4, 5, 6, 6, 7, 8, 9] },
    { label: "Active Jobs", value: String(stats?.active ?? 0), icon: CheckCircle2, accent: "#3a916a", spark: [3, 4, 4, 5, 5, 6, 7] },
    { label: "On Hold", value: String(stats?.on_hold ?? 0), icon: PauseCircle, accent: "#597568", spark: [1, 1, 2, 1, 2, 2, 2] },
    { label: "Closed", value: String(stats?.closed ?? 0), icon: XCircle, accent: "#88a598", spark: [0, 1, 1, 2, 2, 3, 3] },
  ];

  return (
    <div className="space-y-5 p-4 lg:p-6">
      <PageHeader
        title="Job Openings"
        subtitle="Manage all job openings, requirements, and candidate pipelines."
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" /> Create New Job
          </Button>
        }
      />

      {/* Hero Banner Artwork */}
      <div className="relative w-full h-44 rounded-2xl overflow-hidden shadow-sm border border-emerald-500/20 group">
        <Image
          src="/images/jobs/hero.png"
          alt="Jobs Blooming Opportunities Banner"
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-102"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/70 via-emerald-900/30 to-transparent p-6 flex flex-col justify-center text-white">
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 w-max border border-emerald-500/30">
            🌿 Opportunities Blooming
          </span>
          <h2 className="text-xl font-bold mt-1 text-white">Active Career Listings & Openings</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
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
                placeholder="Search jobs…"
                className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-300"
              />
            </div>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 w-40">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="closed">Closed</option>
            </Select>
          </Card>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-400">
                    <th className="px-5 py-3 font-medium">Job Title</th>
                    <th className="px-5 py-3 font-medium">Department</th>
                    <th className="px-5 py-3 font-medium">Location</th>
                    <th className="px-5 py-3 font-medium">Apps</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="px-5 py-12 text-center text-ink-400">Loading…</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-12 text-center text-ink-400">No jobs yet. Create your first opening.</td></tr>
                  ) : (
                    filtered.map((j) => (
                      <tr
                        key={j.id}
                        onClick={() => setSelected(j)}
                        className={`cursor-pointer border-b border-line/70 last:border-0 hover:bg-brand-50/40 ${selected?.id === j.id ? "bg-brand-50/60" : ""}`}
                      >
                        <td className="px-5 py-3">
                          <p className="font-medium text-ink-900">{j.title}</p>
                          <p className="truncate text-xs text-ink-400">{j.skills.slice(0, 3).join(", ")}</p>
                        </td>
                        <td className="px-5 py-3 text-ink-600">{j.department ?? "—"}</td>
                        <td className="px-5 py-3 text-ink-600">{j.location ?? "—"}</td>
                        <td className="px-5 py-3 font-medium text-ink-900">{j.applications}</td>
                        <td className="px-5 py-3"><Badge variant={statusVariant[j.status] ?? "default"} dot>{j.status.replace("_", " ")}</Badge></td>
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
              <JobDetail job={selected} onClose={() => setSelected(null)} onUpload={(j) => setUploadJob(j)} onExams={(j) => setExamJob(j)} canExams={hasModule("examPortal")} onDelete={deleteJob} />
            </Card>
          </div>
        )}
      </div>

      {selected && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-ink-900/30" onClick={() => setSelected(null)} />
            <aside className="animate-drawer absolute right-0 top-0 h-full w-[90%] max-w-md overflow-y-auto bg-white shadow-pop">
              <JobDetail job={selected} onClose={() => setSelected(null)} onUpload={(j) => setUploadJob(j)} onExams={(j) => setExamJob(j)} canExams={hasModule("examPortal")} onDelete={deleteJob} />
            </aside>
          </div>
        </div>
      )}

      <JobFormModal open={formOpen} onClose={() => setFormOpen(false)} onCreated={() => load()} />
      <UploadDialog
        open={!!uploadJob}
        onClose={() => setUploadJob(null)}
        jobs={jobs}
        defaultJobId={uploadJob?.id}
        onDone={() => load()}
      />
      {examJob && (
        <ExamDispatch open={!!examJob} onClose={() => setExamJob(null)} jobId={examJob.id} jobTitle={examJob.title} />
      )}
    </div>
  );
}
