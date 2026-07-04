"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarPlus, CheckCircle2, Clock, Star, UserX, Video } from "lucide-react";

import { InterviewDetail } from "@/components/interviews/InterviewDetail";
import { PageHeader } from "@/components/layout/PageHeader";
import { ModuleLocked } from "@/components/layout/ModuleLocked";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Label, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { StatCard } from "@/components/ui/StatCard";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Candidate, Interview, InterviewStats } from "@/lib/types";

export default function InterviewsPage() {
  const { hasModule } = useAuth();
  const enabled = hasModule("interviewFace");
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [stats, setStats] = useState<InterviewStats | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Interview | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const load = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    const [i, s, c] = await Promise.all([
      api<Interview[]>("/interviews"),
      api<InterviewStats>("/interviews/stats"),
      api<Candidate[]>("/candidates?sort=score"),
    ]);
    setInterviews(i);
    setStats(s);
    setCandidates(c);
    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    load();
  }, [load]);

  if (!enabled) {
    return (
      <div className="space-y-5 p-4 lg:p-6">
        <PageHeader title="AI Interviews" subtitle="Record, play back and analyze candidate interviews." />
        <ModuleLocked feature="AI Interviews" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Interviews", value: String(stats?.total ?? 0), icon: Video, accent: "#6366f1", spark: [3, 4, 6, 7, 9, 10, 12] },
    { label: "Completed", value: String(stats?.completed ?? 0), icon: CheckCircle2, accent: "#22c55e", spark: [2, 3, 4, 5, 6, 7, 8] },
    { label: "In Progress", value: String(stats?.in_progress ?? 0), icon: Clock, accent: "#f59e0b", spark: [1, 1, 2, 1, 2, 2, 1] },
    { label: "No Show", value: String(stats?.no_show ?? 0), icon: UserX, accent: "#ef4444", spark: [0, 1, 0, 1, 1, 0, 1] },
    { label: "Avg Score", value: stats?.avg_score ? stats.avg_score.toFixed(1) : "0", icon: Star, accent: "#a855f7", spark: [70, 72, 74, 76, 77, 79, 81] },
  ];

  return (
    <div className="space-y-5 p-4 lg:p-6">
      <PageHeader
        title="AI Interviews"
        subtitle="Record, play back and analyze candidate interviews with AI proctoring."
        actions={
          <Button onClick={() => setScheduleOpen(true)}>
            <CalendarPlus className="h-4 w-4" /> Schedule Interview
          </Button>
        }
      />

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
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Proctoring</th>
                    <th className="px-4 py-3 font-medium">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="px-5 py-12 text-center text-ink-400">Loading…</td></tr>
                  ) : interviews.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-12 text-center text-ink-400">No interviews scheduled yet.</td></tr>
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
                        <td className="px-4 py-3 text-ink-600">{itv.interview_type}</td>
                        <td className="px-4 py-3">
                          <Badge tone={itv.status === "Completed" ? "green" : itv.status === "In Progress" ? "amber" : "slate"} dot>
                            {itv.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {itv.face ? (
                            <Badge tone={itv.face.risk_level === "high" ? "rose" : itv.face.risk_level === "medium" ? "amber" : "green"}>
                              {itv.face.risk_level} risk
                            </Badge>
                          ) : (
                            <span className="text-xs text-ink-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {itv.ai_score !== null ? <ScoreRing score={itv.ai_score} size={46} stroke={4} showLabel={false} /> : <span className="text-xs text-ink-400">—</span>}
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
              <InterviewDetail
                interview={selected}
                onClose={() => setSelected(null)}
                onUploaded={(i) => {
                  setSelected(i);
                  setInterviews((rows) => rows.map((r) => (r.id === i.id ? i : r)));
                  api<InterviewStats>("/interviews/stats").then(setStats);
                }}
              />
            </Card>
          </div>
        )}
      </div>

      <ScheduleModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        candidates={candidates}
        onScheduled={() => load()}
      />
    </div>
  );
}

function ScheduleModal({
  open,
  onClose,
  candidates,
  onScheduled,
}: {
  open: boolean;
  onClose: () => void;
  candidates: Candidate[];
  onScheduled: () => void;
}) {
  const [candidateId, setCandidateId] = useState("");
  const [type, setType] = useState("AI Interview");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/interviews", { method: "POST", body: { candidate_id: candidateId, interview_type: type } });
      onScheduled();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Schedule Interview">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label>Candidate</Label>
          <Select required value={candidateId} onChange={(e) => setCandidateId(e.target.value)}>
            <option value="">Select candidate…</option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>{c.name} — {c.job_title}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Interview type</Label>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option>AI Interview</option>
            <option>Video Interview</option>
          </Select>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={busy || !candidateId}>{busy ? "Scheduling…" : "Schedule"}</Button>
        </div>
      </form>
    </Modal>
  );
}
