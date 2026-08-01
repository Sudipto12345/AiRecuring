"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Lock, Plus, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Question } from "@/lib/types";

export default function QuestionBankPage() {
  const { hasModule } = useAuth();
  const enabled = hasModule("examPortal");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    try {
      setQuestions(await api<Question[]>("/questions"));
    } catch {
      /* gated */
    }
    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(id: string) {
    await api(`/questions/${id}`, { method: "DELETE" });
    setQuestions((q) => q.filter((x) => x.id !== id));
  }

  if (!enabled) {
    return (
      <div className="space-y-5 p-4 lg:p-6">
        <PageHeader title="Question Bank" subtitle="Build assessment questions for the exam portal." />
        <Card className="flex flex-col items-center gap-3 px-6 py-20 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
            <Lock className="h-6 w-6" />
          </span>
          <p className="text-lg font-semibold text-ink-900">Exam Portal is a Pro feature</p>
          <p className="max-w-sm text-sm text-ink-500">
            Upgrade your plan to build a question bank and send automated assessment exams to candidates.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 lg:p-6">
      <PageHeader
        title="Question Bank"
        subtitle="Build assessment questions for the exam portal."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Add Question
          </Button>
        }
      />

      <div className="space-y-3">
        {loading ? (
          <Card className="px-5 py-12 text-center text-ink-400">Loading…</Card>
        ) : questions.length === 0 ? (
          <Card className="px-5 py-12 text-center text-ink-400">No questions yet. Add your first one.</Card>
        ) : (
          questions.map((q, i) => (
            <Card key={q.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-ink-400">Q{i + 1}</span>
                    {q.category && <Badge variant="brand">{q.category}</Badge>}
                    <Badge variant={q.difficulty === "hard" ? "danger" : q.difficulty === "easy" ? "success" : "warning"}>
                      {q.difficulty}
                    </Badge>
                  </div>
                  <p className="mt-1.5 font-medium text-ink-900">{q.text}</p>
                  <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                    {q.options.map((opt, idx) => (
                      <li
                        key={idx}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm ${
                          idx === q.correct_index ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-line text-ink-600"
                        }`}
                      >
                        {idx === q.correct_index && <CheckCircle2 className="h-3.5 w-3.5" />}
                        {opt}
                      </li>
                    ))}
                  </ul>
                </div>
                <button onClick={() => remove(q.id)} className="text-ink-400 hover:text-rose-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      <QuestionModal open={open} onClose={() => setOpen(false)} onCreated={() => load()} />
    </div>
  );
}

function QuestionModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [text, setText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const opts = options.map((o) => o.trim()).filter(Boolean);
    if (opts.length < 2) {
      setError("Add at least two options.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api("/questions", {
        method: "POST",
        body: { text, options: opts, correct_index: Math.min(correct, opts.length - 1), category: category || null, difficulty },
      });
      setText("");
      setOptions(["", "", "", ""]);
      setCorrect(0);
      setCategory("");
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add question");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Question" size="max-w-xl">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label>Question</Label>
          <Input required value={text} onChange={(e) => setText(e.target.value)} placeholder="What does the useEffect hook do?" />
        </div>
        <div className="space-y-2">
          <Label>Options (select the correct one)</Label>
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input type="radio" name="correct" checked={correct === idx} onChange={() => setCorrect(idx)} className="accent-brand-600" />
              <Input value={opt} onChange={(e) => setOptions((o) => o.map((v, i) => (i === idx ? e.target.value : v)))} placeholder={`Option ${idx + 1}`} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Category</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="React" />
          </div>
          <div>
            <Label>Difficulty</Label>
            <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Select>
          </div>
        </div>
        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={busy}>{busy ? "Adding…" : "Add Question"}</Button>
        </div>
      </form>
    </Modal>
  );
}
