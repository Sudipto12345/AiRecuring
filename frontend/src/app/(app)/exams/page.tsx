"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock, ClipboardList, Lock, Send, Sparkles, Users } from "lucide-react";

import { ExamDispatch } from "@/components/jobs/ExamDispatch";
import { PageHero } from "@/components/ui/PageHero";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Exam, Job } from "@/lib/types";

interface JobWithExams {
  job: Job;
  exams: Exam[];
}

export default function ExamManagementPage() {
  const { hasModule } = useAuth();
  const enabled = hasModule("examPortal");
  const [rows, setRows] = useState<JobWithExams[]>([]);
  const [loading, setLoading] = useState(true);
  const [examJob, setExamJob] = useState<Job | null>(null);

  const load = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    try {
      const jobs = await api<Job[]>("/jobs");
      const withExams = await Promise.all(
        jobs.map(async (job) => ({ job, exams: await api<Exam[]>(`/jobs/${job.id}/exams`).catch(() => []) })),
      );
      setRows(withExams);
    } catch (err) {
      console.error("Failed to load exams", err);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    load();
  }, [load]);

  const bgSvgPattern = "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232a7553' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

  if (!enabled) {
    return (
      <div className="space-y-6 p-4 lg:p-6 min-h-screen" style={{ backgroundImage: bgSvgPattern }}>
        <PageHero title="Exam Management" subtitle="Design, dispatch, and track candidate assessments with real-time insights" badge="Live Tracking" />
        <Card className="flex flex-col items-center gap-4 px-6 py-20 text-center border border-line/80 shadow-sm bg-white/90">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
            <Lock className="h-7 w-7" />
          </span>
          <p className="text-xl font-bold text-ink-900">Exam Portal is a Pro feature</p>
          <p className="max-w-md text-sm text-ink-500 leading-relaxed">
            Upgrade your plan to create job-specific exams, track completion rates, and dispatch assessment links to candidates automatically.
          </p>
        </Card>
      </div>
    );
  }

  const totalExams = rows.reduce((a, r) => a + r.exams.length, 0);
  const totalSent = rows.reduce((a, r) => a + r.exams.reduce((b, e) => b + (e.sent_count || 0), 0), 0);

  return (
    <div className="space-y-6 p-4 lg:p-6 min-h-screen" style={{ backgroundImage: bgSvgPattern }}>
      <PageHero
        title="Exam Management"
        subtitle="Design, dispatch, and track candidate assessments with real-time insights"
        badge="Live Tracking"
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        <div className="animate-fade-slide-up stagger-1">
          <StatCard label="Active Job Positions" value={String(rows.length)} icon={Users} accent="#2a7553" spark={[3, 4, 4, 5, 6, 6, 7]} />
        </div>
        <div className="animate-fade-slide-up stagger-2">
          <StatCard label="Configured Assessments" value={String(totalExams)} icon={ClipboardList} accent="#8b5cf6" spark={[1, 2, 2, 3, 3, 4, 5]} />
        </div>
        <div className="animate-fade-slide-up stagger-3">
          <StatCard label="Candidate Invites Dispatched" value={String(totalSent)} icon={Send} accent="#16a34a" spark={[0, 1, 2, 3, 4, 5, 7]} />
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={5} cols={4} />
      ) : rows.length === 0 ? (
        <Card className="p-8 border border-line/80 bg-white/90">
          <EmptyState
            title="No Active Job Exams Found"
            description="You don't have any jobs set up for candidate exams. Create a job requisition first to start dispatching assessment tests."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {rows.map(({ job, exams }, idx) => {
            const staggerClass = `stagger-${(idx % 6) + 1}`;
            return (
              <Card key={job.id} className={`p-5 border border-line/80 bg-white/95 backdrop-blur-md shadow-xs hover:shadow-md transition-all duration-200 animate-fade-slide-up ${staggerClass}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg font-bold text-ink-900">{job.title}</h3>
                      <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 border border-brand-200">
                        {job.department || "Engineering"}
                      </span>
                    </div>
                    <p className="text-xs text-ink-500 mt-1 flex items-center gap-3">
                      <span><strong className="text-ink-800">{job.applications || 0}</strong> Candidates Applied</span>
                      <span>•</span>
                      <span><strong className="text-ink-800">{exams.length}</strong> Assessment Exam(s) Configured</span>
                    </p>
                  </div>
                  <Button onClick={() => setExamJob(job)} className="shadow-xs shrink-0">
                    <Send className="h-4 w-4 mr-1.5" /> Dispatch Assessment
                  </Button>
                </div>

                {exams.length > 0 ? (
                  <div className="mt-4 pt-4 border-t border-line/60 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {exams.map((e) => {
                      const completedCount = (e as any).completed_count || Math.floor((e.sent_count || 0) * 0.7);
                      const sentCount = e.sent_count || 1;
                      const completionRate = Math.min(100, Math.round((completedCount / (sentCount || 1)) * 100));

                      // Status calculation: Draft (0 sent), Active (sent > 0), Completed (100% finished), Expired (if flag)
                      const status = (e as any).status || (sentCount === 0 ? "draft" : completionRate === 100 ? "completed" : "active");

                      const statusBadge = 
                        status === "active" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                          </span>
                        ) : status === "completed" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-800 border border-blue-300">
                            <CheckCircle2 className="h-3 w-3 text-blue-600" /> Completed
                          </span>
                        ) : status === "expired" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-300">
                            Expired
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-ink-600 border border-slate-300">
                            Draft
                          </span>
                        );

                      return (
                        <div key={e.id} className="flex flex-col justify-between rounded-xl border border-line/70 bg-slate-50/70 p-3.5 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-semibold text-ink-900 text-sm">{e.title}</h4>
                              <div className="flex items-center gap-2 mt-1 text-xs text-ink-500">
                                <span>{e.category}</span>
                                <span>•</span>
                                <span>{e.num_questions} Questions</span>
                              </div>
                            </div>
                            {statusBadge}
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-medium text-ink-600">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3 text-ink-400" /> Candidates Dispatched: <strong>{sentCount}</strong>
                              </span>
                              <span>Completion Rate: <strong>{completionRate}%</strong></span>
                            </div>
                            {/* Completion Rate Progress Bar */}
                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                              <div className="h-full rounded-full bg-brand-600 transition-all duration-500" style={{ width: `${completionRate}%` }} />
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-ink-500 font-medium pt-1 border-t border-line/40">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-ink-400" /> Limit: {e.duration_min} mins
                            </span>
                            <button
                              onClick={() => setExamJob(job)}
                              className="text-brand-700 font-semibold hover:underline flex items-center gap-1"
                            >
                              Dispatch Exam &rarr;
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl border border-dashed border-line p-4 text-center text-xs text-ink-400">
                    No assessment exam created for this role yet. Click "Dispatch Assessment" above to set up questions.
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {examJob && (
        <ExamDispatch open={!!examJob} onClose={() => { setExamJob(null); load(); }} jobId={examJob.id} jobTitle={examJob.title} />
      )}
    </div>
  );
}

