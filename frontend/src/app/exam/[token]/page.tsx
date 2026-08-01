"use client";

import { use, useEffect, useState } from "react";
import { CheckCircle2, Clock } from "lucide-react";

import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";

interface PublicExam {
  token: string;
  candidate_name: string;
  job_title: string | null;
  status: string;
  questions: { id: string; text: string; options: string[] }[];
}

interface ExamResult {
  score: number;
  correct: number;
  total: number;
  status: string;
}

export default function ExamPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [exam, setExam] = useState<PublicExam | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<PublicExam>(`/exam/${token}`, { auth: false })
      .then((e) => {
        setExam(e);
        if (e.status === "completed") setError("This assessment has already been submitted.");
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Invalid link"))
      .finally(() => setLoading(false));
  }, [token]);

  async function submit() {
    if (!exam) return;
    if (Object.keys(answers).length < exam.questions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await api<ExamResult>(`/exam/${token}/submit`, { method: "POST", auth: false, body: { answers } });
      setResult(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Submission failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="flex h-16 items-center border-b border-line bg-white px-6">
        <Logo />
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
          </div>
        ) : result ? (
          <div className="rounded-2xl border border-line bg-white p-10 text-center shadow-card">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
              <CheckCircle2 className="h-8 w-8" />
            </span>
            <h1 className="mt-5 text-2xl font-bold text-ink-900">Assessment submitted</h1>
            <p className="mt-1 text-sm text-ink-500">Thank you for completing the assessment.</p>
            <div className="mt-6 inline-flex flex-col items-center rounded-2xl bg-brand-50 px-10 py-5">
              <span className="text-4xl font-bold text-brand-700">{result.score}%</span>
              <span className="text-sm text-ink-500">{result.correct} of {result.total} correct</span>
            </div>
          </div>
        ) : exam ? (
          <>
            <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
              <h1 className="text-xl font-bold text-ink-900">{exam.job_title} — Assessment</h1>
              <p className="mt-1 text-sm text-ink-500">Hi {exam.candidate_name}, answer the questions below.</p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
                <Clock className="h-3.5 w-3.5" /> {exam.questions.length} questions
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {exam.questions.map((q, i) => (
                <div key={q.id} className="rounded-2xl border border-line bg-white p-5 shadow-card">
                  <p className="font-medium text-ink-900">
                    <span className="mr-2 text-brand-600">{i + 1}.</span>
                    {q.text}
                  </p>
                  <div className="mt-3 space-y-2">
                    {q.options.map((opt, idx) => (
                      <label
                        key={idx}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition ${
                          answers[q.id] === idx ? "border-brand-300 bg-brand-50 text-brand-700" : "border-line text-ink-600 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          checked={answers[q.id] === idx}
                          onChange={() => setAnswers((a) => ({ ...a, [q.id]: idx }))}
                          className="accent-brand-600"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

            <Button size="lg" className="mt-5 w-full" onClick={submit} disabled={busy}>
              {busy ? "Submitting…" : "Submit Assessment"}
            </Button>
          </>
        ) : (
          <div className="rounded-2xl border border-line bg-white p-10 text-center shadow-card">
            <p className="text-lg font-semibold text-ink-900">Unable to load assessment</p>
            <p className="mt-1 text-sm text-rose-600">{error}</p>
          </div>
        )}
      </main>
    </div>
  );
}
