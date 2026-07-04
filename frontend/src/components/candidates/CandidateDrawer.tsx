"use client";

import { useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Mail, MapPin, Phone, ScanFace, Sparkles, Users, X } from "lucide-react";

import { DispatchActions } from "@/components/candidates/DispatchActions";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, StageBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MetricBar } from "@/components/ui/ProgressBar";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { Select } from "@/components/ui/Field";
import { SkillChip } from "@/components/ui/SkillChip";
import { api, getToken } from "@/lib/api";
import type { Candidate } from "@/lib/types";

interface SimilarHit {
  candidate_id: string;
  name: string | null;
  overall_score: number;
  similarity: number;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const ORIGIN = API.replace(/\/api\/?$/, "");

const STAGES = ["Applied", "AI Screened", "AI Shortlisted", "Interview Scheduled", "Offer", "Hired", "Rejected"];

const DRAWER_TABS = ["AI Summary", "Parsed Data", "Resume", "Timeline"] as const;

export function CandidateDetail({
  candidate,
  onClose,
  onStageChange,
  allowDispatch,
  onDispatched,
  onUpdated,
}: {
  candidate: Candidate;
  onClose?: () => void;
  onStageChange?: (id: string, stage: string) => void;
  allowDispatch?: boolean;
  onDispatched?: (c: Candidate) => void;
  onUpdated?: (c: Candidate) => void;
}) {
  const s = candidate.scores;
  const photoRef = useRef<HTMLInputElement>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [similar, setSimilar] = useState<SimilarHit[] | null>(null);
  const [similarBusy, setSimilarBusy] = useState(false);
  const [tab, setTab] = useState<(typeof DRAWER_TABS)[number]>("AI Summary");

  async function findSimilar() {
    setSimilarBusy(true);
    try {
      setSimilar(await api<SimilarHit[]>(`/candidates/${candidate.id}/similar`));
    } catch {
      setSimilar([]);
    } finally {
      setSimilarBusy(false);
    }
  }

  async function uploadPhoto(file: File) {
    setPhotoBusy(true);
    setPhotoError(null);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch(`${API}/candidates/${candidate.id}/photo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: form,
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.detail || "Upload failed");
      }
      (onUpdated ?? onDispatched)?.(await res.json());
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setPhotoBusy(false);
    }
  }

  return (
    <div className="relative p-5">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 hover:bg-slate-100 hover:text-ink-700"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="flex items-start gap-3 pr-8">
        <Avatar name={candidate.name} src={candidate.photo_url ? `${ORIGIN}${candidate.photo_url}` : undefined} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-ink-900">{candidate.name}</h3>
          <p className="truncate text-sm text-ink-500">{candidate.job_title}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <StageBadge stage={candidate.stage} />
            {candidate.has_reference_photo && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                <ScanFace className="h-3 w-3" /> ID on file
              </span>
            )}
          </div>
        </div>
        <ScoreRing score={candidate.overall_score} size={64} />
      </div>

      <div className="mt-3">
        <button
          onClick={() => photoRef.current?.click()}
          disabled={photoBusy}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-line py-2 text-xs font-medium text-ink-500 hover:border-brand-300 hover:text-brand-600"
        >
          <ScanFace className="h-3.5 w-3.5" />
          {photoBusy ? "Analyzing face…" : candidate.has_reference_photo ? "Replace identity photo" : "Add identity photo for verification"}
        </button>
        <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
        {photoError && <p className="mt-1 text-[11px] text-rose-600">{photoError}</p>}
      </div>

      <div className="mt-4 space-y-1.5 text-sm text-ink-600">
        {candidate.email && <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-ink-400" /> {candidate.email}</p>}
        {candidate.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-ink-400" /> {candidate.phone}</p>}
        {candidate.location && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-ink-400" /> {candidate.location}</p>}
      </div>

      <div className="mt-4 flex gap-1 border-b border-line">
        {DRAWER_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-3 py-2 text-xs font-medium transition ${
              tab === t ? "border-brand-600 text-brand-700" : "border-transparent text-ink-400 hover:text-ink-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "AI Summary" && (
        <>
      <div className="mt-5 rounded-xl border border-line p-4">
        <p className="mb-3 text-[13px] font-semibold text-ink-900">AI Score Overview</p>
        <div className="space-y-2.5">
          <MetricBar label="Skill Match" value={Math.round(s.skill ?? 0)} />
          <MetricBar label="Experience" value={Math.round(s.experience ?? 0)} tone="green" />
          <MetricBar label="Education" value={Math.round(s.education ?? 0)} tone="amber" />
          <MetricBar label="Culture Fit" value={Math.round(s.culture ?? 0)} />
        </div>
      </div>

      {candidate.ai_summary && (
        <div className="mt-4 rounded-xl bg-brand-50/60 p-4">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-brand-700"><Sparkles className="h-4 w-4" /> AI Summary</p>
          <p className="mt-1.5 text-sm text-ink-600">{candidate.ai_summary}</p>
        </div>
      )}

      {(candidate.matched_skills.length > 0 || candidate.missing_skills.length > 0) && (
        <div className="mt-4">
          <p className="mb-2 text-[13px] font-semibold text-ink-900">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {candidate.matched_skills.map((sk) => <SkillChip key={sk} label={sk} matched />)}
            {candidate.missing_skills.map((sk) => <SkillChip key={sk} label={sk} />)}
          </div>
        </div>
      )}

      {candidate.strengths.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[13px] font-semibold text-ink-900">Key Strengths</p>
          <ul className="space-y-1.5">
            {candidate.strengths.map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm text-ink-600">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {candidate.risks.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[13px] font-semibold text-ink-900">Potential Gaps</p>
          <div className="flex flex-wrap gap-1.5">
            {candidate.risks.map((t) => (
              <Badge key={t} tone="amber"><AlertTriangle className="h-3 w-3" /> {t}</Badge>
            ))}
          </div>
        </div>
      )}
        </>
      )}

      {tab === "Parsed Data" && (
        <div className="mt-4 space-y-2 text-sm text-ink-600">
          <p><span className="font-medium text-ink-800">Name:</span> {candidate.name}</p>
          <p><span className="font-medium text-ink-800">Email:</span> {candidate.email || "—"}</p>
          <p><span className="font-medium text-ink-800">Phone:</span> {candidate.phone || "—"}</p>
          <p><span className="font-medium text-ink-800">Location:</span> {candidate.location || "—"}</p>
          <p><span className="font-medium text-ink-800">Experience:</span> {candidate.experience_years ?? "—"} years</p>
        </div>
      )}

      {tab === "Resume" && (
        <div className="mt-4 rounded-xl border border-line p-4 text-sm text-ink-600">
          <p>Resume parsed from uploaded CV ({candidate.source || "upload"}).</p>
          <p className="mt-2 text-xs text-ink-400">Original file is stored in company object storage.</p>
        </div>
      )}

      {tab === "Timeline" && (
        <div className="mt-4 space-y-3">
          <div className="flex gap-3 text-sm">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
            <div>
              <p className="font-medium text-ink-800">Added to pipeline</p>
              <p className="text-xs text-ink-400">{new Date(candidate.added_on).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex gap-3 text-sm">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
            <div>
              <p className="font-medium text-ink-800">Current stage: {candidate.stage}</p>
              <p className="text-xs text-ink-400">AI score {candidate.overall_score.toFixed(1)}</p>
            </div>
          </div>
        </div>
      )}

      {tab === "AI Summary" && allowDispatch && <DispatchActions candidate={candidate} onDispatched={onDispatched} />}

      {tab === "AI Summary" && (
      <div className="mt-5 rounded-xl border border-line p-4">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink-900">
            <Users className="h-4 w-4 text-brand-500" /> Similar Candidates
          </p>
          <button onClick={findSimilar} disabled={similarBusy} className="text-xs font-medium text-brand-600 hover:underline">
            {similarBusy ? "Searching…" : "Find similar"}
          </button>
        </div>
        {similar !== null && (
          <div className="mt-3 space-y-2">
            {similar.length === 0 ? (
              <p className="text-xs text-ink-400">No similar candidates found yet.</p>
            ) : (
              similar.map((m) => (
                <div key={m.candidate_id} className="flex items-center justify-between text-sm">
                  <span className="truncate text-ink-700">{m.name}</span>
                  <span className="ml-2 shrink-0 text-xs font-medium text-brand-600">{m.similarity}% match</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      )}

      <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2 text-[11px] text-blue-800">
        AI scores are hints — HR still signs off.
      </div>

      <div className="mt-6 space-y-2">
        {onStageChange && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-ink-700">Move stage</p>
            <Select
              value={STAGES.includes(candidate.stage) ? candidate.stage : "Applied"}
              onChange={(e) => onStageChange(candidate.id, e.target.value)}
            >
              {STAGES.map((st) => <option key={st} value={st}>{st}</option>)}
            </Select>
          </div>
        )}
        <Button className="w-full gradient-brand">View Full AI Report</Button>
      </div>
    </div>
  );
}

export function CandidateDrawer({
  candidate,
  open,
  onClose,
  onStageChange,
  allowDispatch,
  onDispatched,
  onUpdated,
}: {
  candidate: Candidate | null;
  open: boolean;
  onClose: () => void;
  onStageChange?: (id: string, stage: string) => void;
  allowDispatch?: boolean;
  onDispatched?: (c: Candidate) => void;
  onUpdated?: (c: Candidate) => void;
}) {
  if (!open || !candidate) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink-900/30" onClick={onClose} />
      <aside className="animate-drawer absolute right-0 top-0 h-full w-[90%] max-w-md overflow-y-auto bg-white shadow-pop">
        <CandidateDetail
          candidate={candidate}
          onClose={onClose}
          onStageChange={onStageChange}
          allowDispatch={allowDispatch}
          onDispatched={onDispatched}
          onUpdated={onUpdated}
        />
      </aside>
    </div>
  );
}
