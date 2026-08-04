import { useRef } from "react";
import { Sparkles } from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      if (search && !q.text.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [questions, search, categoryFilter]);

  const categories = useMemo(() => Array.from(new Set(questions.map((q) => q.category).filter(Boolean))), [questions]);

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
        title="Question Bank & AI Generator"
        subtitle="Manage MCQ question pools, upload CSV files, or generate questions via AWS Bedrock AI."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setAiModalOpen(true)}>
              <Sparkles className="h-4 w-4 text-emerald-600" /> AI Question Generator
            </Button>
            <Button variant="secondary" onClick={handleExportCSV}>
              <Download className="h-4 w-4" /> CSV Export
            </Button>
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={busy}>
              <Upload className="h-4 w-4" /> Upload CSV File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Add Question
            </Button>
          </div>
        }
      />

      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions by text…"
            className="h-10 min-w-[240px] flex-1"
          />
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-10 w-44">
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c!}>{c}</option>
            ))}
          </Select>
        </div>
      </Card>

      <div className="space-y-3">
        {loading ? (
          <Card className="px-5 py-12 text-center text-ink-400">Loading questions…</Card>
        ) : filtered.length === 0 ? (
          <Card className="px-5 py-12 text-center text-ink-400">No questions found. Add or generate questions.</Card>
        ) : (
          filtered.map((q, i) => (
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
                        {idx === q.correct_index && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
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
      <AIQuestionGeneratorModal open={aiModalOpen} onClose={() => setAiModalOpen(false)} onGenerated={() => load()} />

      {importing && (
        <Modal open={importing} onClose={() => setImporting(false)} title="Bulk Import MCQ Questions (CSV)" size="max-w-xl">
          <div className="space-y-4">
            <div className="text-sm text-ink-600">
              Paste your CSV data below. Format:<br />
              <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">Question, Option1, Option2, Option3, Option4, CorrectOptionIndex(0-3), TimeLimitSeconds, Category, Difficulty</code>
            </div>
            <textarea
              value={importCsv}
              onChange={(e) => setImportCsv(e.target.value)}
              placeholder={`Question,Option1,Option2,Option3,Option4,CorrectOptionIndex,TimeLimitSeconds,Category,Difficulty\nWhat is React?,A Library,A Framework,A Database,A Language,0,60,Frontend,easy`}
              className="h-44 w-full rounded-xl border border-line p-3 font-mono text-xs focus:border-brand-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
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
        <div className="grid grid-cols-3 gap-4">
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
          <div>
            <Label>Time Limit (sec)</Label>
            <Input type="number" min={5} value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} />
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

function AIQuestionGeneratorModal({ open, onClose, onGenerated }: { open: boolean; onClose: () => void; onGenerated: () => void }) {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(3);
  const [difficulty, setDifficulty] = useState("medium");
  const [busy, setBusy] = useState(false);

  async function generate() {
    if (!topic.trim()) return;
    setBusy(true);
    try {
      await api("/questions/ai_generate", {
        method: "POST",
        body: { topic: topic.trim(), num_questions: count, difficulty },
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

  return (
    <Modal open={open} onClose={onClose} title="AWS Bedrock AI Question Generator" size="max-w-md">
      <div className="space-y-4">
        <div>
          <Label>Skill / Topic</Label>
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Python AsyncIO, React Hooks, System Architecture" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Question Count</Label>
            <Input type="number" min={1} max={10} value={count} onChange={(e) => setCount(Number(e.target.value))} />
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
        <div className="rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-800 border border-emerald-200">
          ⚡ Powered by AWS Bedrock AI Engine (Claude 3 Haiku / Titan - lowest cost model).
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button onClick={generate} disabled={busy || !topic.trim()}>
            {busy ? "Generating…" : `Generate ${count} Questions`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

