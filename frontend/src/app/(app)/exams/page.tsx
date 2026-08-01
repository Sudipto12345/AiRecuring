"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardList, Lock, Send, Users } from "lucide-react";

import { ExamDispatch } from "@/components/jobs/ExamDispatch";
import { PageHeader } from "@/components/layout/PageHeader";
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
    const jobs = await api<Job[]>("/jobs");
    const withExams = await Promise.all(
      jobs.map(async (job) => ({ job, exams: await api<Exam[]>(`/jobs/${job.id}/exams`).catch(() => []) })),
    );
    setRows(withExams);
    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    load();
  }, [load]);

  if (!enabled) {
    return (
      <div className="space-y-5 p-4 lg:p-6">
        <PageHeader title="Exam Management" subtitle="Create job exams and send them to ranked candidates." />
        <Card className="flex flex-col items-center gap-3 px-6 py-20 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
            <Lock className="h-6 w-6" />
          </span>
          <p className="text-lg font-semibold text-ink-900">Exam Portal is a Pro feature</p>
          <p className="max-w-sm text-sm text-ink-500">
            Upgrade your plan to create job-specific exams and dispatch them to candidates by AI ranking.
          </p>
        </Card>
      </div>
    );
  }

  const totalExams = rows.reduce((a, r) => a + r.exams.length, 0);
  const totalSent = rows.reduce((a, r) => a + r.exams.reduce((b, e) => b + e.sent_count, 0), 0);

  return (
    <div className="space-y-5 p-4 lg:p-6">
      <PageHeader title="Exam Management" subtitle="Create job exams and send them to ranked candidates." />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        <StatCard label="Jobs" value={String(rows.length)} icon={Users} accent="#6366f1" spark={[3, 4, 4, 5, 6, 6, 7]} />
        <StatCard label="Exams" value={String(totalExams)} icon={ClipboardList} accent="#a855f7" spark={[1, 2, 2, 3, 3, 4, 5]} />
        <StatCard label="Invites Sent" value={String(totalSent)} icon={Send} accent="#22c55e" spark={[0, 1, 2, 3, 4, 5, 7]} />
      </div>

      <div className="space-y-3">
        {loading ? (
          <Card className="px-5 py-12 text-center text-ink-400">Loading…</Card>
        ) : rows.length === 0 ? (
          <Card className="px-5 py-12 text-center text-ink-400">No jobs yet. Create a job first.</Card>
        ) : (
          rows.map(({ job, exams }) => (
            <Card key={job.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink-900">{job.title}</p>
                  <p className="text-xs text-ink-400">{job.applications} candidates · {exams.length} exam(s)</p>
                </div>
                <Button onClick={() => setExamJob(job)}>
                  <Send className="h-4 w-4" /> Create &amp; send
                </Button>
              </div>
              {exams.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {exams.map((e) => (
                    <div key={e.id} className="flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-xs">
                      <span className="font-medium text-ink-800">{e.title}</span>
                      <Badge variant="brand">{e.category}</Badge>
                      <span className="text-ink-400">{e.num_questions}Q · {e.duration_min}m</span>
                      <Badge variant="purple">{e.sent_count} sent</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {examJob && (
        <ExamDispatch open={!!examJob} onClose={() => { setExamJob(null); load(); }} jobId={examJob.id} jobTitle={examJob.title} />
      )}
    </div>
  );
}
