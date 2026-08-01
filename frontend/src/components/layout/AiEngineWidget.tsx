"use client";

import { useEffect, useState } from "react";
import { Cpu } from "lucide-react";

import { api } from "@/lib/api";
import type { SystemHealth } from "@/lib/types";

interface Subsystem {
  label: string;
  ok: boolean;
  detail?: string;
}

/** Derive the AI subsystem matrix from the backend service health report. */
function deriveSubsystems(h: SystemHealth | null): Subsystem[] {
  const find = (k: string) => h?.services.find((s) => s.key === k);
  const llm = find("llm");
  const qdrant = find("qdrant");
  const redis = find("redis");
  const minio = find("minio");
  const mongo = find("mongodb");
  const api = find("api");
  return [
    { label: "LLM / NLP", ok: !!llm?.ok, detail: llm?.detail },
    { label: "Vision / Face", ok: !!(api?.ok && mongo?.ok), detail: "OpenCV DNN" },
    { label: "OCR", ok: !!api?.ok, detail: "resume text" },
    { label: "Embeddings", ok: !!qdrant?.ok, detail: qdrant?.detail },
    { label: "Vector Search", ok: !!qdrant?.ok, detail: "Qdrant" },
    { label: "Queue / Workers", ok: !!redis?.ok, detail: redis?.detail },
    { label: "Storage", ok: !!minio?.ok, detail: minio?.detail },
    { label: "Database", ok: !!mongo?.ok, detail: mongo?.detail },
  ];
}

export function AiEngineWidget({ variant = "compact" }: { variant?: "compact" | "full" }) {
  const [health, setHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = () =>
      api<SystemHealth>("/system/health", { auth: false })
        .then((d) => mounted && setHealth(d))
        .catch(() => {});
    load();
    const id = setInterval(load, 20000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const subs = deriveSubsystems(health);
  const allOk = subs.length > 0 && subs.every((s) => s.ok);
  const shown = variant === "compact" ? subs.slice(0, 4) : subs;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#11132b] p-4 text-white">
      <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-violet-500/30 blur-2xl" />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
            <Cpu className="h-4 w-4 text-violet-300" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">AI Engine</p>
            <p className="text-[11px] text-white/60">{allOk ? "All systems operational" : health ? "Degraded performance" : "Checking…"}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
            allOk ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/15 text-amber-300"
          }`}
        >
          <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${allOk ? "bg-emerald-400" : "bg-amber-400"}`} /> Live
        </span>
      </div>
      <ul className={`relative mt-3 ${variant === "full" ? "grid grid-cols-2 gap-x-4 gap-y-2" : "space-y-2"}`}>
        {shown.map((s) => (
          <li key={s.label} className="flex items-center justify-between text-[11px]">
            <span className="text-white/70">{s.label}</span>
            <span className="inline-flex items-center gap-1.5 text-white/80">
              <span className={`h-1.5 w-1.5 rounded-full ${s.ok ? "bg-emerald-400" : "bg-rose-400"}`} />
              {s.ok ? "Online" : "Down"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
