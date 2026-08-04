"use client";

import { use, useEffect, useState } from "react";
import { CheckCircle2, Clock, Loader2, Send } from "lucide-react";

import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { api, ApiError } from "@/lib/api";

interface PublicQuestion {
  id: string;
  text: string;
  options: string[];
  time_limit_sec: number;
}

interface PublicExam {
  token: string;
  candidate_name: string;
  job_title: string | null;
  status: string;
  questions: PublicQuestion[];
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [started, setStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);

  useEffect(() => {
    api<PublicExam>(`/exam/${token}`, { auth: false })
      .then((res) => {
        setExam(res);
        if (res.status === "completed") {
            setError("This assessment has already been submitted.");
        }
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Invalid or expired exam link"))
      .finally(() => setLoading(false));
  }, [token]);

  // Timer logic
  useEffect(() => {
    if (!started || !exam || currentIdx >= exam.questions.length || result || exam.status === "completed") return;

    const currentQ = exam.questions[currentIdx];
    if (timeLeft === null) {
      setTimeLeft(currentQ.time_limit_sec);
      return;
    }

    if (timeLeft <= 0) {
      handleNext();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, [started, currentIdx, timeLeft, exam, result]);

  const handleNext = () => {
    if (!exam) return;
    if (currentIdx < exam.questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setTimeLeft(null); // Reset for next question
    } else {
      submitExam();
    }
  };

  const selectOption = (qId: string, optIdx: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const submitExam = async () => {
    if (!exam) return;
    setSubmitting(true);
    try {
      const res = await api<ExamResult>(`/exam/${token}/submit`, {
        method: "POST",
        auth: false,
        body: { answers },
      });
      setResult(res);
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : "Failed to submit exam");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error && (!exam || exam.status === "completed")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-500">
            <span className="text-2xl font-bold">!</span>
          </div>
          <h1 className="mt-6 text-xl font-bold text-ink-900">Oops</h1>
          <p className="mt-2 text-ink-500">{error}</p>
        </Card>
      </div>
    );
  }

  if (!exam) return null;

  if (result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md p-8 text-center shadow-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-500">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-ink-900">Assessment Complete</h1>
          <p className="mt-2 text-ink-500">Thank you, {exam.candidate_name}, for completing the assessment.</p>
          
          <div className="mt-8 rounded-2xl border border-line bg-slate-50 p-6">
            <p className="text-sm font-medium text-ink-500 uppercase tracking-widest">Your Score</p>
            <div className="mt-2 flex items-end justify-center gap-1">
              <span className="text-5xl font-black text-ink-900">{result.score}%</span>
            </div>
          </div>
          
          <p className="mt-6 text-sm text-ink-400">You may close this window now.</p>
        </Card>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-lg p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-ink-900">Welcome, {exam.candidate_name}</h1>
          {exam.job_title && (
            <p className="mt-2 text-lg text-ink-600">Assessment for: <span className="font-semibold text-ink-900">{exam.job_title}</span></p>
          )}
          
          <div className="mt-8 space-y-4 rounded-xl bg-blue-50/50 p-5 text-sm text-blue-900">
            <h3 className="font-semibold text-blue-900">Instructions:</h3>
            <ul className="list-disc space-y-2 pl-5">
              <li>There are <b>{exam.questions.length} questions</b> in this assessment.</li>
              <li>Each question has a specific time limit.</li>
              <li>If the timer runs out, you will automatically be moved to the next question.</li>
              <li>You cannot go back to previous questions.</li>
              <li>Make sure you have a stable internet connection before starting.</li>
            </ul>
          </div>
          
          <div className="mt-8">
            <Button size="lg" className="w-full text-base h-12" onClick={() => setStarted(true)}>
              Start Assessment Now
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const currentQ = exam.questions[currentIdx];
  const selectedIdx = answers[currentQ.id];
  const isLast = currentIdx === exam.questions.length - 1;

  const getTimerColor = (sec: number | null) => {
    if (sec === null) return "text-ink-900";
    if (sec <= 10) return "text-rose-500 animate-pulse";
    if (sec <= 30) return "text-amber-500";
    return "text-ink-900";
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-line bg-white px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <Logo />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 font-mono text-sm font-semibold">
            <Clock className={`h-4 w-4 ${getTimerColor(timeLeft)}`} />
            <span className={getTimerColor(timeLeft)}>
              {timeLeft !== null ? `00:${timeLeft.toString().padStart(2, '0')}` : "--:--"}
            </span>
          </div>
          <div className="text-sm font-medium text-ink-500">
            Question {currentIdx + 1} of {exam.questions.length}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 p-4 py-8 lg:p-12">
        <Card className="overflow-hidden border-0 shadow-xl ring-1 ring-black/5">
          <div className="p-6 sm:p-10">
            <h2 className="text-xl font-medium leading-relaxed text-ink-900 sm:text-2xl">
              {currentQ.text}
            </h2>
            
            <div className="mt-10 grid gap-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedIdx === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => selectOption(currentQ.id, idx)}
                    className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-brand-600 bg-brand-50/50 ring-1 ring-brand-600"
                        : "border-line hover:border-brand-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                      isSelected ? "border-brand-600 bg-brand-600 text-white" : "border-line text-transparent"
                    }`}>
                      <div className={`h-2.5 w-2.5 rounded-full bg-current ${isSelected ? "opacity-100" : "opacity-0"}`} />
                    </div>
                    <span className={`text-base ${isSelected ? "font-medium text-brand-900" : "text-ink-700"}`}>
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-line bg-slate-50 px-6 py-5 sm:px-10">
            <div className="text-sm text-ink-500">
              {selectedIdx !== undefined ? "Selection saved." : "Please select an answer."}
            </div>
            
            {error && <p className="text-sm text-rose-600 mr-4">{error}</p>}

            <Button 
              size="lg" 
              onClick={handleNext} 
              disabled={submitting}
              className="min-w-[140px]"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isLast ? (
                <>Submit <Send className="ml-2 h-4 w-4" /></>
              ) : (
                "Next Question"
              )}
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
