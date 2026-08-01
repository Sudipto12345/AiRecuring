"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Download, Upload, Eye, Pencil, Trash2, X, Check, FileCode } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { type Column, DataGrid } from "@/components/admin/DataGrid";
import { Badge } from "@/components/ui/Badge";
import { api, ApiError } from "@/lib/api";

interface MCQQuestionRow {
  id: string;
  text: string;
  options: string[];
  correct_index: number;
  category: string | null;
  difficulty: "easy" | "medium" | "hard";
  company: string;
  created_at: string;
}

export default function QuestionBankPage() {
  const [rows, setRows] = useState<MCQQuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState<MCQQuestionRow | null>(null);
  const [importing, setImporting] = useState(false);
  const [text, setText] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correctIndex, setCorrectIndex] = useState(0);
  const [category, setCategory] = useState("Technical");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [importJson, setImportJson] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<MCQQuestionRow[]>("/admin/recruitment/questions");
      setRows(data);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(rows, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mcq-question-bank.json";
    a.click();
  };

  const handleExportCSV = () => {
    const headers = "ID,Question,Category,Difficulty\n";
    const csvRows = rows.map((r) => `"${r.id}","${r.text.replace(/"/g, '""')}","${r.category || ""}","${r.difficulty}"`).join("\n");
    const blob = new Blob([headers + csvRows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mcq-question-bank.csv";
    a.click();
  };

  async function handleCreateQuestion() {
    setBusy(true);
    try {
      await api("/questions", {
        method: "POST",
        body: {
          text,
          options: [optA, optB, optC, optD].filter(Boolean),
          correct_index: correctIndex,
          category,
          difficulty,
        },
      });
      setCreating(false);
      setText("");
      setOptA(""); setOptB(""); setOptC(""); setOptD("");
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to add MCQ question");
    } finally {
      setBusy(false);
    }
  }

  async function handleBulkImport() {
    setBusy(true);
    try {
      const parsed = JSON.parse(importJson);
      if (!Array.isArray(parsed)) throw new Error("JSON payload must be an array of questions.");
      for (const item of parsed) {
        await api("/questions", { method: "POST", body: item });
      }
      setImporting(false);
      setImportJson("");
      load();
    } catch (err: any) {
      alert(`Bulk Import Error: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  const columns: Column<MCQQuestionRow>[] = [
    {
      key: "text",
      header: "MCQ Question",
      sortValue: (r) => r.text,
      render: (r) => (
        <div>
          <p className="line-clamp-2 text-sm font-medium text-slate-900">{r.text}</p>
          <span className="text-xs text-slate-400">{r.options?.length || 4} multiple choices</span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (r) => <span className="text-xs font-semibold text-slate-700">{r.category || "General"}</span>,
    },
    {
      key: "difficulty",
      header: "Difficulty",
      sortValue: (r) => r.difficulty,
      render: (r) => {
        const tone = r.difficulty === "easy" ? "green" : r.difficulty === "hard" ? "rose" : "amber";
        return <Badge tone={tone}>{r.difficulty}</Badge>;
      },
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => setViewing(r)} className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            <Eye className="h-3.5 w-3.5" /> View Options
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Global MCQ Question Bank"
        subtitle="Repository of multiple-choice assessment questions across all tenants with bulk import/export capabilities."
        actions={
          <div className="flex gap-2">
            <button onClick={handleExportCSV} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              <Download className="h-4 w-4" /> CSV Export
            </button>
            <button onClick={() => setImporting(true)} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              <Upload className="h-4 w-4" /> Bulk Import
            </button>
            <button onClick={() => setCreating(true)} className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700">
              <Plus className="h-4 w-4" /> New MCQ Question
            </button>
          </div>
        }
      />

      <DataGrid
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        loading={loading}
        search={(r) => `${r.text} ${r.category || ""}`}
        searchPlaceholder="Search MCQ questions…"
        storageKey="admin-mcq-questions"
      />

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCreating(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add New MCQ Question</h3>
              <button onClick={() => setCreating(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Question Text</label>
                <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter multiple choice question..." className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:outline-none" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input value={optA} onChange={(e) => setOptA(e.target.value)} placeholder="Option A" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                <input value={optB} onChange={(e) => setOptB(e.target.value)} placeholder="Option B" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                <input value={optC} onChange={(e) => setOptC(e.target.value)} placeholder="Option C" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                <input value={optD} onChange={(e) => setOptD(e.target.value)} placeholder="Option D" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Correct Option</label>
                  <select value={correctIndex} onChange={(e) => setCorrectIndex(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                    <option value={0}>Option A</option>
                    <option value={1}>Option B</option>
                    <option value={2}>Option C</option>
                    <option value={3}>Option D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Difficulty</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setCreating(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
              <button onClick={handleCreateQuestion} disabled={busy || !text} className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">Save Question</button>
            </div>
          </div>
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewing(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">MCQ Details</h3>
              <button onClick={() => setViewing(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 space-y-3">
              <p className="text-sm font-semibold text-slate-900">{viewing.text}</p>
              <div className="space-y-1.5">
                {viewing.options?.map((opt, idx) => (
                  <div key={idx} className={`rounded-lg border p-2.5 text-xs font-medium ${idx === viewing.correct_index ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold" : "border-slate-200 text-slate-700"}`}>
                    {String.fromCharCode(65 + idx)}. {opt} {idx === viewing.correct_index && "✓ (Correct Answer)"}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {importing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setImporting(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Bulk Import MCQ Questions (JSON)</h3>
              <button onClick={() => setImporting(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4">
              <textarea value={importJson} onChange={(e) => setImportJson(e.target.value)} placeholder='[{"text": "Sample MCQ?", "options": ["A", "B", "C", "D"], "correct_index": 0, "difficulty": "easy"}]' className="h-40 w-full rounded-xl border border-slate-200 p-3 font-mono text-xs focus:border-indigo-500 focus:outline-none" />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setImporting(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
              <button onClick={handleBulkImport} disabled={busy || !importJson} className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">Execute Bulk Import</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
