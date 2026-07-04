"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, Play, Video } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useDrawer } from "@/components/admin/ContextDrawer";
import { api } from "@/lib/api";
import type { Interview } from "@/lib/types";

const MEDIA_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(/\/api$/, "");

function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function RecordingsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const { open } = useDrawer();

  useEffect(() => {
    api<Interview[]>("/interviews")
      .then(setInterviews)
      .catch(() => setInterviews([]))
      .finally(() => setLoading(false));
  }, []);

  const recordings = useMemo(() => interviews.filter((i) => i.has_video && i.video_url), [interviews]);

  function play(i: Interview) {
    const src = i.video_url?.startsWith("http") ? i.video_url : `${MEDIA_BASE}${i.video_url}`;
    open({
      title: i.candidate_name,
      subtitle: i.job_title ?? i.interview_code,
      width: 560,
      node: (
        <div className="space-y-4">
          <video src={src} controls className="w-full rounded-xl border a-border" />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border a-border p-3">
              <p className="text-xs a-faint">AI Score</p>
              <p className="text-lg font-semibold a-text">{i.ai_score ?? "—"}</p>
            </div>
            <div className="rounded-xl border a-border p-3">
              <p className="text-xs a-faint">Proctoring</p>
              <p className="text-lg font-semibold a-text capitalize">{i.proctoring_status}</p>
            </div>
          </div>
        </div>
      ),
    });
  }

  return (
    <div className="space-y-5 p-4 lg:p-6">
      <AdminPageHeader title="Interview Recordings" subtitle="Replay recorded interviews with AI scores and proctoring." />

      {loading ? (
        <p className="py-12 text-center text-sm a-faint">Loading recordings…</p>
      ) : recordings.length === 0 ? (
        <div className="a-card flex flex-col items-center gap-3 py-16 text-center">
          <Video className="h-10 w-10 a-faint" />
          <p className="text-sm a-muted">No interview recordings yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {recordings.map((i) => (
            <button key={i.id} onClick={() => play(i)} className="a-card a-hover overflow-hidden text-left">
              <div className="relative flex aspect-video items-center justify-center bg-[#11132b]">
                <Play className="h-10 w-10 text-white/80" />
                <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                  <Clock className="h-3 w-3" /> {fmtDuration(i.duration_sec)}
                </span>
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-semibold a-text">{i.candidate_name}</p>
                <p className="truncate text-xs a-faint">{i.job_title ?? i.interview_code}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
