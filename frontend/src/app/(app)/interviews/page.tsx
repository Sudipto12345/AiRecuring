"use client";

import { useCallback, useEffect, useState } from "react";
import { Calendar, CalendarPlus, CheckCircle2, Clock, Grid, LayoutList, Star, UserX, Video } from "lucide-react";

import { InterviewDetail } from "@/components/interviews/InterviewDetail";
import { PageHero } from "@/components/ui/PageHero";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EmptyState } from "@/components/ui/EmptyState";
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
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");

  const load = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    try {
      const [i, s, c] = await Promise.all([
        api<Interview[]>("/interviews"),
        api<InterviewStats>("/interviews/stats"),
        api<Candidate[]>("/candidates?sort=score"),
      ]);
      setInterviews(i || []);
      setStats(s || null);
      setCandidates(c || []);
    } catch (err) {
      console.error("Failed to load interviews", err);
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
        <PageHero
          title="Interview Scheduling"
          subtitle="Coordinate seamless interviews with automated invitations and calendar sync"
          image="/images/interviews/schedule.png"
        />
        <ModuleLocked feature="AI Interviews" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Scheduled", value: String(stats?.total ?? interviews.length), icon: Video, accent: "#2a7553", spark: [3, 4, 6, 7, 9, 10, 12] },
    { label: "Completed", value: String(stats?.completed ?? 0), icon: CheckCircle2, accent: "#16a34a", spark: [2, 3, 4, 5, 6, 7, 8] },
    { label: "In Progress", value: String(stats?.in_progress ?? 0), icon: Clock, accent: "#d97706", spark: [1, 1, 2, 1, 2, 2, 1] },
    { label: "No Show", value: String(stats?.no_show ?? 0), icon: UserX, accent: "#dc2626", spark: [0, 1, 0, 1, 1, 0, 1] },
    { label: "Avg Score", value: stats?.avg_score ? stats.avg_score.toFixed(1) : "0", icon: Star, accent: "#8b5cf6", spark: [70, 72, 74, 76, 77, 79, 81] },
  ];

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-6 p-4 lg:p-6 min-h-screen" style={{ backgroundImage: bgSvgPattern }}>
      <PageHero
        title="Interview Scheduling"
        subtitle="Coordinate seamless interviews with automated invitations and calendar sync"
        image="/images/interviews/schedule.png"
        badge="Live Schedule"
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={() => setScheduleOpen(true)} className="bg-white text-brand-700 hover:bg-white/90 font-semibold shadow-sm">
              <CalendarPlus className="h-4 w-4 mr-1.5" /> Schedule Interview
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {statCards.map((s, idx) => (
          <div key={s.label} className={`animate-fade-slide-up stagger-${(idx % 5) + 1}`}>
            <StatCard {...s} />
          </div>
        ))}
      </div>

      {/* View Toggle Bar */}
      <div className="flex items-center justify-between gap-4 p-4 border border-line/80 rounded-2xl bg-white/90 backdrop-blur-md shadow-xs">
        <div className="text-sm font-semibold text-ink-900 flex items-center gap-2">
          <span>Active Interviews ({interviews.length})</span>
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-line/60">
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              viewMode === "table" ? "bg-white text-brand-700 shadow-xs" : "text-ink-500 hover:text-ink-900"
            }`}
          >
            <LayoutList className="h-3.5 w-3.5" /> Table View
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              viewMode === "calendar" ? "bg-white text-brand-700 shadow-xs" : "text-ink-500 hover:text-ink-900"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" /> Calendar View
          </button>
        </div>
      </div>

      <div className="flex gap-5">
        <div className="min-w-0 flex-1">
          {loading ? (
            <SkeletonTable rows={5} cols={5} showAvatar />
          ) : interviews.length === 0 ? (
            <Card className="p-8 border border-line/80 bg-white/90">
              <EmptyState
                title="No Scheduled Interviews"
                description="There are currently no candidate interviews on your calendar. Click below to invite a candidate and schedule a slot."
                action={
                  <Button onClick={() => setScheduleOpen(true)}>
                    <CalendarPlus className="h-4 w-4 mr-2" /> Schedule Interview Now
                  </Button>
                }
              />
            </Card>
          ) : viewMode === "table" ? (
            <Card className="overflow-hidden border border-line/80 shadow-sm bg-white/95 backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line bg-slate-50/70 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                      <th className="px-4 py-3.5">Candidate &amp; Code</th>
                      <th className="px-4 py-3.5">Scheduled Time</th>
                      <th className="px-4 py-3.5">Interview Type</th>
                      <th className="px-4 py-3.5">Interviewer Avatar</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5">Proctor Risk</th>
                      <th className="px-4 py-3.5">AI Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {interviews.map((itv, i) => {
                      const staggerClass = `stagger-${(i % 6) + 1}`;
                      const formattedDate = (itv as any).scheduled_at
                        ? new Date((itv as any).scheduled_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
                        : "Today, 2:00 PM";

                      return (
                        <tr
                          key={itv.id}
                          onClick={() => setSelected(itv)}
                          className={`cursor-pointer transition-colors duration-150 animate-fade-slide-up ${staggerClass} hover:bg-brand-50/50 ${selected?.id === itv.id ? "bg-brand-50/80" : ""}`}
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar name={itv.candidate_name} size="sm" />
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-ink-900">{itv.candidate_name}</p>
                                <p className="truncate text-xs text-ink-400 font-mono">{itv.interview_code}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 font-medium text-ink-700">
                            <div className="flex items-center gap-1.5 text-xs">
                              <Clock className="h-3.5 w-3.5 text-brand-600 shrink-0" />
                              {formattedDate}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-ink-600 font-medium">{itv.interview_type}</td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <Avatar name={(itv as any).interviewer_name || "AI Recruiter"} size="sm" />
                              <span className="text-xs text-ink-600 font-medium">
                                {(itv as any).interviewer_name || "AIR AI Engine"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge variant={itv.status === "Completed" ? "success" : itv.status === "In Progress" ? "warning" : "default"} dot>
                              {itv.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5">
                            {itv.face ? (
                              <Badge variant={itv.face.risk_level === "high" ? "danger" : itv.face.risk_level === "medium" ? "warning" : "success"}>
                                {itv.face.risk_level} risk
                              </Badge>
                            ) : (
                              <span className="text-xs text-ink-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            {itv.ai_score !== null ? <ScoreRing score={itv.ai_score} size={46} stroke={4} showLabel={false} /> : <span className="text-xs text-ink-400">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            /* Calendar Layout View */
            <div className="space-y-4 animate-fade-slide-up">
              <Card className="p-5 border border-line/80 bg-white/95 backdrop-blur-md">
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-wider text-ink-500 pb-3 border-b border-line/60">
                  {daysOfWeek.map(day => (
                    <div key={day} className="py-1">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2 pt-3 min-h-[360px]">
                  {[...Array(28)].map((_, dayIdx) => {
                    const dayInterviews = interviews.filter((_, idx) => idx % 7 === dayIdx % 7);
                    return (
                      <div key={dayIdx} className="border border-line/50 rounded-xl p-2 bg-slate-50/40 min-h-[100px] flex flex-col justify-start">
                        <span className="text-[11px] font-bold text-ink-400 mb-1">Aug {dayIdx + 1}</span>
                        {dayInterviews.map((itv) => (
                          <div
                            key={itv.id}
                            onClick={() => setSelected(itv)}
                            className="cursor-pointer mb-1.5 p-2 rounded-lg bg-brand-50 border border-brand-200 text-xs hover:border-brand-500 transition-all"
                          >
                            <p className="font-semibold text-brand-800 truncate">{itv.candidate_name}</p>
                            <p className="text-[10px] text-brand-600 truncate">{itv.interview_type}</p>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}
        </div>

        {selected && (
          <div className="hidden w-[400px] shrink-0 lg:block animate-fade-slide-in">
            <Card className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto border border-line/80 shadow-md">
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
    } catch (err) {
      console.error("Failed to schedule interview", err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Schedule Candidate Interview" size="max-w-md">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label>Select Candidate</Label>
          <Select required value={candidateId} onChange={(e) => setCandidateId(e.target.value)} className="rounded-xl">
            <option value="">Choose candidate from pipeline…</option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>{c.name} — {c.job_title}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Interview Format</Label>
          <Select value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl">
            <option>AI Automated Interview</option>
            <option>Live Technical Video Interview</option>
            <option>Behavioral Screen</option>
          </Select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={busy || !candidateId}>{busy ? "Scheduling…" : "Confirm Schedule"}</Button>
        </div>
      </form>
    </Modal>
  );
}

