"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, FileQuestion, Plus, Send } from "lucide-react";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Label, Select } from "@/components/ui/Field";
import { api, ApiError } from "@/lib/api";
import type { BulkDispatchResult, Candidate, Exam } from "@/lib/types";

export function ExamDispatch({
  open,
  onClose,
  jobId,
  jobTitle,
}: {
  open: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
}) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [examId, setExamId] = useState<string>("");
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(100);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkDispatchResult | null>(null);

  const load = useCallback(async () => {
    const [e, c] = await Promise.all([
      api<Exam[]>(`/jobs/${jobId}/exams`),
      api<Candidate[]>(`/candidates?job_id=${jobId}&sort=score`),
    ]);
    setExams(e);
    setCandidates(c);
    if (e.length && !examId) setExamId(e[0].id);
    if (!e.length) setShowCreate(true);
  }, [jobId, examId]);

  useEffect(() => {
    if (open) {
      setResult(null);
      setError(null);
      load();
    }
  }, [open, load]);

  const inRange = useMemo(
    () => candidates.filter((c) => c.overall_score >= minScore && c.overall_score <= maxScore),
    [candidates, minScore, maxScore],
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function selectAllInRange() {
    setSelected(new Set(inRange.map((c) => c.id)));
  }

  const activeExam = exams.find((e) => e.id === examId);

  async function dispatch() {
    if (!examId || selected.size === 0) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api<BulkDispatchResult>(`/jobs/${jobId}/exams/${examId}/dispatch`, {
        method: "POST",
        body: { candidate_ids: Array.from(selected), min_score: minScore, max_score: maxScore },
      });
      setResult(res);
      setSelected(new Set());
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Dispatch failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Exams — ${jobTitle}`} size="max-w-2xl">
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <Label>Exam</Label>
            <Select value={examId} onChange={(e) => setExamId(e.target.value)}>
              {exams.length === 0 && <option value="">No exams yet</option>}
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} · {e.category} ({e.num_questions}Q)
                </option>
              ))}
            </Select>
          </div>
          <Button variant="secondary" onClick={() => setShowCreate((v) => !v)}>
            <Plus className="h-4 w-4" /> New exam
          </Button>
        </div>

        {activeExam && (
          <div className="flex flex-wrap gap-2 text-[11px] text-ink-500">
            <Badge tone="indigo">{activeExam.duration_min} min</Badge>
            <Badge tone="slate">Pass {activeExam.pass_score}%</Badge>
            <Badge tone={activeExam.available_questions >= activeExam.num_questions ? "green" : "amber"}>
              {activeExam.available_questions} questions in bank
            </Badge>
            <Badge tone="violet">{activeExam.sent_count} sent</Badge>
          </div>
        )}

        {showCreate && <CreateExam jobId={jobId} onCreated={(e) => { setExams((x) => [e, ...x]); setExamId(e.id); setShowCreate(false); }} />}

        <div className="rounded-xl border border-line p-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-end gap-2">
              <div>
                <Label>Min AI score</Label>
                <Input type="number" min={0} max={100} value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="w-24" />
              </div>
              <div>
                <Label>Max AI score</Label>
                <Input type="number" min={0} max={100} value={maxScore} onChange={(e) => setMaxScore(Number(e.target.value))} className="w-24" />
              </div>
            </div>
            <button onClick={selectAllInRange} className="text-xs font-medium text-brand-600 hover:underline">
              Select all in range ({inRange.length})
            </button>
          </div>

          <div className="mt-3 max-h-64 overflow-y-auto">
            {inRange.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-400">No candidates in this score range.</p>
            ) : (
              inRange.map((c) => (
                <label
                  key={c.id}
                  className="flex cursor-pointer items-center gap-3 border-b border-line/60 py-2 last:border-0 hover:bg-slate-50"
                >
                  <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} className="h-4 w-4 accent-brand-600" />
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-[11px] font-bold text-brand-600">
                    {Math.round(c.overall_score)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900">{c.name}</p>
                    <p className="truncate text-[11px] text-ink-400">{c.email ?? "no email"}</p>
                  </div>
                  {!c.email && <Badge tone="amber">no email</Badge>}
                  {c.exam_status === "sent" && <Badge tone="violet">sent</Badge>}
                </label>
              ))
            )}
          </div>
        </div>

        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}
        {result && (
          <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> Sent to {result.sent} candidate(s){result.skipped ? `, ${result.skipped} skipped` : ""}.
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-ink-400">{selected.size} selected</span>
          <Button onClick={dispatch} disabled={busy || !examId || selected.size === 0}>
            <Send className="h-4 w-4" /> {busy ? "Sending…" : `Send exam to ${selected.size}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function CreateExam({ jobId, onCreated }: { jobId: string; onCreated: (e: Exam) => void }) {
  const [form, setForm] = useState({ title: "", category: "Technical", num_questions: 5, duration_min: 30, pass_score: 60 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const created = await api<Exam>(`/jobs/${jobId}/exams`, { method: "POST", body: form });
      onCreated(created);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create exam");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-2 gap-3 rounded-xl border border-dashed border-line bg-slate-50/60 p-3">
      <div className="col-span-2 flex items-center gap-1.5 text-xs font-semibold text-ink-700">
        <FileQuestion className="h-4 w-4 text-brand-500" /> New exam for this job
      </div>
      <div className="col-span-2">
        <Label>Title</Label>
        <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Frontend Screening" />
      </div>
      <div>
        <Label>Category</Label>
        <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option>Technical</option>
          <option>Aptitude</option>
          <option>General</option>
        </Select>
      </div>
      <div>
        <Label>Questions</Label>
        <Input type="number" min={1} max={100} value={form.num_questions} onChange={(e) => setForm({ ...form, num_questions: Number(e.target.value) })} />
      </div>
      <div>
        <Label>Duration (min)</Label>
        <Input type="number" min={5} max={240} value={form.duration_min} onChange={(e) => setForm({ ...form, duration_min: Number(e.target.value) })} />
      </div>
      <div>
        <Label>Pass score (%)</Label>
        <Input type="number" min={0} max={100} value={form.pass_score} onChange={(e) => setForm({ ...form, pass_score: Number(e.target.value) })} />
      </div>
      {error && <p className="col-span-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}
      <div className="col-span-2">
        <Button type="submit" disabled={busy} className="w-full">{busy ? "Creating…" : "Create exam"}</Button>
      </div>
    </form>
  );
}
