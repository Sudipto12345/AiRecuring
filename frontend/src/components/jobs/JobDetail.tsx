"use client";

import { Briefcase, CalendarClock, MapPin, Send, Trash2, UploadCloud, Users, X } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SkillChip } from "@/components/ui/SkillChip";
import type { Job } from "@/lib/types";

export function JobDetail({
  job,
  onClose,
  onUpload,
  onDelete,
  onExams,
  canExams,
}: {
  job: Job;
  onClose?: () => void;
  onUpload?: (job: Job) => void;
  onDelete?: (job: Job) => void;
  onExams?: (job: Job) => void;
  canExams?: boolean;
}) {
  const stats = [
    { label: "Total Apps", value: job.applications, color: "#6366f1" },
    { label: "Shortlisted", value: job.shortlisted, color: "#a855f7" },
    { label: "Interviews", value: job.interviews, color: "#22c55e" },
    { label: "Hired", value: job.hired, color: "#f59e0b" },
  ];
  const salary =
    job.salary_min && job.salary_max
      ? `${job.currency} ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`
      : "Not disclosed";

  return (
    <div className="relative p-5">
      {onClose && (
        <button onClick={onClose} className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 hover:bg-slate-100">
          <X className="h-4 w-4" />
        </button>
      )}
      <div className="pr-8">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-ink-900">{job.title}</h3>
          {job.featured && <Badge tone="violet">Featured</Badge>}
        </div>
        <p className="mt-0.5 text-xs text-ink-400">JOB-{job.id.slice(-6).toUpperCase()}</p>
        <div className="mt-1.5">
          <Badge tone={job.status === "active" ? "green" : job.status === "on_hold" ? "amber" : "slate"}>
            {job.status.replace("_", " ")}
          </Badge>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-line p-2.5 text-center">
            <p className="text-lg font-semibold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] text-ink-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-2.5 text-sm">
        <Row icon={Briefcase} label="Department" value={job.department ?? "—"} />
        <Row icon={MapPin} label="Location" value={`${job.location ?? "—"} · ${job.work_mode}`} />
        <Row icon={Users} label="Experience" value={`${job.experience_min}-${job.experience_max} years`} />
        <Row icon={CalendarClock} label="Salary" value={salary} />
      </div>

      {job.skills.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[13px] font-semibold text-ink-900">Required Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {job.skills.map((s) => <SkillChip key={s} label={s} />)}
          </div>
        </div>
      )}

      {job.description && <p className="mt-4 text-sm text-ink-600">{job.description}</p>}

      <div className="mt-6 flex flex-col gap-2">
        {onUpload && (
          <Button className="w-full" onClick={() => onUpload(job)}>
            <UploadCloud className="h-4 w-4" /> Upload CVs for this job
          </Button>
        )}
        {onExams && canExams && (
          <Button variant="secondary" className="w-full" onClick={() => onExams(job)}>
            <Send className="h-4 w-4" /> Create &amp; send exam
          </Button>
        )}
        {onDelete && (
          <Button variant="secondary" className="w-full text-rose-600" onClick={() => onDelete(job)}>
            <Trash2 className="h-4 w-4" /> Delete job
          </Button>
        )}
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Briefcase; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-ink-500"><Icon className="h-4 w-4 text-ink-400" /> {label}</span>
      <span className="text-right font-medium text-ink-800">{value}</span>
    </div>
  );
}
