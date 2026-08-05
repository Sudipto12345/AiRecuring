"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Download, HelpCircle, Layers, Lock, Plus, Sparkles, Trash2, Upload, X, BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

import { PageHero } from "@/components/ui/PageHero";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { api, ApiError, getToken } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Question } from "@/lib/types";

export default function QuestionBankPage() {
  const { hasModule } = useAuth();
  const enabled = hasModule("examPortal");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importCsv, setImportCsv] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [fetchError, setFetchError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setFetchError(null);
    try {
      setQuestions(await api<Question[]>("/questions"));
    } catch (err: any) {
      console.error("Failed to load questions", err);
      setFetchError(err?.message || "Failed to fetch question bank. Please check your network connection or server status.");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(id: string) {
    if (!confirm("Are you sure you want to delete this question?")) return;
    await api(`/questions/${id}`, { method: "DELETE" });
    setQuestions((q) => q.filter((x) => x.id !== id));
  }

  const handleExportCSV = () => {
    const headers = "ID,Question,Category,Difficulty\n";
    const csvRows = questions.map((r) => `"${r.id}","${r.text.replace(/"/g, '""')}","${r.category || ""}","${r.difficulty}"`).join("\n");
    const blob = new Blob([headers + csvRows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "question-bank-export.csv";
    a.click();
  };

  async function handleFileUpload(file: File) {
    setBusy(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const res = await fetch(`${base}/questions/upload_csv`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: form,
      });
      if (!res.ok) throw new Error("CSV Upload failed");
      await load();
      alert("CSV questions imported successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to upload CSV");
    } finally {
      setBusy(false);
    }
  }

  async function handleBulkImport() {
    setBusy(true);
    try {
      const rows = importCsv.trim().split("\n");
      if (rows.length < 2) throw new Error("CSV must have a header row and at least one data row.");
      
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].split(",").map(c => c.trim().replace(/^"|"$/g, ''));
        if (cols.length < 5) continue;
        const [text, opt1, opt2, opt3, opt4, correctStr, timeStr, category, difficulty] = cols;
        const options = [opt1, opt2, opt3, opt4].filter(Boolean);
        const correct_index = parseInt(correctStr) || 0;
        const time_limit_sec = parseInt(timeStr) || 60;
        
        await api("/questions", { 
          method: "POST", 
          body: { 
            text, 
            options, 
            correct_index, 
            time_limit_sec, 
            category: category || null, 
            difficulty: difficulty || "medium" 
          } 
        });
      }
      setImporting(false);
      setImportCsv("");
      load();
    } catch (err: any) {
      alert(`Bulk Import Error: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      if (categoryFilter && q.category !== categoryFilter) return false;
      if (search) {
        const qLower = search.toLowerCase();
        const matchesText = q.text.toLowerCase().includes(qLower);
        const matchesCategory = (q.category || "").toLowerCase().includes(qLower);
        const matchesOptions = q.options?.some((opt) => opt.toLowerCase().includes(qLower));
        if (!matchesText && !matchesCategory && !matchesOptions) return false;
      }
      return true;
    });
  }, [questions, search, categoryFilter]);

  const categories = useMemo(() => Array.from(new Set(questions.map((q) => q.category).filter(Boolean))), [questions]);

  const stats = useMemo(() => {
    const easy = questions.filter(q => q.difficulty === "easy").length;
    const medium = questions.filter(q => q.difficulty === "medium").length;
    const hard = questions.filter(q => q.difficulty === "hard").length;
    return { total: questions.length, easy, medium, hard, categoriesCount: categories.length };
  }, [questions, categories]);

  const bgSvgPattern = "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232a7553' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

  if (!enabled) {
    return (
      <div className="space-y-6 p-4 lg:p-6 min-h-screen" style={{ backgroundImage: bgSvgPattern }}>
        <PageHero title="Question Bank" subtitle="Build intelligent assessments from a curated library of technical and behavioral questions" badge="Exam Ready" />
        <Card className="flex flex-col items-center gap-4 px-6 py-20 text-center border border-line/80 shadow-sm bg-white/90">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
            <Lock className="h-7 w-7" />
          </span>
          <p className="text-xl font-bold text-ink-900">Exam Portal is a Pro feature</p>
          <p className="max-w-md text-sm text-ink-500 leading-relaxed">
            Upgrade your plan to build an enterprise question bank, generate AI questions via Bedrock, and dispatch automated candidate assessments.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6 min-h-screen" style={{ backgroundImage: bgSvgPattern }}>
      <PageHero
        title="Question Bank"
        subtitle="Build intelligent assessments from a curated library of technical and behavioral questions"
        badge="Exam Ready"
        actions={
          <div className="flex flex-wrap gap-2.5">
            <Button variant="secondary" onClick={() => setAiModalOpen(true)} className="bg-white/20 text-white hover:bg-white/30 border-white/20 backdrop-blur-md">
              <Sparkles className="h-4 w-4 mr-1.5 text-emerald-300" /> AI Generator
            </Button>
            <Button variant="secondary" onClick={handleExportCSV} className="bg-white/20 text-white hover:bg-white/30 border-white/20 backdrop-blur-md">
              <Download className="h-4 w-4 mr-1.5" /> Export CSV
            </Button>
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={busy} className="bg-white/20 text-white hover:bg-white/30 border-white/20 backdrop-blur-md">
              <Upload className="h-4 w-4 mr-1.5" /> Upload CSV
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
            <Button onClick={() => setOpen(true)} className="bg-white text-brand-700 hover:bg-white/90 font-semibold shadow-sm">
              <Plus className="h-4 w-4 mr-1.5" /> Add Question
            </Button>
          </div>
        }
      />

      {/* Top Question Stats Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        <Card className="p-3.5 border border-line/80 bg-white/90 backdrop-blur-md animate-fade-slide-up stagger-1">
          <div className="flex items-center justify-between text-xs text-ink-500 font-medium">
            <span>Total Questions</span>
            <HelpCircle className="h-4 w-4 text-brand-600" />
          </div>
          <p className="mt-1 text-2xl font-bold text-ink-900">{stats.total}</p>
        </Card>
        <Card className="p-3.5 border border-line/80 bg-white/90 backdrop-blur-md animate-fade-slide-up stagger-2">
          <div className="flex items-center justify-between text-xs text-emerald-700 font-medium">
            <span>Easy Difficulty</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{stats.easy}</p>
        </Card>
        <Card className="p-3.5 border border-line/80 bg-white/90 backdrop-blur-md animate-fade-slide-up stagger-3">
          <div className="flex items-center justify-between text-xs text-amber-700 font-medium">
            <span>Medium Difficulty</span>
            <span className="h-2 w-2 rounded-full bg-amber-500" />
          </div>
          <p className="mt-1 text-2xl font-bold text-amber-700">{stats.medium}</p>
        </Card>
        <Card className="p-3.5 border border-line/80 bg-white/90 backdrop-blur-md animate-fade-slide-up stagger-4">
          <div className="flex items-center justify-between text-xs text-rose-700 font-medium">
            <span>Hard Difficulty</span>
            <span className="h-2 w-2 rounded-full bg-rose-500" />
          </div>
          <p className="mt-1 text-2xl font-bold text-rose-700">{stats.hard}</p>
        </Card>
        <Card className="col-span-2 sm:col-span-4 lg:col-span-1 p-3.5 border border-line/80 bg-white/90 backdrop-blur-md animate-fade-slide-up stagger-5">
          <div className="flex items-center justify-between text-xs text-ink-500 font-medium">
            <span>Categories</span>
            <Layers className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-1 text-2xl font-bold text-purple-700">{stats.categoriesCount}</p>
        </Card>
      </div>

      {/* Filter and Category Chips */}
      <Card className="p-4 border border-line/80 bg-white/90 backdrop-blur-md space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions by keyword or topic…"
            className="h-10 min-w-[260px] flex-1 rounded-xl"
          />
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-10 w-48 rounded-xl">
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c!}>{c}</option>
            ))}
          </Select>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-line/60">
            <span className="text-xs font-semibold text-ink-400 mr-1">Filter Tag:</span>
            <button
              onClick={() => setCategoryFilter("")}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${
                !categoryFilter ? "bg-brand-600 text-white shadow-xs" : "bg-slate-100 text-ink-600 hover:bg-slate-200"
              }`}
            >
              All ({questions.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat!)}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${
                  categoryFilter === cat ? "bg-brand-600 text-white shadow-xs" : "bg-slate-100 text-ink-600 hover:bg-slate-200"
                }`}
              >
                {cat} ({questions.filter(q => q.category === cat).length})
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Grid of Question Cards */}
      {fetchError ? (
        <Card className="p-8 border border-rose-200 bg-rose-50/50">
          <div className="flex flex-col items-center text-center space-y-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 font-bold">
              ⚠️
            </span>
            <h3 className="text-lg font-bold text-rose-900">Failed to Load Questions</h3>
            <p className="text-xs text-rose-700 max-w-md">{fetchError}</p>
            <Button onClick={() => load()} className="bg-rose-600 text-white hover:bg-rose-700 font-semibold shadow-xs">
              🔄 Retry Fetching Questions
            </Button>
          </div>
        </Card>
      ) : loading ? (
        <SkeletonTable rows={4} cols={4} />
      ) : filtered.length === 0 ? (
        <Card className="p-8 border border-line/80 bg-white/90">
          <EmptyState
            title="No Assessment Questions Found"
            description="We couldn't find any questions matching your selected filters. Create a new question or use AI generation to quickly populate your question bank."
            action={
              <Button onClick={() => setAiModalOpen(true)}>
                <Sparkles className="h-4 w-4 mr-2 text-emerald-500" /> Generate AI Questions Now
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((q, i) => {
            const isHard = q.difficulty === "hard";
            const isEasy = q.difficulty === "easy";
            const diffClass = isEasy
              ? "bg-emerald-100 text-emerald-800 border-emerald-300/80"
              : isHard
              ? "bg-rose-100 text-rose-800 border-rose-300/80"
              : "bg-amber-100 text-amber-800 border-amber-300/80";

            const staggerClass = `stagger-${(i % 6) + 1}`;

            return (
              <Card
                key={q.id}
                className={`p-5 border border-line/80 bg-white/95 backdrop-blur-md shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between animate-fade-slide-up ${staggerClass}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-ink-600">
                        Q{i + 1}
                      </span>
                      {q.category && (
                        <span className="rounded-md bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 border border-brand-200/80">
                          {q.category}
                        </span>
                      )}
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${diffClass}`}>
                        {q.difficulty.toUpperCase()}
                      </span>
                    </div>

                    <button
                      onClick={() => remove(q.id)}
                      className="p-1.5 text-ink-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Question"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="font-semibold text-ink-900 text-sm leading-relaxed mt-2">{q.text}</p>

                  <ul className="mt-3.5 space-y-2">
                    {q.options.map((opt, idx) => (
                      <li
                        key={idx}
                        className={`flex items-start gap-2.5 rounded-xl border px-3 py-2 text-xs transition-colors ${
                          idx === q.correct_index
                            ? "border-emerald-300 bg-emerald-50/90 font-medium text-emerald-900 shadow-2xs"
                            : "border-line/70 bg-slate-50/50 text-ink-700"
                        }`}
                      >
                        <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                          idx === q.correct_index ? "bg-emerald-600 text-white" : "bg-slate-200 text-ink-600"
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {idx === q.correct_index && (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-line/50 flex items-center justify-between text-[11px] text-ink-400 font-medium">
                  <span>Time limit: {q.time_limit_sec || 60}s</span>
                  <span>ID: {q.id.slice(0, 8)}…</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <QuestionModal open={open} onClose={() => setOpen(false)} onCreated={() => load()} />
      <AIQuestionGeneratorModal open={aiModalOpen} onClose={() => setAiModalOpen(false)} onGenerated={() => load()} />

      {importing && (
        <Modal open={importing} onClose={() => setImporting(false)} title="Bulk Import MCQ Questions (CSV)" size="max-w-xl">
          <div className="space-y-4">
            <div className="text-sm text-ink-600 leading-relaxed">
              Paste your CSV content below adhering to the following column layout:<br />
              <code className="text-xs bg-slate-100 p-1.5 rounded-lg border border-line block mt-1 font-mono">
                Question, Option1, Option2, Option3, Option4, CorrectOptionIndex(0-3), TimeLimitSeconds, Category, Difficulty
              </code>
            </div>
            <textarea
              value={importCsv}
              onChange={(e) => setImportCsv(e.target.value)}
              placeholder={`Question,Option1,Option2,Option3,Option4,CorrectOptionIndex,TimeLimitSeconds,Category,Difficulty\nWhat is React?,A Library,A Framework,A Database,A Language,0,60,Frontend,easy`}
              className="h-48 w-full rounded-xl border border-line p-3 font-mono text-xs focus:border-brand-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2.5">
              <Button variant="secondary" onClick={() => setImporting(false)}>Cancel</Button>
              <Button onClick={handleBulkImport} disabled={busy || !importCsv}>{busy ? "Importing…" : "Execute Bulk Import"}</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function QuestionModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [text, setText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [timeLimit, setTimeLimit] = useState(60);
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
        body: { text, options: opts, correct_index: Math.min(correct, opts.length - 1), category: category || null, difficulty, time_limit_sec: timeLimit },
      });
      setText("");
      setOptions(["", "", "", ""]);
      setCorrect(0);
      setCategory("");
      setTimeLimit(60);
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add question");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add New Question" size="max-w-xl">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label>Question Text</Label>
          <Input required value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. What is the difference between REST and GraphQL?" />
        </div>
        <div className="space-y-2">
          <Label>Answer Options (select the correct radio button)</Label>
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2.5">
              <input type="radio" name="correct" checked={correct === idx} onChange={() => setCorrect(idx)} className="accent-brand-600 h-4 w-4" />
              <Input value={opt} onChange={(e) => setOptions((o) => o.map((v, i) => (i === idx ? e.target.value : v)))} placeholder={`Option ${String.fromCharCode(65 + idx)}`} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>Category</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. System Design" />
          </div>
          <div>
            <Label>Difficulty</Label>
            <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Select>
          </div>
          <div>
            <Label>Time Limit (sec)</Label>
            <Input type="number" min={5} value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} />
          </div>
        </div>
        {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600 font-medium">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={busy}>{busy ? "Adding…" : "Save Question"}</Button>
        </div>
      </form>
    </Modal>
  );
}

function AIQuestionGeneratorModal({ open, onClose, onGenerated }: { open: boolean; onClose: () => void; onGenerated: () => void }) {
  const [topic, setTopic] = useState("");
  const [cluster, setCluster] = useState("Software Engineering");
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState("mixed");
  const [busy, setBusy] = useState(false);

  async function generate() {
    if (!topic.trim()) return;
    setBusy(true);
    try {
      await api("/questions/ai_generate", {
        method: "POST",
        body: { topic: topic.trim(), num_questions: count, difficulty, cluster },
      });
      onGenerated();
      onClose();
      setTopic("");
    } catch {
      alert("Failed to generate AI questions");
    } finally {
      setBusy(false);
    }
  }

  const clusters = ["Software Engineering", "Data Science", "DevOps", "Product Management", "Design"];

  const difficultyData = useMemo(() => {
    if (difficulty === "easy") return [{ name: "Easy", val: count, color: "#10b981" }, { name: "Med", val: 0, color: "#f59e0b" }, { name: "Hard", val: 0, color: "#ef4444" }];
    if (difficulty === "medium") return [{ name: "Easy", val: 0, color: "#10b981" }, { name: "Med", val: count, color: "#f59e0b" }, { name: "Hard", val: 0, color: "#ef4444" }];
    if (difficulty === "hard") return [{ name: "Easy", val: 0, color: "#10b981" }, { name: "Med", val: 0, color: "#f59e0b" }, { name: "Hard", val: count, color: "#ef4444" }];
    // Mixed
    const easy = Math.floor(count * 0.3);
    const hard = Math.floor(count * 0.2);
    const med = count - easy - hard;
    return [
      { name: "Easy", val: easy, color: "#10b981" },
      { name: "Med", val: med, color: "#f59e0b" },
      { name: "Hard", val: hard, color: "#ef4444" }
    ];
  }, [difficulty, count]);

  return (
    <Modal open={open} onClose={onClose} title="AWS Bedrock AI Question Generator" size="max-w-xl">
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <Label>Target Skill / Topic</Label>
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. React Hooks, Docker..." />
            </div>
            <div>
              <Label>Domain Cluster</Label>
              <Select value={cluster} onChange={(e) => setCluster(e.target.value)}>
                {clusters.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Count</Label>
                <Input type="number" min={1} max={20} value={count} onChange={(e) => setCount(Number(e.target.value))} />
              </div>
              <div>
                <Label>Profile</Label>
                <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="mixed">Mixed</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-center items-center">
            <h4 className="text-xs font-semibold text-slate-500 mb-2 w-full flex items-center"><BarChart2 className="w-4 h-4 mr-1"/> Expected Distribution</h4>
            <div className="w-full h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={difficultyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                  <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl bg-emerald-50/90 p-3 text-xs text-emerald-800 border border-emerald-200 font-medium">
          ⚡ Powered by AWS Bedrock AI Engine (Claude 3 / Titan) with intelligent distractor generation.
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button onClick={generate} disabled={busy || !topic.trim()}>
            {busy ? "Generating…" : `Generate ${count} Questions`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}


