"use client";

import { useState } from "react";
import { CheckCircle2, Copy, Link2, Lock, Send, Video } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Candidate, DispatchResult } from "@/lib/types";

export function DispatchActions({
  candidate,
  onDispatched,
}: {
  candidate: Candidate;
  onDispatched?: (c: Candidate) => void;
}) {
  const { hasModule } = useAuth();
  const examEnabled = hasModule("examPortal");
  const [meetingLink, setMeetingLink] = useState(candidate.meeting_link ?? "");
  const [result, setResult] = useState<DispatchResult | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(mode: "exam" | "meeting") {
    setBusy(mode);
    setError(null);
    try {
      const res = await api<DispatchResult>(`/candidates/${candidate.id}/dispatch`, {
        method: "POST",
        body: { mode, meeting_link: mode === "meeting" ? meetingLink : undefined },
      });
      setResult(res);
      const updated = await api<Candidate>(`/candidates/${candidate.id}`);
      onDispatched?.(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to dispatch");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-5 rounded-xl border border-line p-4">
      <p className="mb-3 text-[13px] font-semibold text-ink-900">Next step</p>

      {examEnabled ? (
        <Button className="w-full" onClick={() => run("exam")} disabled={!!busy}>
          <Send className="h-4 w-4" /> {busy === "exam" ? "Sending…" : "Send Assessment Exam"}
        </Button>
      ) : (
        <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-2.5 text-xs text-ink-500">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Exam portal is a Pro feature. Send a meeting link manually below, or upgrade your plan.
        </div>
      )}

      <div className="mt-3">
        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-ink-700">
          <Video className="h-3.5 w-3.5" /> Meeting link
        </p>
        <div className="flex gap-2">
          <Input
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            placeholder="https://meet.google.com/…"
          />
          <Button variant="secondary" onClick={() => run("meeting")} disabled={!!busy || !meetingLink}>
            {busy === "meeting" ? "Sending…" : "Send"}
          </Button>
        </div>
      </div>

      {error && <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}

      {result && (
        <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700">
          <p className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {result.mode === "exam" ? "Assessment sent" : "Meeting link sent"}
            {result.emailed && result.sent_to ? ` to ${result.sent_to}` : ""}
          </p>
          {result.link && (
            <div className="mt-2 flex items-center gap-2 rounded-md bg-white px-2 py-1.5 text-ink-600">
              <Link2 className="h-3.5 w-3.5 shrink-0 text-ink-400" />
              <span className="truncate">{result.link}</span>
              <button onClick={() => navigator.clipboard.writeText(result.link!)} className="ml-auto text-ink-400 hover:text-ink-700">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
