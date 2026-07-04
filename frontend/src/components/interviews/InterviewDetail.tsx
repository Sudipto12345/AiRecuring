"use client";

import { useRef, useState } from "react";
import { Cpu, MapPin, Monitor, ScanFace, ShieldAlert, ShieldCheck, UploadCloud, UserCheck, Users, Video, X } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MetricBar } from "@/components/ui/ProgressBar";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { getToken } from "@/lib/api";
import type { Interview } from "@/lib/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const ORIGIN = API.replace(/\/api\/?$/, "");

function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

const SCORE_LABELS: Record<string, string> = {
  communication: "Communication",
  technical: "Technical Skills",
  problem_solving: "Problem Solving",
  coding: "Coding (if any)",
};

export function InterviewDetail({
  interview,
  onClose,
  onUploaded,
}: {
  interview: Interview;
  onClose?: () => void;
  onUploaded?: (i: Interview) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch(`${API}/interviews/${interview.id}/video`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: form,
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.detail || "Upload failed");
      }
      onUploaded?.(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const face = interview.face;
  const riskTone = face?.risk_level === "high" ? "rose" : face?.risk_level === "medium" ? "amber" : "green";

  return (
    <div className="relative p-5">
      {onClose && (
        <button onClick={onClose} className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 hover:bg-slate-100">
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="pr-8">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-ink-900">{interview.candidate_name}</h3>
          <Badge tone={interview.status === "Completed" ? "green" : interview.status === "In Progress" ? "amber" : "slate"}>
            {interview.status}
          </Badge>
        </div>
        <p className="text-sm text-ink-500">{interview.job_title}</p>
        <p className="mt-0.5 text-xs text-ink-400">{interview.interview_code}</p>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl bg-[#0f1230]">
        {interview.has_video && interview.video_url ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video controls className="aspect-video w-full" src={`${ORIGIN}${interview.video_url}`} />
        ) : (
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 text-white/70">
            <Video className="h-8 w-8" />
            <p className="text-xs">No recording uploaded</p>
            <Button size="sm" onClick={() => inputRef.current?.click()} disabled={busy}>
              <UploadCloud className="h-4 w-4" /> {busy ? "Analyzing…" : "Upload video"}
            </Button>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
        />
      </div>

      {error && <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}

      {interview.ai_score !== null && (
        <div className="mt-4 flex items-center gap-4 rounded-xl border border-line p-4">
          <ScoreRing score={interview.ai_score} size={64} />
          <div className="flex-1 space-y-2">
            {Object.entries(interview.scores).map(([k, v]) => (
              <MetricBar key={k} label={SCORE_LABELS[k] ?? k} value={Math.round(v)} />
            ))}
          </div>
        </div>
      )}

      {face && (
        <div className="mt-4 rounded-xl border border-line p-4">
          <p className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold text-ink-900">
            <ScanFace className="h-4 w-4 text-brand-500" /> Facial Recognition
          </p>
          <div
            className={`mb-3 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm ${
              face.identity_verified === true
                ? "bg-emerald-50 text-emerald-700"
                : face.identity_verified === false
                  ? "bg-rose-50 text-rose-700"
                  : "bg-slate-50 text-ink-500"
            }`}
          >
            {face.identity_verified === true ? (
              <UserCheck className="h-4 w-4" />
            ) : face.identity_verified === false ? (
              <ShieldAlert className="h-4 w-4" />
            ) : (
              <ScanFace className="h-4 w-4" />
            )}
            <span className="font-medium">
              {face.identity_verified === true
                ? "Identity verified against reference photo"
                : face.identity_verified === false
                  ? "Identity does NOT match reference photo"
                  : "No reference photo — identity not verified"}
            </span>
            {face.identity_verified !== null && (
              <span className="ml-auto font-semibold">{face.identity_match_score}%</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 text-center text-xs">
            <Stat label="Identity Consistency" value={`${face.identity_consistency}%`} />
            <div className="rounded-lg bg-slate-50 px-2 py-2">
              <p className="flex items-center justify-center gap-1 text-sm font-semibold text-ink-900">
                <Users className="h-3.5 w-3.5 text-ink-400" /> {face.distinct_identities}
              </p>
              <p className="text-[10px] text-ink-400">People Detected</p>
            </div>
          </div>
          {face.distinct_identities > 1 && (
            <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">
              <ShieldAlert className="h-3.5 w-3.5" /> Possible impersonation: more than one person appears in the recording.
            </p>
          )}
        </div>
      )}

      {face && (
        <div className="mt-4 rounded-xl border border-line p-4">
          <p className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold text-ink-900">
            <ShieldCheck className="h-4 w-4 text-brand-500" /> AI Proctoring
          </p>
          <div className="grid grid-cols-2 gap-3 text-center text-xs">
            <Stat label="Face Detected" value={face.face_detected ? "Yes" : "No"} />
            <Stat label="Focus Score" value={`${face.focus_score}%`} />
            <Stat label="Integrity" value={`${face.integrity_score}%`} />
            <div className="rounded-lg bg-slate-50 px-2 py-2">
              <Badge tone={riskTone}>{face.risk_level} risk</Badge>
            </div>
          </div>
          {face.events.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {face.events.map((e) => (
                <li key={e.type} className="flex items-center justify-between text-xs">
                  <span className="text-ink-500">{e.type}</span>
                  <span className="font-semibold text-ink-700">{e.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-4 space-y-2.5 text-sm">
        <Row icon={Cpu} label="Type" value={`${interview.interview_type} · ${interview.mode}`} />
        <Row icon={Video} label="Duration" value={interview.duration_sec ? fmtDuration(interview.duration_sec) : "—"} />
        <Row icon={Monitor} label="Device" value={interview.device ?? "—"} />
        <Row icon={MapPin} label="Location" value={interview.location ?? "—"} />
        <Row icon={ShieldCheck} label="Proctoring" value={interview.proctoring_status} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-2 py-2">
      <p className="text-sm font-semibold text-ink-900">{value}</p>
      <p className="text-[10px] text-ink-400">{label}</p>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Cpu; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-ink-500"><Icon className="h-4 w-4 text-ink-400" /> {label}</span>
      <span className="text-right font-medium text-ink-800">{value}</span>
    </div>
  );
}
