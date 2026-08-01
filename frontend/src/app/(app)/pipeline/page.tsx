"use client";

import { useEffect, useMemo, useState } from "react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useDrawer } from "@/components/admin/ContextDrawer";
import { api } from "@/lib/api";
import type { Candidate } from "@/lib/types";

const COLUMNS: { key: string; label: string; color: string; match: (s: string) => boolean }[] = [
  { key: "applied", label: "Applied", color: "#6366f1", match: (s) => s === "Applied" || s === "New" },
  { key: "screened", label: "Screened", color: "#7c6cf0", match: (s) => s.includes("Screen") || s === "Under Review" },
  { key: "shortlisted", label: "Shortlisted", color: "#9b7bf0", match: (s) => s.includes("Shortlist") },
  { key: "interview", label: "Interview", color: "#22c55e", match: (s) => s.includes("Interview") },
  { key: "hired", label: "Hired", color: "#f59e0b", match: (s) => s === "Hired" || s === "Offer" },
];

function scoreTone(score: number) {
  if (score >= 80) return "text-emerald-500";
  if (score >= 60) return "text-amber-500";
  return "text-rose-500";
}

export default function PipelinePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const { open } = useDrawer();

  useEffect(() => {
    api<Candidate[]>("/candidates?sort=score")
      .then(setCandidates)
      .catch(() => setCandidates([]))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const cols: Record<string, Candidate[]> = {};
    for (const c of COLUMNS) cols[c.key] = [];
    for (const cand of candidates) {
      const col = COLUMNS.find((c) => c.match(cand.stage)) ?? COLUMNS[0];
      cols[col.key].push(cand);
    }
    return cols;
  }, [candidates]);

  function openCandidate(c: Candidate) {
    open({
      title: c.name,
      subtitle: c.job_title ?? "Candidate",
      node: (
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="a-muted">AI Score</span>
            <span className={`text-lg font-bold ${scoreTone(c.overall_score)}`}>{c.overall_score}</span>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase a-faint">Stage</p>
            <p className="a-text">{c.stage}</p>
          </div>
          {c.ai_summary && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase a-faint">AI Summary</p>
              <p className="a-muted">{c.ai_summary}</p>
            </div>
          )}
          {c.skills.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase a-faint">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {c.skills.slice(0, 12).map((s) => (
                  <span key={s} className="rounded-full a-accent-soft px-2 py-0.5 text-xs">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          <a href="/candidates" className="gradient-brand inline-block rounded-xl px-4 py-2 text-sm font-semibold text-white">
            Open in Candidates
          </a>
        </div>
      ),
    });
  }

  return (
    <div className="space-y-5 p-4 lg:p-6">
      <AdminPageHeader title="Pipeline" subtitle="Drag-free kanban of every candidate by hiring stage." />

      {loading ? (
        <p className="py-12 text-center text-sm a-faint">Loading pipeline…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {COLUMNS.map((col) => (
            <div key={col.key} className="a-card flex flex-col p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <span className="flex items-center gap-2 text-sm font-semibold a-text">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                  {col.label}
                </span>
                <span className="rounded-full a-surface-2 px-2 py-0.5 text-xs a-muted">{grouped[col.key].length}</span>
              </div>
              <div className="space-y-2">
                {grouped[col.key].length === 0 ? (
                  <p className="py-6 text-center text-xs a-faint">No candidates</p>
                ) : (
                  grouped[col.key].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => openCandidate(c)}
                      className="a-hover w-full rounded-xl border a-border p-3 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-medium a-text">{c.name}</p>
                        <span className={`text-sm font-semibold ${scoreTone(c.overall_score)}`}>{c.overall_score}</span>
                      </div>
                      <p className="truncate text-xs a-faint">{c.job_title ?? "—"}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
